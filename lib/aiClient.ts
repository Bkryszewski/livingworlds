// lib/aiClient.ts — BYOK (bring-your-own-key) AI engine, ported from the
// Living Worlds prototype's LLM router.
//
// KEY POINT: these calls run in the PLAYER'S browser using the PLAYER'S own
// API key. Nobody else is billed — the studio pays nothing for AI usage. The
// key never touches a server we run; it stays in the player's browser and is
// sent only to the provider they chose. This is standard for BYOK and is why
// the AI engine defaults OFF (the scripted free mode covers everyone else).

import type { AIConfig, Role, World, AssistanceLevel, Lang } from "./types";
import { buildSystemPrompt, buildCutPrompt } from "./prompts";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

/** Low-level provider router. Mirrors the prototype's callLLM. */
async function callLLM(
  cfg: AIConfig,
  system: string,
  messages: Msg[],
  maxTokens = 1000
): Promise<string> {
  const key = cfg.key.trim();
  if (!key) throw new Error("No API key set — open the AI engine and add one.");

  // --- Anthropic ---
  if (cfg.provider === "anthropic") {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        // Allows the call to be made directly from the browser with the
        // player's own key. (BYOK only — no studio key is ever exposed.)
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: cfg.model.trim() || "claude-sonnet-4-6",
        max_tokens: maxTokens,
        system,
        messages,
      }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message || "Anthropic error");
    return (data.content || [])
      .filter((b: { type: string }) => b.type === "text")
      .map((b: { text: string }) => b.text)
      .join("\n")
      .trim();
  }

  // --- Gemini ---
  if (cfg.provider === "gemini") {
    const model = cfg.model.trim() || "gemini-1.5-flash";
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/" +
        model +
        ":generateContent?key=" +
        encodeURIComponent(key),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: messages.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          })),
          generationConfig: { maxOutputTokens: maxTokens },
        }),
      }
    );
    const data = await res.json();
    if (data.error) throw new Error(data.error.message || "Gemini error");
    return (
      (data.candidates?.[0]?.content?.parts || [])
        .map((x: { text: string }) => x.text)
        .join("")
        .trim() || ""
    );
  }

  // --- OpenAI-compatible: openai / azure / custom ---
  let url: string;
  let headers: Record<string, string>;
  if (cfg.provider === "azure") {
    url =
      (cfg.azureEndpoint || "").trim().replace(/\/+$/, "") +
      "/openai/deployments/" +
      (cfg.azureDeployment || "").trim() +
      "/chat/completions?api-version=" +
      (cfg.azureVersion?.trim() || "2024-02-15-preview");
    headers = { "Content-Type": "application/json", "api-key": key };
  } else if (cfg.provider === "custom") {
    url =
      (cfg.baseUrl || "").trim().replace(/\/+$/, "") + "/chat/completions";
    headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + key,
    };
  } else {
    url = "https://api.openai.com/v1/chat/completions";
    headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + key,
    };
  }

  const body: Record<string, unknown> = {
    max_tokens: maxTokens,
    messages: [{ role: "system", content: system }, ...messages],
  };
  if (cfg.provider !== "azure") {
    body.model = cfg.model.trim() || (cfg.provider === "openai" ? "gpt-4o-mini" : "");
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error?.message || "LLM error");
  return (data.choices?.[0]?.message?.content || "").trim();
}

export interface TurnContext {
  cfg: AIConfig;
  world: World;
  role: Role;
  assistance: AssistanceLevel;
  lang: Lang;
  discovered: string[];
  mode: "text" | "call";
  playerName?: string;
}

/** Studio fallback: post to our own /api/ai route, which uses the server key. */
async function callServer(
  kind: "chat" | "cut",
  ctx: TurnContext,
  history: Msg[]
): Promise<string> {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      worldId: ctx.world.id,
      roleId: ctx.role.id,
      assistance: ctx.assistance,
      lang: ctx.lang,
      discovered: ctx.discovered,
      history,
      mode: ctx.mode,
      playerName: ctx.playerName,
      kind,
    }),
  });
  let data: { text?: string; error?: string };
  try {
    data = await res.json();
  } catch {
    throw new Error("AI server returned an unreadable response");
  }
  if (!res.ok || data.error) {
    throw new Error(
      data.error ||
        "AI is on but no key is configured — add your own key in the AI engine, or have the studio set one."
    );
  }
  return (data.text || "").trim();
}

/** One in-character turn. */
export async function aiTurn(
  ctx: TurnContext,
  history: Msg[]
): Promise<string> {
  // BYOK first: if the player supplied their own key, call the provider
  // directly from their browser. Otherwise use the studio's server route
  // (app/api/ai), powered by the key set in Vercel env vars.
  if (ctx.cfg.key.trim()) {
    const system = buildSystemPrompt({
      world: ctx.world,
      role: ctx.role,
      assistance: ctx.assistance,
      lang: ctx.lang,
      discovered: ctx.discovered,
      mode: ctx.mode,
      playerName: ctx.playerName,
    });
    const reply = await callLLM(ctx.cfg, system, history, 1000);
    if (!reply) throw new Error("empty reply");
    return reply;
  }
  const reply = await callServer("chat", ctx, history);
  if (!reply) throw new Error("empty reply");
  return reply;
}

/** The closing "Your Cut" narration. */
export async function aiCut(
  ctx: TurnContext,
  history: Msg[]
): Promise<string> {
  if (ctx.cfg.key.trim()) {
    const system = buildCutPrompt({
      world: ctx.world,
      role: ctx.role,
      assistance: ctx.assistance,
      lang: ctx.lang,
      discovered: ctx.discovered,
    });
    return callLLM(
      ctx.cfg,
      system,
      history.length ? history : [{ role: "user", content: "(end)" }],
      600
    );
  }
  return callServer("cut", ctx, history);
}

/** Quick connection test for the settings panel. */
export async function aiTest(cfg: AIConfig): Promise<string> {
  const r = await callLLM(
    cfg,
    "Connection test. Reply with exactly: ok",
    [{ role: "user", content: "ping" }],
    10
  );
  return r;
}
