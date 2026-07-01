"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/* ============================================================================
   JourneyFlow — additive, read-only "how players come in and out" chart.
   Reads through the admin_journey() RPC (security definer, admin-guarded) —
   the same pattern as admin_funnel / admin_revenue — so it works past RLS on
   analytics_events. Nothing here writes data or touches existing dashboard
   logic; on any failure it renders a muted message, never throws.

   Requires the admin_journey SQL function (see admin_journey.sql) to be
   installed in Supabase. Pass windowDays to match the dashboard's day filter.
============================================================================ */

const TEAL = "#27B6AC";
const GOLD = "#C7A24A";
const AMBER = "#d9884a";
const INK = "#eef2f6";
const FAINT = "#8a93a5";
const LINE = "rgba(255,255,255,.10)";

type RpcRow = { step_index: number; label: string; visitors: number };
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
        const { data, error } = await sb.rpc("admin_journey", { days: windowDays });
        if (error) throw error;

        const raw = ((data as RpcRow[]) || [])
          .slice()
          .sort((a, b) => a.step_index - b.step_index);
        const counts = raw.map((r) => Number(r.visitors) || 0);
        const top = counts[0] || 0;
        if (!raw.length || !top) {
          if (active) setState("empty");
          return;
        }
        const built: Row[] = raw.map((r, i) => {
          const count = counts[i];
          const prev = i === 0 ? count : counts[i - 1];
          const drop = Math.max(prev - count, 0);
          return {
            label: r.label,
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