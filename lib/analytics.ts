// lib/analytics.ts
// -----------------------------------------------------------------------------
// Centralized participation analytics for Living Worlds.
//
// Living Worlds is an SPA: the URL never changes, so page-based analytics under-
// count engagement. This layer measures *participation* instead — meaningful
// in-app events and active-session milestones.
//
// Design:
//  - Provider-agnostic. Today it emits to Microsoft Clarity. Add GA4, PostHog,
//    Mixpanel, App Insights, etc. by pushing a provider into PROVIDERS — no
//    application code changes.
//  - Never throws. Analytics must never break the app or block the UI.
//  - No-ops safely during SSR/dev or when a provider isn't loaded.
//  - Adding a new event is one line on the `analytics` service.
// -----------------------------------------------------------------------------

export type Metadata = Record<string, unknown>;

export interface AnalyticsProvider {
  name: string;
  track: (eventName: string, metadata?: Metadata) => void;
}

// --- Providers ---------------------------------------------------------------

type ClarityFn = (...args: unknown[]) => void;

/** Microsoft Clarity custom-event provider. */
const clarityProvider: AnalyticsProvider = {
  name: "clarity",
  track(eventName, metadata) {
    if (typeof window === "undefined") return;
    const clarity = (window as unknown as { clarity?: ClarityFn }).clarity;
    if (typeof clarity !== "function") return;
    // Attach metadata as custom tags (best-effort), then fire the event.
    if (metadata) {
      for (const [k, v] of Object.entries(metadata)) {
        if (v === undefined || v === null) continue;
        try {
          clarity("set", k, String(v));
        } catch {
          /* ignore */
        }
      }
    }
    clarity("event", eventName);
  },
};

const PROVIDERS: AnalyticsProvider[] = [clarityProvider];

/** Register an additional analytics provider at runtime (e.g. GA4, PostHog). */
export function addAnalyticsProvider(p: AnalyticsProvider): void {
  if (!PROVIDERS.some((x) => x.name === p.name)) PROVIDERS.push(p);
}

// --- Core --------------------------------------------------------------------

/** Fire an event to every registered provider. Never throws. */
export function trackLivingWorldsEvent(
  eventName: string,
  metadata?: Metadata
): void {
  if (typeof window === "undefined") return; // SSR / dev no-op
  for (const p of PROVIDERS) {
    try {
      p.track(eventName, metadata);
    } catch {
      /* analytics must never break the app */
    }
  }
}

// --- Fire-once-per-session dedup --------------------------------------------

const firedMemory = new Set<string>();

/** Returns true the first time a key is seen this session, false after. */
function claimOnce(key: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const k = "lw:evt:" + key;
    if (window.sessionStorage.getItem(k)) return false;
    window.sessionStorage.setItem(k, "1");
    return true;
  } catch {
    if (firedMemory.has(key)) return false;
    firedMemory.add(key);
    return true;
  }
}

/** Fire an event at most once per session. */
function trackOnce(eventName: string, metadata?: Metadata): void {
  if (claimOnce(eventName)) trackLivingWorldsEvent(eventName, metadata);
}

// --- Active-session engagement timers ----------------------------------------
// Accumulates ACTIVE time only (paused while the tab is hidden) and fires each
// milestone once per session.

const MILESTONES: { ms: number; event: string }[] = [
  { ms: 30_000, event: "session_over_30_seconds" },
  { ms: 60_000, event: "session_over_1_minute" },
  { ms: 5 * 60_000, event: "session_over_5_minutes" },
  { ms: 10 * 60_000, event: "session_over_10_minutes" },
  { ms: 20 * 60_000, event: "session_over_20_minutes" },
];

let activeMs = 0;
let lastTick = 0;
let intervalId: number | null = null;
let sessionInitialized = false;

function checkMilestones(): void {
  for (const m of MILESTONES) {
    if (activeMs >= m.ms) trackOnce(m.event);
  }
}

function startTimer(): void {
  if (intervalId != null || typeof window === "undefined") return;
  lastTick = Date.now();
  intervalId = window.setInterval(() => {
    const now = Date.now();
    activeMs += now - lastTick;
    lastTick = now;
    checkMilestones();
  }, 1000);
}

function stopTimer(): void {
  if (intervalId == null) return;
  const now = Date.now();
  activeMs += now - lastTick; // bank the partial interval
  window.clearInterval(intervalId);
  intervalId = null;
  checkMilestones();
}

function handleVisibility(): void {
  if (typeof document === "undefined") return;
  if (document.hidden) stopTimer();
  else startTimer();
}

