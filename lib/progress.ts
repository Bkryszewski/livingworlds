// lib/progress.ts — local, per-browser player progress + derived skills.
// Stored only in the player's own browser (localStorage). No server, no account.
// Folds each finished playthrough into running totals and surfaces RPG-style
// "skills" that grow with play — the data behind the Player Dashboard.

export interface WorldProgress {
  plays: number; // total playthroughs of this world
  roles: string[]; // distinct role ids taken
  bestTrust: number; // highest trust reached
  clues: number; // cumulative clues found
  completed: boolean; // reached a Cut at least once
  lastPlayed: number; // epoch ms
}

export interface PlayerProgress {
  worlds: Record<string, WorldProgress>;
  totalPlays: number;
  totalClues: number;
  totalExchanges: number;
}

export const EMPTY_PROGRESS: PlayerProgress = {
  worlds: {},
  totalPlays: 0,
  totalClues: 0,
  totalExchanges: 0,
};

const STORE_KEY = "livingworlds:progress";

export function loadProgress(): PlayerProgress {
  if (typeof window === "undefined") return EMPTY_PROGRESS;
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return EMPTY_PROGRESS;
    return { ...EMPTY_PROGRESS, ...JSON.parse(raw) };
  } catch {
    return EMPTY_PROGRESS;
  }
}

export function saveProgress(p: PlayerProgress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export function resetProgress(): PlayerProgress {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(STORE_KEY);
    } catch {
      /* ignore */
    }
  }
  return { worlds: {}, totalPlays: 0, totalClues: 0, totalExchanges: 0 };
}

/** Fold one finished playthrough into running progress (pure, no persistence). */
export function foldPlaythrough(
  prev: PlayerProgress,
  worldId: string,
  roleId: string | null,
  stats: { trust: number; clues: number; exchanges: number },
  when: number = Date.now()
): PlayerProgress {
  const w = prev.worlds[worldId] || {
    plays: 0,
    roles: [],
    bestTrust: 0,
    clues: 0,
    completed: false,
    lastPlayed: 0,
  };
  const roles =
    roleId && !w.roles.includes(roleId) ? [...w.roles, roleId] : w.roles;
  return {
    worlds: {
      ...prev.worlds,
      [worldId]: {
        plays: w.plays + 1,
        roles,
        bestTrust: Math.max(w.bestTrust, stats.trust || 0),
        clues: w.clues + (stats.clues || 0),
        completed: true,
        lastPlayed: when,
      },
    },
    totalPlays: prev.totalPlays + 1,
    totalClues: prev.totalClues + (stats.clues || 0),
    totalExchanges: prev.totalExchanges + (stats.exchanges || 0),
  };
}

/** Fold one finished playthrough into local progress and persist it. */
export function recordPlaythrough(
  prev: PlayerProgress,
  worldId: string,
  roleId: string | null,
  stats: { trust: number; clues: number; exchanges: number }
): PlayerProgress {
  const next = foldPlaythrough(prev, worldId, roleId, stats);
  saveProgress(next);
  return next;
}

/** Aggregate a list of saved playthrough rows into a PlayerProgress shape. */
export function aggregateProgress(
  rows: {
    world_id: string;
    role_id: string | null;
    clues: number;
    exchanges: number;
    trust: number;
    created_at?: string;
  }[]
): PlayerProgress {
  let p: PlayerProgress = {
    worlds: {},
    totalPlays: 0,
    totalClues: 0,
    totalExchanges: 0,
  };
  // oldest first so lastPlayed ends up correct
  const ordered = [...rows].sort(
    (a, b) =>
      (a.created_at ? Date.parse(a.created_at) : 0) -
      (b.created_at ? Date.parse(b.created_at) : 0)
  );
  for (const r of ordered) {
    p = foldPlaythrough(
      p,
      r.world_id,
      r.role_id,
      { trust: r.trust, clues: r.clues, exchanges: r.exchanges },
      r.created_at ? Date.parse(r.created_at) : Date.now()
    );
  }
  return p;
}

// --- Saved cuts (the scene script from each playthrough) ----------------------

export interface CutRecord {
  worldId: string;
  roleId: string | null;
  script: string;
  coverageScore?: number | null;
  createdAt: number;
}

const CUTS_KEY = "livingworlds:cuts";
const MAX_CUTS = 24;

export function loadLocalCuts(): CutRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CUTS_KEY);
    return raw ? (JSON.parse(raw) as CutRecord[]) : [];
  } catch {
    return [];
  }
}

export function addLocalCut(c: CutRecord): CutRecord[] {
  const next = [c, ...loadLocalCuts()].slice(0, MAX_CUTS);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(CUTS_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }
  return next;
}

export function clearLocalCuts(): void {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(CUTS_KEY);
    } catch {
      /* ignore */
    }
  }
}

// --- Skills: lightweight RPG-style growth derived from cumulative play. ---

export interface Skill {
  id: string;
  label: string;
  level: number; // 1..MAX_LEVEL
  pct: number; // 0..100 progress toward the next level
  blurb: string;
}

const MAX_LEVEL = 10;

function leveled(value: number, perLevel: number): { level: number; pct: number } {
  const lv = Math.min(MAX_LEVEL, 1 + Math.floor(value / perLevel));
  const into = value - (lv - 1) * perLevel;
  const pct = lv >= MAX_LEVEL ? 100 : Math.round((into / perLevel) * 100);
  return { level: lv, pct };
}

/** Derive the five player skills from accumulated progress. */
export function deriveSkills(p: PlayerProgress): Skill[] {
  const worldsTouched = Object.keys(p.worlds).length;
  const completions = Object.values(p.worlds).filter((w) => w.completed).length;
  const rolesTaken = Object.values(p.worlds).reduce(
    (n, w) => n + w.roles.length,
    0
  );
  const bestTrust = Object.values(p.worlds).reduce(
    (m, w) => Math.max(m, w.bestTrust),
    0
  );

  const instinct = leveled(p.totalClues, 3); // evidence found
  const rapport = leveled(bestTrust, 10); // trust reached
  const persistence = leveled(p.totalExchanges, 12); // lines played
  const range = leveled(worldsTouched * 2 + rolesTaken, 3); // breadth
  const craft = leveled(completions * 2, 2); // cuts finished

  return [
    { id: "instinct", label: "Instinct", ...instinct, blurb: "Evidence you've surfaced" },
    { id: "rapport", label: "Rapport", ...rapport, blurb: "Trust you've earned" },
    { id: "persistence", label: "Persistence", ...persistence, blurb: "Lines you've played" },
    { id: "range", label: "Range", ...range, blurb: "Worlds & roles explored" },
    { id: "craft", label: "Craft", ...craft, blurb: "Cuts you've finished" },
  ];
}