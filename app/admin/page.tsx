"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import JourneyFlow from "@/components/JourneyFlow";

// Phase 1 admin analytics — internal funnel + KPIs from analytics_events.
// Self-contained email+password sign-in (no magic link). Only profiles with
// is_admin = true can see data.

type Access = "loading" | "login" | "denied" | "ready";

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
interface Rev {
  gross_revenue: number | string;
  net_revenue: number | string;
  purchases: number;
  refunds: number;
  paying_customers: number;
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

const GOLD = "#C7A24A";
const TEAL = "#27B6AC";
const PAPER = "#e8edf7";
const MUT = "#9aa0ad";
const LINE = "rgba(255,255,255,.1)";

const wrap: React.CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(80% 60% at 50% 0%, #10131c 0%, #070810 60%, #04050a 100%)",
  color: PAPER,
  fontFamily: "-apple-system, system-ui, 'Segoe UI', Roboto, sans-serif",
  padding: "32px 20px 80px",
};
const inner: React.CSSProperties = { maxWidth: 860, margin: "0 auto" };
const input: React.CSSProperties = {
  width: "100%",
  border: `1px solid ${LINE}`,
  borderRadius: 12,
  background: "rgba(255,255,255,.04)",
  color: PAPER,
  padding: "12px 14px",
  fontSize: 15,
  outline: "none",
  marginTop: 8,
};

export default function AdminPage() {
  const [access, setAccess] = useState<Access>("loading");
  const [days, setDays] = useState(30);
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [funnel, setFunnel] = useState<FunnelRow[]>([]);
  const [rev, setRev] = useState<Rev | null>(null);
  const [loading, setLoading] = useState(false);

  // login form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Decide access for the current session, and load data if admin.
  const evaluate = useCallback(async () => {
    const sb = supabase();
    if (!sb) {
      setAccess("login");
      return;
    }
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) {
      setAccess("login");
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
  }, []);

  const loadData = useCallback(async () => {
    const sb = supabase();
    if (!sb) return;
    setLoading(true);
    const [{ data: k }, { data: f }, { data: r }] = await Promise.all([
      sb.rpc("admin_kpis", { days }),
      sb.rpc("admin_funnel", { days }),
      sb.rpc("admin_revenue", { days }),
    ]);
    setKpis((k && k[0]) || null);
    setFunnel((f as FunnelRow[]) || []);
    setRev((r && (r as Rev[])[0]) || null);
    setLoading(false);
  }, [days]);

  useEffect(() => {
    void evaluate();
  }, [evaluate]);

  useEffect(() => {
    if (access === "ready") void loadData();
  }, [access, loadData]);

  async function doLogin() {
    const sb = supabase();
    if (!sb) return;
    setSigningIn(true);
    setLoginError("");
    const { error } = await sb.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setSigningIn(false);
    if (error) {
      setLoginError(error.message || "Sign-in failed.");
      return;
    }
    setPassword("");
    await evaluate();
  }

  async function doSignOut() {
    const sb = supabase();
    if (sb) await sb.auth.signOut();
    setAccess("login");
  }

  // ---- LOGIN ----------------------------------------------------------------
  if (access === "login") {
    return (
      <div style={wrap}>
        <div style={{ ...inner, maxWidth: 380 }}>
          <div style={{ height: 3, width: 56, background: GOLD, marginBottom: 18 }} />
          <h1 style={{ fontSize: 22, margin: "0 0 6px" }}>Admin sign in</h1>
          <p style={{ color: MUT, fontSize: 13, margin: "0 0 18px", lineHeight: 1.5 }}>
            Sign in with your admin email and password.
          </p>
          <input
            style={input}
            type="email"
            inputMode="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
          <input
            style={input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            onKeyDown={(e) => {
              if (e.key === "Enter") void doLogin();
            }}
          />
          {loginError && (
            <p style={{ color: "#d9847a", fontSize: 12.5, marginTop: 10 }}>
              {loginError}
            </p>
          )}
          <button
            onClick={() => void doLogin()}
            disabled={signingIn || !email || !password}
            style={{
              width: "100%",
              marginTop: 16,
              border: "none",
              borderRadius: 12,
              padding: "13px",
              fontSize: 15,
              fontWeight: 800,
              cursor: signingIn ? "default" : "pointer",
              color: "#06101a",
              background: signingIn ? "#1a1f2b" : TEAL,
            }}
          >
            {signingIn ? "Signing in…" : "Sign in"}
          </button>
          <a href="/" style={{ color: TEAL, fontSize: 13, display: "inline-block", marginTop: 14 }}>
            ← Back to Living Worlds
          </a>
        </div>
      </div>
    );
  }

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
          <h1 style={{ fontSize: 22, margin: "0 0 8px" }}>Not an admin</h1>
          <p style={{ color: MUT, lineHeight: 1.6 }}>
            You&apos;re signed in, but this account isn&apos;t marked as an admin.
          </p>
          <button
            onClick={() => void doSignOut()}
            style={{
              marginTop: 12,
              border: `1px solid ${LINE}`,
              background: "transparent",
              color: MUT,
              borderRadius: 10,
              padding: "8px 14px",
              cursor: "pointer",
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  // ---- DASHBOARD ------------------------------------------------------------
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
      <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: MUT }}>
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
          <div style={{ height: 3, width: 56, background: GOLD }} />
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <button
              onClick={() => void doSignOut()}
              style={{ background: "none", border: "none", color: MUT, fontSize: 13, cursor: "pointer" }}
            >
              Sign out
            </button>
            <a href="/" style={{ color: TEAL, fontSize: 13 }}>← App</a>
          </div>
        </div>
        <h1 style={{ fontSize: 26, margin: "6px 0 2px" }}>Living Worlds — Analytics</h1>
        <p style={{ color: MUT, fontSize: 13, margin: "0 0 18px" }}>
          Internal product funnel · source of truth
        </p>

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
          {loading && <span style={{ color: MUT, fontSize: 12, alignSelf: "center" }}>updating…</span>}
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 26 }}>
          {kpiCard("Visitors", kpis?.visitors)}
          {kpiCard("Sessions", kpis?.sessions)}
          {kpiCard("Returning", kpis?.returning_visitors)}
          {kpiCard("Total events", kpis?.total_events)}
        </div>

