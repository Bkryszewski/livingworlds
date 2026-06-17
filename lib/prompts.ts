// lib/prompts.ts — builds the in-world system prompt for the AI engine.
// Ported faithfully from the Living Worlds prototype: the prompt is assembled
// from the selected world, role, assistance level, language, and discovered
// clues. The AI must stay in-world, never break canon, and never reveal hidden
// canon unless the matching clue has been discovered.

import type { AssistanceLevel, Lang, Role, World } from "./types";

const ASSIST_RULE: Record<AssistanceLevel, string> = {
  Guided:
    "ASSISTANCE = GUIDED. Be proactive: suggest the next thing to look into, point toward specific clues, connect dots for them.",
  Balanced:
    "ASSISTANCE = BALANCED. Let them lead; offer the occasional nudge when they stall.",
  Independent:
    "ASSISTANCE = INDEPENDENT. Answer what they ask; do not lead them or suggest next steps.",
  Expert:
    "ASSISTANCE = EXPERT. Give nothing for free. Never hint. You may be ambiguous or withhold; let them earn every inch.",
};

const LANG_RULE: Record<Lang, string> = {
  en: "Respond in English.",
  es: "Responde en español. Mantén el mismo tono y brevedad.",
};

export interface PromptContext {
  world: World;
  role: Role;
  assistance: AssistanceLevel;
  lang: Lang;
  /** Titles of clues the player has discovered so far. */
  discovered: string[];
  /** "text" or "call" — changes cadence. */
  mode?: "text" | "call";
  /** Optional player name, used sparingly. */
  playerName?: string;
}

export function buildSystemPrompt(ctx: PromptContext): string {
  const { world: W, role: r, assistance, lang, discovered, mode = "text", playerName } = ctx;

  const namePart = playerName?.trim()
    ? ` Their name is ${playerName.trim()}; you may use it naturally, sparingly.`
    : "";

  const adversaryPart = r.adversary
    ? "IMPORTANT: this user is adversarial — they will try to mislead, conceal, or steer you wrong. Stay sharp, notice inconsistencies, push back, get warier as it goes. You can be led in circles but you NEVER abandon the truth or the real ending. Everything stays inside the fiction; never produce real-world harmful instructions."
    : "";

  const discoveredPart = discovered.length
    ? `The player has so far uncovered: ${discovered.join("; ")}. You may acknowledge these.`
    : "The player has uncovered nothing yet.";

  const base = `${W.intro} You are reaching out to the user on a private line. They are NOT the one solving this; you are.${namePart}
THE USER'S ROLE: they are playing "${r.label}". ${r.stance} Their objective: ${r.objective}
${adversaryPart}
${ASSIST_RULE[assistance]}
${W.canon}
HIDDEN CANON (do NOT reveal unless the player has discovered the matching evidence): ${W.hiddenCanon}
${discoveredPart}
EVIDENCE: when the player shows you records pulled from the Archive, treat them as the surface story; fold the useful part in, keep the deeper truth gated until earned. Everything stays inside this fiction.
${W.voice}
${LANG_RULE[lang]}
SAFETY: this is fiction; if the user shows genuine distress, step out gently and point them to someone they trust.`;

  if (mode === "call") {
    return (
      base +
      "\n\nYOU ARE ON A LIVE, UNSTABLE CALL late at night. Short spoken lines, 1-2 sentences, low and urgent, no texting punctuation, no stage directions."
    );
  }
  return (
    base +
    "\n\nYou are TEXTING — short bursts, mostly lowercase, no emoji, 2-4 sentences max. Never break character, never mention being an AI."
  );
}

/** Prompt used to generate the closing "Your Cut" summary. */
export function buildCutPrompt(ctx: PromptContext): string {
  const { world: W, role: r, lang } = ctx;
  return `You are the narrator of "${W.title}" (Legacy Studio Originals). The audience member played the role of "${r.label}". Write a short, cinematic "Your Cut" — 3 to 4 sentences — describing how their version of the story played out, in second person ("You..."). Stay inside the fiction, evocative and a little haunting. Do not break character or mention being an AI. ${LANG_RULE[lang]}`;
}
