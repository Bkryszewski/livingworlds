"use client";
import { useEffect, useState } from "react";
import { WORLDS, getWorld } from "@/data/worlds";
import type { AIConfig, AssistanceLevel, Lang, Stage } from "@/lib/types";
import { DEFAULT_AI_CONFIG } from "@/lib/types";
import { t } from "@/lib/i18n";
import { toEmbedUrl, isVideoFile } from "@/lib/trailer";

import LanguageToggle from "@/components/LanguageToggle";
import Hero from "@/components/Hero";
import WorldSelector from "@/components/WorldSelector";
import RoleSelector from "@/components/RoleSelector";
import AssistanceSelector from "@/components/AssistanceSelector";
import WorldPlayer from "@/components/WorldPlayer";
import YourCut from "@/components/YourCut";
import AIEngine from "@/components/AIEngine";
import BoxOffice, { passName } from "@/components/BoxOffice";
import Dashboard from "@/components/Dashboard";
import Onboard from "@/components/Onboard";
import Account from "@/components/Account";
import HowToPlay from "@/components/HowToPlay";
import { supabase, syncProfile, type LWProfile } from "@/lib/supabase";
import { canPlayWorld, SAMCART_CHECKOUT, effectiveTier } from "@/lib/access";
import {
  loadProgress,
  recordPlaythrough,
  resetProgress,
  EMPTY_PROGRESS,
  type PlayerProgress,
} from "@/lib/progress";

const AI_STORE_KEY = "livingworlds:ai";
const PROFILE_KEY = "livingworlds:profile";

const BOOT_STAT = [
  "scanning adjacent realities",
  "isolating coherent signals",
  "two realities in phase",
  "signal acquired",
];

/** Notify a SamCart (or any) parent frame of our height after view changes. */
function postHeight() {
  if (typeof window === "undefined" || !window.parent) return;
  window.parent.postMessage(
    { type: "livingworlds:height", height: document.documentElement.scrollHeight },
    "*"
  );
}

