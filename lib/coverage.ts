// lib/coverage.ts — a lightweight, local "greenlight coverage" read on a finished
// playthrough. No AI call and no cost: it scores the run from what the player
// actually did (investigation, engagement, rapport) into mini metrics shown on
// the Your Cut screen. A deeper AI comparison vs. the original screenplay can
// layer on top of this later for AI-mode players.

export type Recommendation = "Recommend" | "Consider" | "Pass";

export interface CoverageCategory {
  id: "engagement" | "investigation" | "rapport";
  score: number; // 1..10
}

export interface Coverage {
  score: number; // 1..10 overall
  recommendation: Recommendation;
  categories: CoverageCategory[];
}

function clamp10(n: number): number {
  return Math.max(1, Math.min(10, Math.round(n)));
}

export function computeCoverage(
  stats: { trust: number; clues: number; exchanges: number },
  opts: { archiveSize: number }
): Coverage {
  const investigation = clamp10(
    opts.archiveSize > 0
      ? (stats.clues / opts.archiveSize) * 10
      : stats.clues * 2
  );
  const engagement = clamp10(stats.exchanges * 1.6);
  const rapport = clamp10(stats.trust / 10);
  const overall = clamp10((investigation + engagement + rapport) / 3);
  const recommendation: Recommendation =
    overall >= 8 ? "Recommend" : overall >= 5 ? "Consider" : "Pass";

  return {
    score: overall,
    recommendation,
    categories: [
      { id: "engagement", score: engagement },
      { id: "investigation", score: investigation },
      { id: "rapport", score: rapport },
    ],
  };
}
