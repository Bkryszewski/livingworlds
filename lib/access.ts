// lib/access.ts — pass-tier entitlements: what each tier can play, and where
// to send buyers to upgrade. The actual tier lives on the signed-in person's
// profile (set by the SamCart webhook in Phase 2; "guest" for everyone until
// then). This file decides what that tier unlocks.

export type Tier = "guest" | "festival" | "judge" | "studio";

const RANK: Record<string, number> = {
  guest: 0,
  festival: 1,
  judge: 2,
  studio: 3,
};

// ─────────────────────────────────────────────────────────────────────────
// THE FREE SAMPLER. A Guest Pass can play exactly the world(s) listed here.
// Change "perdido" to feature a different world as the free hook. Everything
// else requires the Festival Pass (or higher).
// ─────────────────────────────────────────────────────────────────────────
export const FREE_WORLD_IDS = ["perdido"];

// ─────────────────────────────────────────────────────────────────────────
// SAMCART CHECKOUT LINKS. Two one-time, time-boxed Festival passes:
//   festival_year  → $24.99, 365 days of access
//   festival_30day → $4.99, 30 days of access
// Paste each product's checkout URL between its quotes. While a link is
// blank, its button tells the person checkout isn't ready (never grants free).
// ─────────────────────────────────────────────────────────────────────────
export const SAMCART_CHECKOUT: Record<string, string> = {
  festival_year: "",
  festival_30day: "",
  judge: "",
  studio: "",
};

/** Minimum tier required to play a given world. */
export function requiredTier(worldId: string): Tier {
  return FREE_WORLD_IDS.includes(worldId) ? "guest" : "festival";
}

/**
 * The tier actually in effect right now. Paid passes are one-time and
 * time-boxed: once `expiresISO` is in the past, access lapses back to guest.
 * A missing expiry is treated as active (e.g. a comped/manual grant).
 */
export function effectiveTier(
  tier: string | undefined,
  expiresISO?: string | null
): string {
  const t = tier || "guest";
  if (t === "guest") return "guest";
  if (!expiresISO) return t;
  const exp = Date.parse(expiresISO);
  if (Number.isNaN(exp)) return t;
  return Date.now() < exp ? t : "guest";
}

/** Can a holder of `tier` play `worldId`? */
export function canPlayWorld(
  tier: string | undefined,
  worldId: string
): boolean {
  const have = RANK[tier || "guest"] ?? 0;
  return have >= RANK[requiredTier(worldId)];
}