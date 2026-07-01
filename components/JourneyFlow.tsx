"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/* ============================================================================
   JourneyFlow — additive, read-only "how players come in and out" chart.
   Drops into the admin dashboard as its own card. Fetches from analytics_events,
   counts DISTINCT visitors per funnel step, and draws a horizontal funnel where
   each teal bar is who's still in the journey and the amber note is who leaked
   out since the previous step. Nothing here writes data or touches existing
   dashboard logic — if the query fails it renders an empty state, never throws.

   ── VERIFY THESE THREE against your table if numbers come back empty ──
   Column names below must match your analytics_events schema.
============================================================================ */
const EVENT_COL = "event_name"; // column holding the event name string
const VISITOR_COL = "visitor_id"; // column identifying a unique person
const TIME_COL = "created_at"; // timestamptz column

// Each step matches ANY of its aliases, so this works whether your rows use the
// newer funnel names or the older ones (both are counted as the same step).
const STEPS: { label: string; aliases: string[] }[] = [
  { label: "Landing viewed", aliases: ["landing_page_loaded", "landing_viewed", "hero_visible"] },
  { label: "Dimension Dial", aliases: ["dimension_dial_loaded", "dimension_dial_opened", "world_selector_opened"] },
  { label: "World selected", aliases: ["world_selected", "perdido_selected", "dimension_card_clicked", "world_preview_viewed"] },
  { label: "Role selected", aliases: ["role_selected"] },
  { label: "Story started", aliases: ["story_started", "first_ai_response"] },
  { label: "Story completed", aliases: ["story_completed"] },
];

const TEAL = "#27B6AC";
const GOLD = "#C7A24A";
const AMBER = "#d9884a";
const INK = "#eef2f6";
const FAINT = "#8a93a5";
const LINE = "rgba(255,255,255,.10)";

type Row = { label: string; count: number; pct: number; drop: number; dropPct: number };

export default function JourneyFlow({ windowDays = 30 }: { windowDays?: number }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "empty" | "noclient" | "error">(
    "loading"
  );

  useEffect(() => {
    let active = true;
    (async () => {
      const sb = supabase();
      if (!sb) {
        if (active) setState("noclient");
        return;
      }
      try {
        const since = new Date(Date.now() - windowDays * 86400000).toISOString();
        const allAliases = STEPS.flatMap((s) => s.aliases);
        const { data, error } = await sb
          .from("analytics_events")
          .select(`${EVENT_COL}, ${VISITOR_COL}`)
          .gte(TIME_COL, since)
          .in(EVENT_COL, allAliases)
          .limit(50000);
        if (error) throw error;

        // Distinct visitors per step.
        const counts = STEPS.map((step) => {
          const set = new Set<string>();
          for (const r of data ?? []) {
            const ev = (r as Record<string, unknown>)[EVENT_COL] as string;
            const vid = (r as Record<string, unknown>)[VISITOR_COL] as string | null;
            if (vid && step.aliases.includes(ev)) set.add(vid);
          }
          return set.size;
        });

        const top = counts[0] || 0;
        if (!top) {
          if (active) setState("empty");
          return;
        }
        const built: Row[] = STEPS.map((s, i) => {
          const count = counts[i];
          const prev = i === 0 ? count : counts[i - 1];
          const drop = Math.max(prev - count, 0);
          return {
            label: s.label,
            count,
            pct: Math.round((count / top) * 100),
            drop,
            dropPct: prev ? Math.round((drop / prev) * 100) : 0,
          };
        });
        if (active) {
          setRows(built);
          setState("ok");
        }
      } catch {
        if (active) setState("error");
      }
    })();
    return () => {
      active = false;
    };
  }, [windowDays]);

  const card: React.CSSProperties = {
    background: "rgba(255,255,255,.02)",
    border: `1px solid ${LINE}`,
    borderRadius: 16,
    padding: "18px 18px 14px",
    marginTop: 20,
  };

  const header = (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
      <div>
        <div style={{ fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", color: TEAL, fontWeight: 700 }}>
          Player journey
        </div>
        <div style={{ fontSize: 18, fontWeight: 600, color: INK, marginTop: 2 }}>
          How players come in and out
        </div>
      </div>
      <div style={{ fontSize: 12, color: FAINT }}>last {windowDays} days</div>
    </div>
  );

  if (state !== "ok" || !rows) {
    const msg =
      state === "loading" ? "Loading journey…"
      : state === "noclient" ? "Analytics client not configured."
      : state === "empty" ? "No journey events in this window yet."
      : "Couldn't load journey data.";
    return (
      <div style={card}>
        {header}
        <div style={{ fontSize: 14, color: FAINT, padding: "24px 4px" }}>{msg}</div>
      </div>
    );
  }

  // Layout
  const VB_W = 680;
  const TOP = 8;
  const PITCH = 52;
  const BAR_H = 30;
  const BAR_X = 168;
  const BAR_MAXW = 300;
  const COUNT_X = 476;
  const H = TOP + rows.length * PITCH + 26;
  const top = rows[0].count || 1;

  return (
    <div style={card}>
      {header}
      <svg viewBox={`0 0 ${VB_W} ${H}`} width="100%" role="img" aria-label="Player journey funnel from landing to story completed">
        {rows.map((r, i) => {
          const y = TOP + i * PITCH;
          const w = r.count > 0 ? Math.max((r.count / top) * BAR_MAXW, 26) : 2;
          const last = i === rows.length - 1;
          const fill = last ? GOLD : TEAL;
          const opacity = last ? 1 : Math.max(0.95 - i * 0.09, 0.6);
          return (
            <g key={r.label}>
              <rect x={BAR_X} y={y} width={w} height={BAR_H} rx={6} fill={fill} opacity={opacity} />
              <text x={BAR_X - 10} y={y + 20} textAnchor="end" fontSize={13} fill={FAINT}>
                {r.label}
              </text>
              <text x={COUNT_X} y={y + 20} fontSize={13} fontWeight={500} fill={INK}>
                {r.count} · {r.pct}%
              </text>
              {i > 0 && r.drop > 0 && (
                <text x={VB_W - 4} y={y + 20} textAnchor="end" fontSize={12.5} fill={AMBER}>
                  ▼ {r.drop} left ({r.dropPct}%)
                </text>
              )}
            </g>
          );
        })}
        <line x1={BAR_X} y1={H - 18} x2={COUNT_X + 30} y2={H - 18} stroke={LINE} strokeWidth={1} />
        <text x={BAR_X} y={H - 4} fontSize={11.5} fill={FAINT}>
          teal = still in · amber = dropped here · gold = finished
        </text>
      </svg>
    </div>
  );
}