export default function Page() {
  const [stage, setStage] = useState<Stage>("boot");
  const [lang, setLang] = useState<Lang>("en");
  const [clock, setClock] = useState("");

  const [worldId, setWorldId] = useState<string | null>(null);
  const [roleId, setRoleId] = useState<string | null>(null);
  const [assistance, setAssistance] = useState<AssistanceLevel>("Balanced");
  const [profile, setProfile] = useState<{ name: string; email: string }>({
    name: "",
    email: "",
  });
  const playerName = profile.name;

  const [cut, setCut] = useState("");
  const [cutScript, setCutScript] = useState("");
  const [cutLoading, setCutLoading] = useState(false);
  const [stats, setStats] = useState({ trust: 50, clues: 0, exchanges: 0 });

  // BYOK AI engine config (off by default). Persisted to this browser only.
  const [aiConfig, setAiConfig] = useState<AIConfig>(DEFAULT_AI_CONFIG);
  const [aiOpen, setAiOpen] = useState(false);

  // Festival pass (session-only, like the prototype). "guest" by default.
  const [pass, setPass] = useState("guest");
  const [passFrom, setPassFrom] = useState<Stage>("selector");
  const [progress, setProgress] = useState<PlayerProgress>(EMPTY_PROGRESS);
  const [dashFrom, setDashFrom] = useState<Stage>("selector");
  const [toast, setToast] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const [howToOpen, setHowToOpen] = useState(false);
  const [pendingPass, setPendingPass] = useState<string | null>(null);
  const [authProfile, setAuthProfile] = useState<LWProfile | null>(null);

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast((cur) => (cur === msg ? "" : cur)), 2400);
  }

  function choosePass(id: string) {
    if (id === "guest") {
      setPass("guest");
      flash(lang === "es" ? "Pase de Invitado activo" : "Guest Pass active");
      return;
    }
    // Paid passes: only proceed if a checkout link is configured, and always
    // show the "use the same email" reminder before sending them to SamCart.
    const url = SAMCART_CHECKOUT[id];
    if (!url) {
      flash(
        lang === "es"
          ? "El enlace de pago aún no está configurado."
          : "Checkout link isn't set up yet."
      );
      return;
    }
    setPendingPass(id);
  }

  // Open the SamCart checkout for the pending pass, pre-filling the buyer's
  // email when we know it (so payment and app account match).
  function proceedToCheckout() {
    if (!pendingPass) return;
    const base = SAMCART_CHECKOUT[pendingPass];
    const email = authProfile?.email || profile.email;
    const url = email
      ? base + (base.includes("?") ? "&" : "?") + "email=" + encodeURIComponent(email)
      : base;
    try {
      window.open(url, "_blank", "noopener");
    } catch {
      /* popup blocked */
    }
    setPendingPass(null);
  }

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AI_STORE_KEY);
      if (raw) setAiConfig({ ...DEFAULT_AI_CONFIG, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
    setProgress(loadProgress());
    try {
      const p = window.localStorage.getItem(PROFILE_KEY);
      if (p) setProfile({ name: "", email: "", ...JSON.parse(p) });
    } catch {
      /* ignore */
    }
  }, []);

  function saveProfile(p: { name: string; email: string }) {
    setProfile(p);
    try {
      window.localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
    } catch {
      /* ignore */
    }
  }

  // Apply a signed-in Supabase profile to the running app: personalize by
  // name, follow their saved language, and adopt their pass tier (set by the
  // SamCart webhook in Phase 2; "guest" for everyone during the free launch).
  function applyProfile(p: LWProfile) {
    setAuthProfile(p);
    setProfile((cur) => {
      const next = { name: p.name || cur.name, email: p.email || cur.email };
      try {
        window.localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
    if (p.language === "en" || p.language === "es") setLang(p.language);
    setPass(effectiveTier(p.pass_tier, p.expires));
  }

  // Restore any existing session on load, sync the profile, and react to
  // sign-in / sign-out. No-ops gracefully if auth env vars aren't present.
  useEffect(() => {
    const sb = supabase();
    if (!sb) return;
    let active = true;
    const refresh = async () => {
      const prof = await syncProfile();
      if (active && prof) applyProfile(prof);
    };
    refresh();
    const { data: sub } = sb.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") refresh();
      if (event === "SIGNED_OUT" && active) setAuthProfile(null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateAi(cfg: AIConfig) {
    setAiConfig(cfg);
    try {
      window.localStorage.setItem(AI_STORE_KEY, JSON.stringify(cfg));
    } catch {
      /* ignore */
    }
  }

  const world = worldId ? getWorld(worldId) : null;
  const accent = world?.accent || "#5BE0E6";

  // status-bar clock
  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
      );
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);

  // boot sequence → hero
  const [bootIdx, setBootIdx] = useState(0);
  useEffect(() => {
    if (stage !== "boot") return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setBootIdx(Math.min(i, BOOT_STAT.length - 1));
      if (i >= BOOT_STAT.length - 1) {
        clearInterval(id);
        setTimeout(() => setStage("hero"), 650);
      }
    }, 700);
    return () => clearInterval(id);
  }, [stage]);

  // height messaging for SamCart embed, after each view change
  useEffect(() => {
    postHeight();
  }, [stage]);

  function openWorld(id: string) {
    const w = getWorld(id);
    if (w?.locked) return;
    if (!canPlayWorld(pass, id)) {
      setPassFrom(stage);
      setStage("boxoffice");
      flash(
        lang === "es"
          ? "Consigue el Pase de Festival para abrir este mundo"
          : "Get the Festival Pass to open this world"
      );
      return;
    }
    setWorldId(id);
    setRoleId(null);
    setStage("world");
  }

  function onCutComplete(
    text: string,
    s: { trust: number; clues: number; exchanges: number },
    script: string
  ) {
    setCut(text);
    setStats(s);
    setCutScript(script);
    setCutLoading(false);
    if (worldId) setProgress((p) => recordPlaythrough(p, worldId, roleId, s));
    setStage("cut");
  }

  function resetToSelector() {
    setWorldId(null);
    setRoleId(null);
    setAssistance("Balanced");
    setCut("");
    setStage("selector");
  }

  return (
    <div className="lw-stage">
      <div className="lw-phone">
        <div
          className="lw-screen"
          style={{ ["--accent" as string]: accent }}
        >
          <div className="lw-amb" />
          <div className="lw-island">
            <span className="pip" />
            LIVING WORLDS
          </div>

          {/* status bar */}
          <div className="lw-status">
            <span>{clock}</span>
            <span style={{ fontSize: 11, letterSpacing: ".06em" }}>● ▮▮▮</span>
          </div>

          {/* HUD: brand + language toggle (visible once past boot) */}
          {stage !== "boot" && (
            <div className="lw-hud">
              <button
                className="lw-back"
                onClick={() => {
                  if (stage === "world") setStage("selector");
                  else if (stage === "onboard") setStage("hero");
                  else if (stage === "role") setStage("world");
                  else if (stage === "assistance") setStage("role");
                  else if (stage === "boxoffice") setStage(passFrom);
                  else if (stage === "dashboard") setStage(dashFrom);
                  else if (stage === "selector" || stage === "cut")
                    setStage("hero");
                }}
                style={{ visibility: stage === "hero" ? "hidden" : "visible" }}
              >
                ← {t(lang, "back")}
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {stage !== "dashboard" && (
                  <button
                    className="lw-aibadge"
                    onClick={() => {
                      setDashFrom(stage);
                      setStage("dashboard");
                    }}
                    aria-label={t(lang, "dashboard")}
                  >
                    📊
                  </button>
                )}
                <button
                  className={`lw-aibadge ${aiConfig.enabled ? "on" : ""}`}
                  onClick={() => setAiOpen(true)}
                  aria-label={t(lang, "aiEngine")}
                >
                  {aiConfig.enabled ? "● " : "○ "}
                  {t(lang, "aiEngineShort")}
                </button>
                <button
                  className={`lw-aibadge ${authProfile ? "on" : ""}`}
                  onClick={() => setAccountOpen(true)}
                  aria-label={lang === "es" ? "Cuenta" : "Account"}
                >
                  {authProfile
                    ? `◢ ${
                        (authProfile.name || "").split(" ")[0] ||
                        (lang === "es" ? "Cuenta" : "Account")
                      }`
                    : lang === "es"
                    ? "Entrar"
                    : "Sign in"}
                </button>
                <LanguageToggle lang={lang} onChange={setLang} />
                <button
                  className="lw-aibadge"
                  onClick={() => setHowToOpen(true)}
                  aria-label={lang === "es" ? "Cómo se juega" : "How to play"}
                >
                  ?
                </button>
              </div>
            </div>
          )}

          {/* ===== STAGES ===== */}
          {stage === "boot" && (
            <div className="lw-boot">
              <div className="lw-wordmark">LIVING WORLDS</div>
              <div className="lw-spectrum">
                {Array.from({ length: 11 }).map((_, i) => (
                  <i
                    key={i}
                    style={{ animationDelay: `${i * 0.08}s`, height: 16 }}
                  />
                ))}
              </div>
              <div className="lw-bootstat">{BOOT_STAT[bootIdx]}</div>
            </div>
          )}

          {stage === "hero" && (
            <Hero
              lang={lang}
              onLang={setLang}
              onHowTo={() => setHowToOpen(true)}
              onEnter={() =>
                setStage(profile.name ? "selector" : "onboard")
              }
            />
          )}

          {stage === "onboard" && (
            <Onboard
              lang={lang}
              initial={profile}
              onDone={(p) => {
                saveProfile(p);
                setStage("selector");
              }}
            />
          )}

          {stage === "selector" && (
            <WorldSelector
              worlds={WORLDS}
              lang={lang}
              tier={pass}
              onOpen={openWorld}
              passLabel={passName(pass)}
              onBoxOffice={() => {
                setPassFrom("selector");
                setStage("boxoffice");
              }}
            />
          )}

          {stage === "world" && world && (
            <WorldDetail
              lang={lang}
              onContinue={() => setStage("role")}
              worldId={world.id}
            />
          )}

          {stage === "role" && world && (
            <RoleSelector
              world={world}
              lang={lang}
              selected={roleId}
              onSelect={setRoleId}
              onContinue={() => setStage("assistance")}
            />
          )}

          {stage === "assistance" && world && (
            <AssistanceSelector
              world={world}
              lang={lang}
              selected={assistance}
              onSelect={setAssistance}
              onEnter={() => setStage("player")}
            />
          )}

          {stage === "player" && world && roleId && (
            <WorldPlayer
              world={world}
              roleId={roleId}
              assistance={assistance}
              lang={lang}
              playerName={playerName}
              aiConfig={aiConfig}
              onComplete={onCutComplete}
            />
          )}

          {stage === "cut" && world && roleId && (
            <YourCut
              world={world}
              role={world.roles.find((r) => r.id === roleId)!}
              lang={lang}
              assistance={assistance}
              cut={cut}
              script={cutScript}
              loading={cutLoading}
              stats={stats}
              onBoxOffice={() => {
                setPassFrom("cut");
                setStage("boxoffice");
              }}
              onReplay={resetToSelector}
            />
          )}

          {stage === "boxoffice" && (
            <BoxOffice
              lang={lang}
              current={pass}
              onChoose={choosePass}
              onBack={() => setStage(passFrom)}
            />
          )}

          {stage === "dashboard" && (
            <Dashboard
              lang={lang}
              progress={progress}
              passLabel={passName(pass)}
              worlds={WORLDS}
              onOpenWorld={(id) => openWorld(id)}
              onBoxOffice={() => {
                setPassFrom("dashboard");
                setStage("boxoffice");
              }}
              onReset={() => {
                setProgress(resetProgress());
                flash(lang === "es" ? "Progreso reiniciado" : "Progress reset");
              }}
            />
          )}

          {aiOpen && (
            <div className="lw-modal" onClick={() => setAiOpen(false)}>
              <div
                className="lw-modalcard"
                onClick={(e) => e.stopPropagation()}
              >
                <AIEngine
                  lang={lang}
                  config={aiConfig}
                  onChange={updateAi}
                  onClose={() => setAiOpen(false)}
                />
              </div>
            </div>
          )}

          {accountOpen && (
            <div className="lw-modal" onClick={() => setAccountOpen(false)}>
              <div
                className="lw-modalcard"
                onClick={(e) => e.stopPropagation()}
              >
                <Account
                  lang={lang}
                  profile={authProfile}
                  onSignedOut={() => setAuthProfile(null)}
                  onClose={() => setAccountOpen(false)}
                />
              </div>
            </div>
          )}

          {howToOpen && (
            <div className="lw-modal" onClick={() => setHowToOpen(false)}>
              <div
                className="lw-modalcard"
                onClick={(e) => e.stopPropagation()}
              >
                <HowToPlay lang={lang} onClose={() => setHowToOpen(false)} />
              </div>
            </div>
          )}

          {pendingPass && (
            <div className="lw-modal" onClick={() => setPendingPass(null)}>
              <div
                className="lw-modalcard"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="lw-view" style={{ paddingTop: 8 }}>
                  <div className="lw-kicker">
                    {lang === "es" ? "Antes de pagar" : "Before you pay"}
                  </div>
                  <h1 className="lw-title" style={{ marginBottom: 8 }}>
                    {lang === "es"
                      ? "Usa el mismo correo"
                      : "Use the same email"}
                  </h1>
                  <p className="lw-sub">
                    {authProfile?.email || profile.email
                      ? lang === "es"
                        ? `Llenaremos el pago con tu correo (${
                            authProfile?.email || profile.email
                          }). Paga con ese mismo correo y tu pase se activará solo cuando vuelvas a la app.`
                        : `We'll pre-fill checkout with your email (${
                            authProfile?.email || profile.email
                          }). Pay with that same email and your pass unlocks automatically when you return to the app.`
                      : lang === "es"
                      ? "Después de pagar, inicia sesión en la app con el MISMO correo que uses al pagar. Así se activa tu pase."
                      : "After you pay, sign into the app using the SAME email you use at checkout. That's how your pass unlocks."}
                  </p>
                  <button
                    className="lw-cta"
                    style={{ marginTop: 18 }}
                    onClick={proceedToCheckout}
                  >
                    {lang === "es" ? "Continuar al pago" : "Continue to checkout"}{" "}
                    →
                  </button>
                  <button
                    onClick={() => setPendingPass(null)}
                    style={{
                      marginTop: 10,
                      width: "100%",
                      background: "transparent",
                      border: "1px solid var(--line, #2a2a33)",
                      color: "var(--faint, #9aa0ad)",
                      borderRadius: 12,
                      padding: "11px 14px",
                      cursor: "pointer",
                      font: "inherit",
                    }}
                  >
                    {lang === "es" ? "Cancelar" : "Cancel"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {toast && <div className="lw-toast">{toast}</div>}

          <div className="lw-home" />
        </div>
      </div>
    </div>
  );
}

/** Inline world-detail view: poster, synopsis, trailer placeholder, continue. */
function WorldDetail({
  worldId,
  lang,
  onContinue,
}: {
  worldId: string;
  lang: Lang;
  onContinue: () => void;
}) {
  const world = getWorld(worldId)!;
  const copy = world.copy[lang];
  const [trailerOpen, setTrailerOpen] = useState(false);
  const embed = toEmbedUrl(world.trailer);
  const isFile = isVideoFile(world.trailer);
  return (
    <div className="lw-view">
      <div className="lw-kicker" style={{ color: world.accent }}>
        {copy.subtitle}
      </div>
      <h1 className="lw-title" style={{ marginBottom: 10 }}>
        {world.title}
      </h1>

      <div className="lw-detailposter">
        {embed && trailerOpen ? (
          <>
            {isFile ? (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video
                className="lw-posterplayer"
                src={embed}
                controls
                autoPlay
                playsInline
              />
            ) : (
              <iframe
                className="lw-posterplayer"
                src={embed + (embed.includes("?") ? "&" : "?") + "autoplay=1"}
                title={`${world.title} trailer`}
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            )}
            <button
              className="lw-posterstop"
              onClick={() => setTrailerOpen(false)}
              aria-label="Close trailer"
            >
              ✕
            </button>
          </>
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={world.poster} alt={world.title} />
            <div className="lw-trailer">
              {embed ? (
                <button
                  className="lw-trailerbtn"
                  onClick={() => setTrailerOpen(true)}
                >
                  ▶ {t(lang, "watchTrailer")}
                </button>
              ) : (
                <span className="lw-trailerbtn">▶ {t(lang, "trailerSoon")}</span>
              )}
            </div>
          </>
        )}
      </div>

      <div className="lw-flabel">{t(lang, "synopsis")}</div>
      <p className="lw-sub">{copy.synopsis}</p>

      <button
        className="lw-cta"
        onClick={onContinue}
        style={{ background: world.accent, margin: "6px 0 24px" }}
      >
        {t(lang, "chooseRole")} →
      </button>
    </div>
  );
}