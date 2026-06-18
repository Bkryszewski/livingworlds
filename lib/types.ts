// lib/types.ts — shared domain types for Living Worlds.

export type Lang = "en" | "es";

export type AssistanceLevel = "Guided" | "Balanced" | "Independent" | "Expert";

export type PassTier =
  | "Guest Pass"
  | "Festival Pass"
  | "Judge's Credential"
  | "Studio Pass";

/** A narrative role the audience can step into within a world. */
export interface Role {
  id: string;
  label: string;
  /** One-line hook shown on the role card. */
  tagline: string;
  /** What this role is trying to accomplish in-world. */
  objective: string;
  /** The character's first line, specific to this role. */
  opener: string;
  /** How the protagonist relates to the player in this role. */
  stance: string;
  /** True for the "Conflict Creator" role: the player works against the truth. */
  adversary?: boolean;
  /** Which evidence tags this role is allowed to surface from the Archive. */
  clueTags: string[];
}

/** A piece of discoverable evidence in a world's Archive. */
export interface Clue {
  id: string;
  /** Keywords that surface this clue when searched. */
  keys: string[];
  /** Tags used for role-gating (matched against Role.clueTags). */
  tags: string[];
  title: string;
  body: string;
  /** Shadow clues read as the surface story; deeper truth stays gated. */
  shadow?: boolean;
}

/** Per-language audience-facing copy for a world. */
export interface WorldCopy {
  /** Short genre/format subtitle, e.g. "Supernatural · interactive short". */
  subtitle: string;
  /** One-sentence logline on the world card. */
  logline: string;
  /** Longer synopsis on the world detail screen. */
  synopsis: string;
}

export interface World {
  id: string;
  title: string;
  /** Protagonist name (the live AI character). */
  character: string;
  genre: string;
  /** Hex accent that themes the world. */
  accent: string;
  /** Placeholder poster path under /public/assets — replace with real art. */
  poster: string;
  /** Placeholder trailer path under /public/assets — replace with real trailer. */
  trailer: string;
  tone: string;
  /** Which pass unlocks this world. */
  passTier: PassTier;
  /** True for "coming soon" worlds shown but not yet playable. */
  locked?: boolean;

  // --- AI engine fields (sent to the server, never restyled) ---
  /** Establishes who the character is. */
  intro: string;
  /** Visible canon the character can speak freely about. */
  canon: string;
  /** Hidden canon — only revealed once the matching clue is discovered. */
  hiddenCanon: string;
  /** Voice/tone instruction for the character. */
  voice: string;
  /** Fallback opener if a role has none. */
  defaultOpener: string;

  roles: Role[];
  archive: Clue[];

  /** Localized audience copy. */
  copy: Record<Lang, WorldCopy>;
}

export type Stage =
  | "boot"
  | "hero"
  | "onboard"
  | "selector"
  | "world"
  | "role"
  | "assistance"
  | "player"
  | "cut"
  | "boxoffice"
  | "dashboard";

export interface ChatMessage {
  role: "character" | "user" | "finding" | "system";
  text: string;
}

// ---------------------------------------------------------------------------
// SCRIPTED (free / no-AI) MODE
// A guided playthrough authored from the original screenplay. The protagonist
// speaks pre-written lines; the player picks from offered responses; clues
// surface and the gated reveal lands at the authored beat. No key, no cost.
// ---------------------------------------------------------------------------

export interface ScriptChoice {
  /** What the player taps / "says". */
  label: string;
  /** Id of the next node. */
  to: string;
  /** Optional clue id to unlock when this choice is taken. */
  unlock?: string;
}

export interface ScriptNode {
  id: string;
  /** The protagonist's lines for this beat (each renders as its own bubble). */
  lines: string[];
  /** Player options. Omit (or empty) on a terminal/ending node. */
  choices?: ScriptChoice[];
  /** Clue id unlocked simply by reaching this node. */
  unlock?: string;
  /** Marks the authored gated reveal beat (for styling / pacing). */
  reveal?: boolean;
  /** Terminal node — offers the "Your Cut" close. */
  ending?: boolean;
}

export interface WorldScript {
  /** Node id the playthrough starts on (after the role opener). */
  start: string;
  nodes: Record<string, ScriptNode>;
}

// ---------------------------------------------------------------------------
// BYOK AI ENGINE
// When the player turns AI on, the call goes directly from their browser to
// their chosen provider using THEIR key — nobody else is billed.
// ---------------------------------------------------------------------------

export type AIProvider =
  | "anthropic"
  | "openai"
  | "gemini"
  | "azure"
  | "custom";

export interface AIConfig {
  /** Master switch. When false, the scripted free mode runs. */
  enabled: boolean;
  provider: AIProvider;
  /** The player's own API key. Lives only in their browser. */
  key: string;
  /** Optional model override. */
  model: string;
  /** Azure-only. */
  azureEndpoint?: string;
  azureDeployment?: string;
  azureVersion?: string;
  /** OpenAI-compatible custom base URL. */
  baseUrl?: string;
}

export const DEFAULT_AI_CONFIG: AIConfig = {
  enabled: false,
  provider: "anthropic",
  key: "",
  model: "",
};
