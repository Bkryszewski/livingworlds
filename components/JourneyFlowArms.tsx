"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/* ============================================================================
   JourneyFlowArms — two-arm engagement flow (sessions).
   Reads admin_flow_arms() (security definer, admin-guarded). Shows two streams:
     • cold   — new players hooked by the FaceTime call
     • direct — returning players who skipped the call
   Both converge at the Dimension Dial into the shared gameplay channel.
   Read-only; on any failure it renders a muted message, never throws.
   Requires admin_flow_arms.sql installed in Supabase.
============================================================================ */

const TEAL = "#27B6AC";
const GOLD = "#C7A24A";
const AMBER = "#d9884a";
const INK = "#eef2f6";
const FAINT = "#8a93a5";
const LINE = "rgba(255,255,255,.10)";

type RpcRow = { arm: string; step_index: number; label: string; sessions: number };
type Step = { label: string; n: number; drop: number; dropPct: number };

function toSteps(rows: RpcRow[], arm: string): Step[] {
  const list = rows
    .filter((r) => r.arm === arm)
    .sort((a, b) => a.step_index - b.step_index)
    .map((r) => ({ label: r.label, n: Number(r.sessions) || 0 }));
  return list.map((s, i) => {
    const prev = i === 0 ? s.n : list[i - 1].n;
    const drop = Math.max(prev - s.n, 0);
    return { label: s.label, n: s.n, drop, dropPct: prev ? Math.round((drop / prev) * 100) : 0 };
  });
}

export default function JourneyFlowArms({ windowDays = 30 }: { windowDays?: number }) {
  const [data, setData] = useState<{ cold: Step[]; direct: Step[]; shared: Step[] } | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "empty" | "noclient" | "error">("loading");

  useEffect(() => {
    let active = true;
    (async () => {
      const sb = supabase();
      if (!sb) {
        if (active) setState("noclient");
        return;
      }
      try {
        const { data: rows, error } = await sb.rpc("admin_flow_arms", { days: windowDays });
        if (error) throw error;
        const rr = (rows as RpcRow[]) || [];
        const cold = toSteps(rr, "cold");
        const direct = toSteps(rr, "direct");
        const shared = toSteps(rr, "shared");
        if (!cold.length && !direct.length) {
          if (active) setState("empty");
          return;
        }
        if (active) {
          setData({ cold, direct, shared });
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
          Engagement flow
        </div>
        <div style={{ fontSize: 18, fontWeight: 600, color: INK, marginTop: 2 }}>
          Two ways in · one story
        </div>
      </div>
      <div style={{ fontSize: 12, color: FAINT }}>sessions · last {windowDays}d</div>
    </div>
  );

  if (state !== "ok" || !data) {
    const msg =
      state === "loading" ? "Loading engagement flow…"
      : state === "noclient" ? "Analytics client not configured."
      : state === "empty" ? "No sessions in this window yet."
      : "Couldn't load engagement flow.";
    return (
      <div style={card}>
        {header}
        <div style={{ fontSize: 14, color: FAINT, padding: "24px 4px" }}>{msg}</div>
      </div>
    );
  }

  const { cold, direct, shared } = data;

  // Geometry
  const VB_W = 680;
  const COLD_CX = 168;
  const DIR_CX = 512;
  const LANE_MAXW = 220;
  const SHARED_CX = 340;
  const SHARED_MAXW = 300;
  const BAR_H = 26;
  const PITCH = 40;

  const coldTop = cold[0]?.n || 1;
  const dirTop = direct[0]?.n || 1;
  const sharedTop = shared[0]?.n || 1;

  const coldStartY = 46;
  const coldBottomY = coldStartY + Math.max(cold.length - 1, 0) * PITCH + BAR_H;
  const dirStartY = coldStartY + Math.max(cold.length - 1, 0) * PITCH; // align to cold's last row
  const dirBottomY = dirStartY + BAR_H;
  const mergeY = Math.max(coldBottomY, dirBottomY) + 16;
  const sharedStartY = mergeY + 26;
  const H = sharedStartY + Math.max(shared.length - 1, 0) * PITCH + BAR_H + 26;

  const laneBar = (
    steps: Step[],
    cx: number,
    maxw: number,
    maxval: number,
    startY: number,
    color: (i: number) => string,
    countX: number,
    countAnchor: "start" | "end"
  ) =>
    steps.map((s, i) => {
      const y = startY + i * PITCH;
      const w = s.n > 0 ? Math.max((s.n / maxval) * maxw, 20) : 3;
      const x = cx - w / 2;
      return (
        <g key={`${cx}-${i}`}>
          <text x={cx} y={y - 5} textAnchor="middle" fontSize={11} fill={FAINT}>
            {s.label}
          </text>
          <rect x={x} y={y} width={w} height={BAR_H} rx={5} fill={color(i)} />
          <text x={countX} y={y + 17} textAnchor={countAnchor} fontSize={12.5} fontWeight={600} fill={INK}>
            {s.n}
          </text>
          {i > 0 && s.drop > 0 && (
            <text x={countX} y={y + 30} textAnchor={countAnchor} fontSize={10.5} fill={AMBER}>
              ▼{s.drop} ({s.dropPct}%)
            </text>
          )}
        </g>
      );
    });

  return (
    <div style={card}>
      {header}
      <svg viewBox={`0 0 ${VB_W} ${H}`} width="100%" role="img" aria-label="Two-arm engagement flow: cold-open and direct sessions converging into the shared gameplay steps">
        {/* arm titles */}
        <text x={COLD_CX} y={22} textAnchor="middle" fontSize={11.5} fontWeight={700} fill={TEAL}>
          NEW · THE CALL
        </text>
        <text x={DIR_CX} y={22} textAnchor="middle" fontSize={11.5} fontWeight={700} fill={GOLD}>
          RETURNING · DIRECT
        </text>

        {/* cold arm (teal) */}
        {laneBar(cold, COLD_CX, LANE_MAXW, coldTop, coldStartY, () => TEAL, COLD_CX + LANE_MAXW / 2 + 14, "start")}
        {/* direct arm (gold) */}
        {laneBar(direct, DIR_CX, LANE_MAXW, dirTop, dirStartY, () => GOLD, DIR_CX - LANE_MAXW / 2 - 14, "end")}

        {/* convergence */}
        <path d={`M${COLD_CX},${coldBottomY} Q${COLD_CX},${mergeY} ${SHARED_CX},${mergeY + 8}`} fill="none" stroke={TEAL} strokeWidth={2} opacity={0.5} />
        <path d={`M${DIR_CX},${dirBottomY} Q${DIR_CX},${mergeY} ${SHARED_CX},${mergeY + 8}`} fill="none" stroke={GOLD} strokeWidth={2} opacity={0.5} />
        <circle cx={SHARED_CX} cy={mergeY + 8} r={3.5} fill={INK} />

        {/* shared channel (teal → gold at completion) */}
        {laneBar(
          shared,
          SHARED_CX,
          SHARED_MAXW,
          sharedTop,
          sharedStartY,
          (i) => (i === shared.length - 1 ? GOLD : TEAL),
          SHARED_CX + SHARED_MAXW / 2 + 14,
          "start"
        )}

        <text x={SHARED_CX} y={H - 6} textAnchor="middle" fontSize={11} fill={FAINT}>
          teal = new via the call · gold = returning · ▼ = sessions dropped
        </text>
      </svg>
    </div>
  );
}