/**
 * Initialize the session once (call on app mount). Detects returning players,
 * starts the active-time engagement timers, and pauses them when the tab is
 * hidden. Safe to call multiple times — only the first call takes effect.
 */
export function initSession(): void {
  if (typeof window === "undefined" || sessionInitialized) return;
  sessionInitialized = true;

  // Returning player: a prior-visit flag in localStorage.
  try {
    const KEY = "lw:lastVisit";
    const prior = window.localStorage.getItem(KEY);
    if (prior) trackOnce("returned_player", { lastVisit: prior });
    window.localStorage.setItem(KEY, new Date().toISOString());
  } catch {
    /* ignore */
  }

  try {
    document.addEventListener("visibilitychange", handleVisibility);
  } catch {
    /* ignore */
  }
  if (typeof document === "undefined" || !document.hidden) startTimer();
}

// --- Service: one-line, consistently-named event methods ---------------------
// Add a new event by adding one line here. Application code calls these methods;
// it never calls providers or raw Clarity directly.

export const analytics = {
  // -- Landing --------------------------------------------------------------
  landingViewed: () => trackLivingWorldsEvent("landing_viewed"),
  landingCtaClicked: () => trackLivingWorldsEvent("landing_cta_clicked"),
  landingTitleClicked: () => trackLivingWorldsEvent("landing_title_clicked"),
  landingSubtitleClicked: () =>
    trackLivingWorldsEvent("landing_subtitle_clicked"),
  landingArtworkClicked: () => trackLivingWorldsEvent("landing_artwork_clicked"),

  // -- Dimension Dial -------------------------------------------------------
  dimensionDialOpened: () => trackLivingWorldsEvent("dimension_dial_opened"),
  dimensionScrolled: () => trackOnce("dimension_scrolled"),
  dimensionWorldPreviewed: (worldId: string) =>
    trackLivingWorldsEvent("dimension_world_previewed", { worldId }),
  dimensionWorldSelected: (worldId: string) =>
    trackLivingWorldsEvent("dimension_world_selected", { worldId }),

  // -- World selection ------------------------------------------------------
  /** Fire for any world chosen; also emits the per-world event when known. */
  worldSelected: (worldId: string) => {
    trackLivingWorldsEvent("dimension_world_selected", { worldId });
    if (worldId === "perdido") trackLivingWorldsEvent("perdido_selected");
    else if (worldId === "manifest")
      trackLivingWorldsEvent("manifest_selected");
  },
  perdidoSelected: () => trackLivingWorldsEvent("perdido_selected"),
  manifestSelected: () => trackLivingWorldsEvent("manifest_selected"),
  worldLockedSelected: (worldId: string) =>
    trackLivingWorldsEvent("world_locked_selected", { worldId }),

  // -- Player onboarding ----------------------------------------------------
  playerNameEntered: () => trackOnce("player_name_entered"),
  emailEntered: () => trackOnce("email_entered"),
  roleSelectionViewed: () => trackLivingWorldsEvent("role_selection_viewed"),
  /**
   * Record a role selection. Roles are authored per story, so we never make
   * the role an event name — we fire one consistent `role_selected` event and
   * carry the specifics as metadata. This rolls every role (across every
   * world) up under one event you can break down by world, role, or adversary,
   * with no analytics changes when new worlds/roles are added.
   */
  roleSelected: (
    roleId: string,
    opts?: { world?: string; adversary?: boolean }
  ) =>
    trackLivingWorldsEvent("role_selected", {
      roleId,
      world: opts?.world,
      adversary: !!opts?.adversary,
    }),

  // -- Story experience -----------------------------------------------------
  storyStarted: (world: string) =>
    trackLivingWorldsEvent("story_started", { world }),
  storyCheckpointReached: (world: string, checkpoint: string | number) =>
    trackLivingWorldsEvent("story_checkpoint_reached", { world, checkpoint }),
  storyCompleted: (world: string) =>
    trackLivingWorldsEvent("story_completed", { world }),
  storyAbandoned: (world: string) =>
    trackLivingWorldsEvent("story_abandoned", { world }),

  // -- Commerce -------------------------------------------------------------
  festivalPassViewed: () => trackLivingWorldsEvent("festival_pass_viewed"),
  festivalPassClicked: () => trackLivingWorldsEvent("festival_pass_clicked"),
  festivalPassPurchased: () =>
    trackLivingWorldsEvent("festival_pass_purchased"),
  studioPassViewed: () => trackLivingWorldsEvent("studio_pass_viewed"),
  studioPassClicked: () => trackLivingWorldsEvent("studio_pass_clicked"),
  studioPassPurchased: () => trackLivingWorldsEvent("studio_pass_purchased"),
};

export default analytics;