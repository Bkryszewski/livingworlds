// app/api/ai/route.ts — server-side AI engine for Living Worlds.
// The provider API key is read from environment variables and NEVER sent to
// the browser. The client posts world/role/assistance/language + conversation;
// this route assembles the system prompt and returns the character's reply.

import { NextRequest, NextResponse } from "next/server";
import { getWorld } from "@/data/worlds";
import { buildSystemPrompt, buildCutPrompt } from "@/lib/prompts";
import type { AssistanceLevel, Lang } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  worldId: string;
  roleId: string;
  assistance: AssistanceLevel;
  lang: Lang;
  discovered?: string[];
  history?: { role: "user" | "assistant"; content: string }[];
  message?: string;
  mode?: "text" | "call";
  playerName?: string;
  /** "chat" (default) or "cut" for the closing summary. */
  kind?: "chat" | "cut";
}

const MAX_TOKENS = 800;

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const world = getWorld(body.worldId);
  if (!world) return NextResponse.json({ error: "Unknown world" }, { status: 404 });

  const role =
    world.roles.find((r) => r.id === body.roleId) || world.roles[0];
  if (!role)
    return NextResponse.json({ error: "World has no roles" }, { status: 400 });

  const ctx = {
    world,
    role,
    assistance: body.assistance || "Balanced",
    lang: body.lang || "en",
    discovered: body.discovered || [],
    mode: body.mode || "text",
    playerName: body.playerName,
  };

  const system =
    body.kind === "cut" ? buildCutPrompt(ctx) : buildSystemPrompt(ctx);

  const history = body.history || [];
  const messages =
    body.kind === "cut"
      ? [...history, { role: "user" as const, content: "Write the closing 'Your Cut'." }]
      : body.message
      ? [...history, { role: "user" as const, content: body.message }]
      : history;

  try {
    const text = await callProvider({ system, messages });
    return NextResponse.json({ text });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "AI request failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}

async function callProvider({
  system,
  messages,
}: {
  system: string;
  messages: { role: "user" | "assistant"; content: string }[];
}): Promise<string> {
  const provider = (process.env.AI_PROVIDER || "anthropic").toLowerCase();

  if (provider === "openai") {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error("OPENAI_API_KEY is not set on the server.");
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        max_tokens: MAX_TOKENS,
        messages: [{ role: "system", content: system }, ...messages],
      }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message || "OpenAI error");
    return (data.choices?.[0]?.message?.content || "").trim();
  }

  // Default: Anthropic
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set on the server.");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
      max_tokens: MAX_TOKENS,
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
