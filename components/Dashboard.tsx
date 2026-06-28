"use client";
import type { Lang, World } from "@/lib/types";
import { t } from "@/lib/i18n";
import { deriveSkills, type PlayerProgress, type CutRecord } from "@/lib/progress";

/**
 * Dashboard — the player's profile / progress screen. Shows their festival
 * credential, RPG-style skills that grow with play, lifetime totals, a roster
 * of worlds they've played, and their saved cuts (scene scripts) with copy /
 * download. When signed in, all of this is the account's own history (from
 * Supabase); as a guest it's local to the browser.
 */
export default function Dashboard({
  lang,
  progress,
  cuts,
  passLabel,
  worlds,
  onOpenWorld,
  onBoxOffice,
  onReset,
}: {
  lang: Lang;
  progress: PlayerProgress;
  cuts: CutRecord[];
  passLabel: string;
  worlds: World[];
  onOpenWorld: (id: string) => void;
  onBoxOffice: () => void;
  onReset: () => void;
}) {
  const skills = deriveSkills(progress);
  const playedIds = Object.keys(progress.worlds);
  const played = worlds.filter((w) => playedIds.includes(w.id));

  function cutFileText(c: CutRecord): string {
    return c.script || "";
  }
  function copyCut(c: CutRecord) {
    try {
      void navigator.clipboard.writeText(cutFileText(c));
    } catch {
      /* clipboard blocked */
    }
  }
  function downloadCut(c: CutRecord) {
    try {
      const blob = new Blob([cutFileText(c)], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${c.worldId}-cut.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      /* download blocked */
    }
  }

  return (
    <div className="lw-view">
      <div className="lw-kicker">{t(lang, "dashboardKicker")}</div>
      <h1 className="lw-title" style={{ marginBottom: 8 }}>
        {t(lang, "dashboard")}
      </h1>

      <button className="lw-credchip" onClick={onBoxOffice}>
        <span className="lbl">{t(lang, "credential")}</span>
        <span className="val">{passLabel}</span>
        <span className="go">{t(lang, "manage")} →</span>
      </button>

      <div className="lw-flabel">{t(lang, "skills")}</div>
      <div className="lw-skills">
        {skills.map((s) => (
          <div key={s.id} className="lw-skill">
            <div className="row">
              <span className="nm">{s.label}</span>
              <span className="lv">Lv {s.level}</span>
            </div>
            <div className="bar">
              <span style={{ width: s.pct + "%" }} />
            </div>
            <div className="bl">{s.blurb}</div>
          </div>
        ))}
      </div>

      <div className="lw-flabel">{t(lang, "totals")}</div>
      <div className="lw-stats">
        <div className="lw-stat">
          <div className="sk">{t(lang, "playthroughs")}</div>
          <div className="sv">{progress.totalPlays}</div>
        </div>
        <div className="lw-stat">
          <div className="sk">{t(lang, "cluesFound")}</div>
          <div className="sv">{progress.totalClues}</div>
        </div>
        <div className="lw-stat">
          <div className="sk">{t(lang, "exchanges")}</div>
          <div className="sv">{progress.totalExchanges}</div>
        </div>
        <div className="lw-stat">
          <div className="sk">{t(lang, "worldsPlayed")}</div>
          <div className="sv">{played.length}</div>
        </div>
      </div>

      <div className="lw-flabel">{t(lang, "worldsPlayed")}</div>
      {played.length === 0 ? (
        <p className="lw-sub">{t(lang, "noPlaysYet")}</p>
      ) : (
        <div className="lw-dashworlds">
          {played.map((w) => {
            const wp = progress.worlds[w.id];
            return (
              <button
                key={w.id}
                className="lw-worldrow"
                onClick={() => onOpenWorld(w.id)}
                style={{ ["--accent" as string]: w.accent }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={w.poster} alt={w.title} />
                <div className="meta">
                  <div className="ti">
                    {w.title}
                    {wp.completed && <span className="done">✓</span>}
                  </div>
                  <div className="su">
                    {wp.plays}× · {wp.roles.length} {t(lang, "rolesShort")} ·{" "}
                    {wp.clues} {t(lang, "cluesShort")} · {wp.bestTrust}%{" "}
                    {t(lang, "trust")}
                  </div>
                </div>
                <span className="go">→</span>
              </button>
            );
          })}
        </div>
      )}

      {cuts.length > 0 && (
        <>
          <div className="lw-flabel">
            {lang === "es" ? "Tus versiones (cuts)" : "Your cuts"}
          </div>
          <div className="lw-dashworlds">
            {cuts.map((c, i) => {
              const w = worlds.find((x) => x.id === c.worldId);
              const role = w?.roles.find((r) => r.id === c.roleId);
              return (
                <div
                  key={i}
                  className="lw-worldrow"
                  style={{ ["--accent" as string]: w?.accent || "#5BE0E6" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {w && <img src={w.poster} alt={w.title} />}
                  <div className="meta">
                    <div className="ti">{w?.title || c.worldId}</div>
                    <div className="su">
                      {role?.label || c.roleId || ""}
                      {c.coverageScore != null
                        ? ` · ${c.coverageScore}/10`
                        : ""}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      className="lw-scriptbtn"
                      onClick={() => copyCut(c)}
                      disabled={!c.script}
                    >
                      {t(lang, "copyText")}
                    </button>
                    <button
                      className="lw-scriptbtn"
                      onClick={() => downloadCut(c)}
                      disabled={!c.script}
                    >
                      {t(lang, "downloadTxt")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <button
        className="lw-cta ghost"
        style={{ marginTop: 18, marginBottom: 24 }}
        onClick={onReset}
      >
        {t(lang, "resetProgress")}
      </button>
    </div>
  );
}