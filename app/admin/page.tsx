"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// Phase 1 admin analytics — internal funnel + KPIs from analytics_events.
// Admin-gated: only profiles with is_admin = true can see data.

type Access = "loading" | "denied" | "ready";

interface Kpis {
  total_events: number;
  visitors: number;
  sessions: number;
  returning_visitors: number;
}
interface FunnelRow {
  event_name: string;
  events: number;
  visitors: number;
}

const FUNNEL: { event: string; label: string }[] = [
  { event: "landing_viewed", label: "Landing viewed" },
  { event: "dimension_dial_opened", label: "Dimension Dial opened" },
  { event: "dimension_world_selected", label: "World selected" },
  { event: "email_entered", label: "Email captured" },
  { event: "role_selected", label: "Role selected" },
  { event: "story_started", label: "Story started" },
  { event: "story_completed", label: "Story completed" },
];

const INK = "#0a0d14";
const GOLD = "#C7A24A";
const TEAL = "#27B6AC";
const PAPER = "#e8edf7";
const MUT = "#9aa0ad";
const LINE = "rgba(255,255,255,.1)";

export default function AdminPage() {
  const [access, setAccess] = useState<Access>("loading");
  const [days, setDays] = useState(30);
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [funnel, setFunnel] = useState<FunnelRow[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const sb = supabase();
    if (!sb) {
      setAccess("denied");
      return;
    }
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) {
      setAccess("denied");
      return;
    }
    const { data: prof } = await sb
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    if (!prof?.is_admin) {
      setAccess("denied");
      return;
    }
    setAccess("ready");
    setLoading(true);
    const [{ data: k }, { data: f }] = await Promise.all([
      sb.rpc("admin_kpis", { days }),
      sb.rpc("admin_funnel", { days }),
    ]);
    setKpis((k && k[0]) || null);
    setFunnel((f as FunnelRow[]) || []);
    setLoading(false);
  }, [days]);

  useEffect(() => {
    void load();
  }, [load]);

  const wrap: React.CSSProperties = {
    minHeight: "100vh",
    background: "radial-gradient(80% 60% at 50% 0%, #10131c 0%, #070810 60%, #04050a 100%)",
    color: PAPER,
    fontFamily: "-apple-system, system-ui, 'Segoe UI', Roboto, sans-serif",
    padding: "32px 20px 80px",
  };
  const inner: React.CSSProperties = { maxWidth: 860, margin: "0 auto" };

  if (access === "loading") {
    return (
      <div style={wrap}>
        <div style={inner}>
          <p style={{ color: MUT }}>Loading…</p>
        </div>
      </div>
    );
  }

  if (access === "denied") {
    return (
      <div style={wrap}>
        <div style={inner}>
          <h1 style={{ fontSize: 22, margin: "0 0 8px" }}>Admin only</h1>
          <p style={{ color: MUT, lineHeight: 1.6 }}>
            This dashboard is restricted. Sign in to Living Worlds with an admin
            account, then reload this page. If you are signed in and still see
            this, your account isn&apos;t marked as an admin yet.
          </p>
          <a href="/" style={{ color: TEAL, fontSize: 14 }}>
            ← Back to Living Worlds
          </a>
        </div>
      </div>
    );
  }

  // Funnel maths: visitors per step, % of top, step-to-step conversion.
  const byEvent = new Map(funnel.map((r) => [r.event_name, r.visitors]));
  const counts = FUNNEL.map((s) => byEvent.get(s.event) || 0);
  const top = counts[0] || 0;

  const kpiCard = (label: string, value: number | undefined) => (
    <div
      key={label}
      style={{
        flex: 1,
        minWidth: 130,
        border: `1px solid ${LINE}`,
        borderRadius: 14,
        background: "rgba(255,255,255,.03)",
        padding: "14px 16px",
      }}
    >
      <div
        style={{
          fontSize: 10,
          letterSpacing: ".12em",
          textTransform: "uppercase",
          color: MUT,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: TEAL, marginTop: 4 }}>
        {value ?? 0}
      </div>
    </div>
  );

  return (
    <div style={wrap}>
      <div style={inner}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 6,
          }}
        >
          <div style={{ height: 3, width: 56, background: GOLD }} />
          <a href="/" style={{ color: TEAL, fontSize: 13 }}>
            ← App
          </a>
        </div>
        <h1 style={{ fontSize: 26, margin: "6px 0 2px" }}>Living Worlds — Analytics</h1>
        <p style={{ color: MUT, fontSize: 13, margin: "0 0 18px" }}>
          Internal product funnel · source of truth
        </p>

        {/* Date range */}
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              style={{
                border: `1px solid ${days === d ? TEAL : LINE}`,
                background: days === d ? "rgba(39,182,172,.12)" : "transparent",
                color: days === d ? TEAL : MUT,
                borderRadius: 999,
                padding: "7px 14px",
                fontSize: 12.5,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {d} days
            </button>
          ))}
          {loading && (
            <span style={{ color: MUT, fontSize: 12, alignSelf: "center" }}>
              updating…
            </span>
          )}
        </div>

        {/* KPI row */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 26 }}>
          {kpiCard("Visitors", kpis?.visitors)}
          {kpiCard("Sessions", kpis?.sessions)}
          {kpiCard("Returning", kpis?.returning_visitors)}
          {kpiCard("Total events", kpis?.total_events)}
        </div>

        {/* Funnel */}
        <h2 style={{ fontSize: 16, margin: "0 0 12px" }}>Participation funnel</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {FUNNEL.map((s, i) => {
            const n = counts[i];
            const pctTop = top ? Math.round((n / top) * 100) : 0;
            const prev = i === 0 ? n : counts[i - 1];
            const stepConv = prev ? Math.round((n / prev) * 100) : 0;
            const drop = prev - n;
            return (
              <div
                key={s.event}
                style={{
                  border: `1px solid ${LINE}`,
                  borderRadius: 12,
                  background: "rgba(255,255,255,.03)",
                  padding: "12px 14px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    gap: 10,
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 700 }}>
                    {i + 1}. {s.label}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: TEAL }}>
                    {n}
                  </span>
                </div>
                <div
                  style={{
                    height: 8,
                    borderRadius: 5,
                    background: LINE,
                    overflow: "hidden",
                    margin: "8px 0 6px",
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      height: "100%",
                      width: `${pctTop}%`,
                      background: `linear-gradient(90deg, ${TEAL}, ${GOLD})`,
                    }}
                  />
                </div>
                <div style={{ fontSize: 11.5, color: MUT }}>
                  {pctTop}% of visitors
                  {i > 0 && (
                    <>
                      {" · "}
                      {stepConv}% from previous
                      {drop > 0 && (
                        <span style={{ color: "#d9847a" }}>
                          {" · "}
                          {drop} dropped
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p style={{ color: MUT, fontSize: 11.5, marginTop: 20, lineHeight: 1.6 }}>
          Counts are unique visitors per step over the selected window. This is
          your own first-party data; it complements (doesn&apos;t replace)
          Clarity and Vercel Analytics. Data appears as visitors move through the
          app — newly deployed events take time to accumulate.
        </p>
      </div>
    </div>
  );
}