// lib/analytics.ts
// -----------------------------------------------------------------------------
// Centralized participation analytics for Living Worlds.
//
// Living Worlds is an SPA: the URL never changes, so page-based analytics under-
// count engagement. This layer measures *participation* instead — meaningful
// in-app events and active-session milestones.
//
// Design:
//  - Provider-agnostic. Emits to Microsoft Clarity, Vercel Analytics, a durable
//    Supabase warehouse, and (in dev) the console. Add GA4, PostHog, Mixpanel,
//    App Insights, etc. by pushing a provider into PROVIDERS — no application
//    code changes.
//  - Never throws. Analytics must never break the app or block the UI.
//  - No-ops safely during SSR/dev or when a provider isn't loaded.
//  - Adding a new event is one line on the `analytics` service.
//  - Between-step timing marks (mark/since) let us measure funnel durations
//    without any component holding a timer.
// -----------------------------------------------------------------------------

export type Metadata = Record<string, unknown>;

import { supabase } from "@/lib/supabase";
import { track as vercelTrack } from "@vercel/analytics";

export interface AnalyticsProvider {
  name: string;
  track: (eventName: string, metadata?: Metadata) => void;
}

const isDev =
  typeof process !== "undefined" && process.env.NODE_ENV !== "production";

// --- Between-step timing marks ----------------------------------------------
// A tiny shared clock. Methods call mark("t_x") to stamp a moment and
// since("t_x") to read elapsed ms. Undefined until the mark exists, so events
// that fire out of order simply omit the duration instead of lying.

const marks: Record<string, number> = {};
const nowMs = () =>
  typeof performance !== "undefined" ? performance.now() : Date.now();