        <h2 style={{ fontSize: 16, margin: "0 0 12px" }}>Revenue</h2>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 26 }}>
          {(() => {
            const net = Number(rev?.net_revenue ?? 0);
            const gross = Number(rev?.gross_revenue ?? 0);
            const fmt = (n: number) =>
              "$" + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            const visitors = kpis?.visitors ?? 0;
            const purchases = rev?.purchases ?? 0;
            const conv = visitors ? ((purchases / visitors) * 100).toFixed(1) + "%" : "—";
            const card = (label: string, value: string) => (
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
                <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: MUT }}>
                  {label}
                </div>
                <div style={{ fontSize: 26, fontWeight: 800, color: GOLD, marginTop: 4 }}>
                  {value}
                </div>
              </div>
            );
            return (
              <>
                {card("Net revenue", fmt(net))}
                {card("Purchases", String(purchases))}
                {card("Conversion", conv)}
                {card("Refunds", String(rev?.refunds ?? 0))}
              </>
            );
          })()}
        </div>

        <h2 style={{ fontSize: 16, margin: "0 0 12px" }}>Participation funnel</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 10,
          }}
        >
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
                  padding: "12px 13px",
                  display: "flex",
                  flexDirection: "column",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: MUT,
                      letterSpacing: ".08em",
                    }}
                  >
                    STEP {i + 1}
                  </span>
                  <span style={{ fontSize: 22, fontWeight: 800, color: TEAL, lineHeight: 1 }}>
                    {n}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    marginBottom: 8,
                    minHeight: 32,
                    lineHeight: 1.25,
                  }}
                >
                  {s.label}
                </div>
                <div
                  style={{
                    height: 6,
                    borderRadius: 4,
                    background: LINE,
                    overflow: "hidden",
                    marginBottom: 7,
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
                <div style={{ fontSize: 10.5, color: MUT, lineHeight: 1.45 }}>
                  {pctTop}% of visitors
                  {i > 0 && (
                    <>
                      <br />
                      {stepConv}% from prev
                      {drop > 0 && (
                        <span style={{ color: "#d9847a" }}> · {drop} dropped</span>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <JourneyFlow />

        <p style={{ color: MUT, fontSize: 11.5, marginTop: 20, lineHeight: 1.6 }}>
          Unique visitors per step over the selected window — your own first-party
          data, complementing Clarity and Vercel. Newly deployed events take time
          to accumulate.
        </p>
      </div>
    </div>
  );
}