function mark(name: string): void {
  marks[name] = nowMs();
}
function since(name: string): number | undefined {
  return marks[name] == null ? undefined : Math.round(nowMs() - marks[name]);
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

/** Vercel Analytics custom-event provider (typed primitive props only). */
const vercelProvider: AnalyticsProvider = {
  name: "vercel",
  track(eventName, metadata) {
    try {
      const flat: Record<string, string | number | boolean | null> = {};
      if (metadata) {
        for (const [k, v] of Object.entries(metadata)) {
          if (v === undefined || v === null) continue;
          flat[k] =
            typeof v === "object"
              ? JSON.stringify(v)
              : (v as string | number | boolean);
        }
      }
      vercelTrack(eventName, flat);
    } catch {
      /* ignore */
    }
  },
};

/** Development-only console provider. Silent in production builds. */
const consoleProvider: AnalyticsProvider = {
  name: "console",
  track(eventName, metadata) {
    if (!isDev) return;
    // eslint-disable-next-line no-console
    console.debug("%c[analytics]", "color:#27B6AC", eventName, metadata || {});
  },
};

const PROVIDERS: AnalyticsProvider[] = [
  clarityProvider,
  vercelProvider,
  consoleProvider,
];

// --- Session context (for the durable Supabase warehouse) --------------------
// Captured once per session: anonymous visitor id, session id, attribution,
// and coarse environment. Persisted so SPA navigation keeps the same context.

interface SessionContext {
  visitorId: string;
  sessionId: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  referrer: string | null;
  device_type: string;
  browser: string;
  os: string;
  lang: string | null;
  country: string | null;
}

let ctx: SessionContext | null = null;
let currentUserId: string | null = null;

function uuid(): string {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch {
    /* fall through */
  }
  // RFC4122-ish fallback
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function detectDevice(ua: string): string {
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  if (/Mobi|Android|iPhone/i.test(ua)) return "mobile";
  return "desktop";
}
function detectBrowser(ua: string): string {
  if (/Edg\//.test(ua)) return "Edge";
  if (/OPR\/|Opera/.test(ua)) return "Opera";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Safari\//.test(ua) && !/Chrome/.test(ua)) return "Safari";
  if (/Firefox\//.test(ua)) return "Firefox";
  return "Other";
}
function detectOS(ua: string): string {
  if (/Windows/.test(ua)) return "Windows";
  if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
  if (/Android/.test(ua)) return "Android";
  if (/Mac OS X/.test(ua)) return "macOS";
  if (/Linux/.test(ua)) return "Linux";
  return "Other";
}

function ensureContext(): SessionContext | null {
  if (ctx) return ctx;
  if (typeof window === "undefined") return null;
  try {
    let vid = window.localStorage.getItem("lw:vid");
    if (!vid) {
      vid = uuid();
      window.localStorage.setItem("lw:vid", vid);
    }
    let sid = window.sessionStorage.getItem("lw:sid");
    if (!sid) {
      sid = uuid();
      window.sessionStorage.setItem("lw:sid", sid);
    }
    // UTM: capture from URL on first visit of the session, persist for reuse.
    const stored = window.sessionStorage.getItem("lw:utm");
    let utm: Record<string, string | null>;
    if (stored) {
      utm = JSON.parse(stored);
    } else {
      const p = new URLSearchParams(window.location.search);
      utm = {
        utm_source: p.get("utm_source"),
        utm_medium: p.get("utm_medium"),
        utm_campaign: p.get("utm_campaign"),
        utm_content: p.get("utm_content"),
        utm_term: p.get("utm_term"),
      };
      window.sessionStorage.setItem("lw:utm", JSON.stringify(utm));
    }
    const ua = navigator.userAgent || "";
    let country: string | null = null;
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      country = tz || null;
    } catch {
      country = null;
    }
    ctx = {
      visitorId: vid,
      sessionId: sid,
      utm_source: utm.utm_source ?? null,
      utm_medium: utm.utm_medium ?? null,
      utm_campaign: utm.utm_campaign ?? null,
      utm_content: utm.utm_content ?? null,
      utm_term: utm.utm_term ?? null,
      referrer: document.referrer || null,
      device_type: detectDevice(ua),
      browser: detectBrowser(ua),
      os: detectOS(ua),
      lang: navigator.language || null,
      country,
    };
    return ctx;
  } catch {
    return null;
  }
}

/** Attach the authenticated user id to subsequent events (call on login). */
export function identify(userId: string | null): void {
  currentUserId = userId;
}

/** Durable warehouse provider: persists every event to Supabase. */
const supabaseProvider: AnalyticsProvider = {
  name: "supabase",
  track(eventName, metadata) {
    const c = ensureContext();
    if (!c) return;
    const sb = supabase();
    if (!sb) return;
    const m = metadata || {};
    const pick = (k: string) =>
      typeof m[k] === "string" ? (m[k] as string) : null;
    const row = {
      event_name: eventName,
      visitor_id: c.visitorId,
      session_id: c.sessionId,
      user_id: currentUserId,
      stage: pick("stage"),
      world_id: pick("world") || pick("worldId"),
      role_id: pick("roleId"),
      lang: c.lang,
      utm_source: c.utm_source,
      utm_medium: c.utm_medium,
      utm_campaign: c.utm_campaign,
      utm_content: c.utm_content,
      utm_term: c.utm_term,
      referrer: c.referrer,
      device_type: c.device_type,
      browser: c.browser,
      os: c.os,
      country: c.country,
      props: m,
    };
    // Fire-and-forget; analytics must never block the app.
    try {
      void sb
        .from("analytics_events")
        .insert(row)
        .then(
          () => {},
          () => {}
        );
    } catch {
      /* ignore */
    }
  },
};

PROVIDERS.push(supabaseProvider);

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

  // Capture session context up front (visitor id, attribution, environment).
  ensureContext();
  // Journey-start baseline for "time before story starts" (openingStarted also
  // sets this; kept here so the metric works even if the intro is skipped).
  mark("t_opening");

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
  // -- OpeningExperience (TikTok cold-open → app) --------------------------
  openingStarted: () => {
    mark("t_opening");
    trackLivingWorldsEvent("opening_experience_started");
  },
  splashCompleted: () =>
    trackLivingWorldsEvent("opening_splash_completed", {
      ms_splash: since("t_opening"),
    }),
  facetimePresented: () => trackLivingWorldsEvent("facetime_presented"),
  facetimeAccepted: () => trackLivingWorldsEvent("facetime_accepted"),
  facetimeDeclined: () => trackLivingWorldsEvent("facetime_declined"),
  landingLoaded: () => {
    mark("t_landing");
    trackLivingWorldsEvent("landing_page_loaded");
  },
  enterClicked: () =>
    trackLivingWorldsEvent("enter_living_worlds_clicked", {
      ms_on_landing: since("t_landing"),
    }),

  // -- Landing (app hero) ---------------------------------------------------
  landingViewed: () => trackLivingWorldsEvent("landing_viewed"),
  landingCtaClicked: () => trackLivingWorldsEvent("landing_cta_clicked"),
  landingTitleClicked: () => trackLivingWorldsEvent("landing_title_clicked"),
  landingSubtitleClicked: () =>
    trackLivingWorldsEvent("landing_subtitle_clicked"),
  landingArtworkClicked: () => trackLivingWorldsEvent("landing_artwork_clicked"),

  // -- Dimension Dial -------------------------------------------------------
  dimensionDialOpened: () => trackLivingWorldsEvent("dimension_dial_opened"),
  /** Spec funnel event: marks dial-time baseline + fires dimension_dial_loaded. */
  dimensionDialLoaded: () => {
    mark("t_dial");
    trackLivingWorldsEvent("dimension_dial_loaded");
  },
  dimensionScrolled: () => trackOnce("dimension_scrolled"),
  dimensionWorldPreviewed: (worldId: string) =>
    trackLivingWorldsEvent("dimension_world_previewed", { worldId }),
  /** Card impression, once per world per session. */
  cardVisible: (worldId: string, worldTitle: string) => {
    if (claimOnce("card_visible:" + worldId)) {
      trackLivingWorldsEvent("dimension_card_visible", { worldId, worldTitle });
    }
  },
  /** Any card tap (locked or not), with access context + time on the dial. */
  cardClicked: (w: {
    worldId: string;
    worldTitle: string;
    locked: boolean;
    guestAccessible: boolean;
  }) =>
    trackLivingWorldsEvent("dimension_card_clicked", {
      worldId: w.worldId,
      worldTitle: w.worldTitle,
      locked: w.locked,
      guestAccessible: w.guestAccessible,
      ms_on_dial: since("t_dial"),
    }),
  dimensionWorldSelected: (worldId: string) =>
    trackLivingWorldsEvent("dimension_world_selected", { worldId }),

  // -- World selection ------------------------------------------------------
  /** Fire for any world chosen; also emits the per-world event when known. */
  worldSelected: (worldId: string) => {
    trackLivingWorldsEvent("dimension_world_selected", {
      worldId,
      ms_on_dial: since("t_dial"),
    });
    if (worldId === "perdido")
      trackLivingWorldsEvent("perdido_selected", {
        source: "dimension_dial",
        ms_on_dial: since("t_dial"),
      });
    else if (worldId === "manifest")
      trackLivingWorldsEvent("manifest_selected", {
        source: "dimension_dial",
        ms_on_dial: since("t_dial"),
      });
  },
  perdidoSelected: (source: string = "dimension_dial") =>
    trackLivingWorldsEvent("perdido_selected", {
      source,
      ms_on_dial: since("t_dial"),
    }),
  manifestSelected: () => trackLivingWorldsEvent("manifest_selected"),
  worldLockedSelected: (worldId: string) =>
    trackLivingWorldsEvent("world_locked_selected", { worldId }),

  // -- World / Perdido details ---------------------------------------------
  perdidoDetailsLoaded: () => {
    mark("t_details");
    trackLivingWorldsEvent("perdido_details_loaded");
  },
  worldDetailsLoaded: (worldId: string) => {
    mark("t_details");
    trackLivingWorldsEvent("world_details_loaded", { worldId });
  },

  // -- Player onboarding ----------------------------------------------------
  playerNameEntered: () => trackOnce("player_name_entered"),
  /** Spec funnel event (kept distinct from your legacy email_entered). */
  playerEmailEntered: () => trackOnce("player_email_entered"),
  emailEntered: () => trackOnce("email_entered"),
  playerIdentityCompleted: () =>
    trackLivingWorldsEvent("player_identity_completed", {
      ms_on_details: since("t_details"),
    }),
  loginSuccess: () => trackOnce("login_success"),
  roleSelectionViewed: () => trackLivingWorldsEvent("role_selection_viewed"),
  /**
   * Record a role selection. Roles are authored per story, so we never make
   * the role an event name — we fire one consistent `role_selected` event and
   * carry the specifics as metadata. Emits both legacy keys (roleId/world) and
   * spec keys (role/worldId) so old dashboards and the new funnel both work.
   */
  roleSelected: (
    roleId: string,
    opts?: { world?: string; adversary?: boolean }
  ) =>
    trackLivingWorldsEvent("role_selected", {
      roleId,
      role: roleId,
      world: opts?.world,
      worldId: opts?.world,
      adversary: !!opts?.adversary,
      ms_on_details: since("t_details"),
    }),

  // -- Story experience -----------------------------------------------------
  storyStarted: (world: string, role?: string | null) =>
    trackLivingWorldsEvent("story_started", {
      world,
      worldId: world,
      role: role ?? undefined,
      ms_to_story: since("t_opening"),
    }),
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