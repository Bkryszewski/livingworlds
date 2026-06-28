"use client";
import { useMemo, useState } from "react";
import type { Lang, Role, World } from "@/lib/types";
import { t } from "@/lib/i18n";
import { computeCoverage } from "@/lib/coverage";
import PassCTA from "./PassCTA";

/**
 * YourCut — the closing payoff. Shows the AI cinematic recap, the playthrough
 * rendered as a saveable script, a mini greenlight coverage card (local
 * metrics, no AI call), the run stats, then the Pass CTA.
 */
export default function YourCut({
  world,
  role,
  lang,
  assistance,
  cut,
  script,
  loading,
  stats,
  onBoxOffice,
  onReplay,
}: {
  world: World;
  role: Role;
  lang: Lang;
  assistance: string;
  cut: string;
  script: string;
  loading: boolean;
  stats: { trust: number; clues: number; exchanges: number };
  onBoxOffice: () => void;
  onReplay: () => void;
}) {
  const [scriptOpen, setScriptOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const coverage = useMemo(
    () => computeCoverage(stats, { archiveSize: world.archive.length }),
    [stats, world.archive.length]
  );

  const recLabel =
    coverage.recommendation === "Recommend"
      ? t(lang, "recRecommend")
      : coverage.recommendation === "Consider"
      ? t(lang, "recConsider")
      : t(lang, "recPass");
  const recColor =
    coverage.recommendation === "Recommend"
      ? "#43C97A"
      : coverage.recommendation === "Consider"
      ? "#E6A85C"
      : "#d9544a";

  function fileText(): string {
    const lines = [
      script || "",
      "",
      "- - -",
      `GREENLIGHT COVERAGE - ${world.title}`,
      `Overall: ${coverage.score}/10   ${coverage.recommendation}`,
      ...coverage.categories.map(
        (c) => `${t(lang, "cov_" + c.id)}: ${c.score}/10`
      ),
      `Clues: ${stats.clues}   Exchanges: ${stats.exchanges}   Trust: ${stats.trust}%`,
    ];
    return lines.join("\n");
  }

  async function copyScript() {
    try {
      await navigator.clipboard.writeText(fileText());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked - Download still works */
    }
  }

  function downloadScript() {
    try {
      const blob = new Blob([fileText()], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${world.id}-${(role.label || "cut")
        .toLowerCase()
        .replace(/\s+/g, "-")}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      /* download blocked - Copy still works */
    }
  }

  return (
    <div className="lw-view">
      <div className="lw-kicker" style={{ color: world.accent }}>
        {world.title} · {role.label}
      </div>
      <h1 className="lw-title" style={{ marginBottom: 4 }}>
        {t(lang, "yourCut")}
      </h1>
      <p className="lw-sub" style={{ marginBottom: 14 }}>
        {t(lang, "cutSubtitle")}
      </p>

      <div className="lw-cut" style={{ ["--accent" as string]: world.accent }}>
        <p className="ctxt">
          {loading ? t(lang, "thinking") : cut || t(lang, "thinking")}
        </p>
      </div>

      {/* mini greenlight coverage */}
      <div className="lw-flabel">{t(lang, "greenlightCoverage")}</div>
      <div className="lw-cov" style={{ ["--accent" as string]: world.accent }}>
        <div className="lw-covhead">
          <span className="rec" style={{ background: recColor }}>
            {recLabel}
          </span>
          <span className="ov">
            <b>{coverage.score}</b>
            <span>/10</span>
          </span>
        </div>
        {coverage.categories.map((c) => (
          <div key={c.id} className="lw-covrow">
            <span className="nm">{t(lang, "cov_" + c.id)}</span>
            <span className="bar">
              <span style={{ width: c.score * 10 + "%" }} />
            </span>
            <span className="nv">{c.score}</span>
          </div>
        ))}
      </div>

      {/* script — open a full reader */}
      <div className="lw-scriptrow">
        <button className="lw-scriptbtn" onClick={() => setScriptOpen(true)}>
          ⤢ {t(lang, "yourScript")}
        </button>
        <button className="lw-scriptbtn" onClick={copyScript}>
          {copied ? t(lang, "copied") : t(lang, "copyText")}
        </button>
        <button className="lw-scriptbtn" onClick={downloadScript}>
          {t(lang, "downloadTxt")}
        </button>
      </div>

      <div className="lw-stats" style={{ marginTop: 16 }}>
        <div className="lw-stat" style={{ ["--accent" as string]: world.accent }}>
          <div className="sk">{t(lang, "role")}</div>
          <div className="sv" style={{ color: world.accent, fontSize: 14 }}>
            {role.label}
          </div>
        </div>
        <div className="lw-stat" style={{ ["--accent" as string]: world.accent }}>
          <div className="sk">{t(lang, "assistance")}</div>
          <div className="sv" style={{ color: world.accent, fontSize: 14 }}>
            {assistance}
          </div>
        </div>
        <div className="lw-stat" style={{ ["--accent" as string]: world.accent }}>
          <div className="sk">{t(lang, "cluesFound")}</div>
          <div className="sv" style={{ color: world.accent }}>
            {stats.clues}
          </div>
        </div>
        <div className="lw-stat" style={{ ["--accent" as string]: world.accent }}>
          <div className="sk">{t(lang, "exchanges")}</div>
          <div className="sv" style={{ color: world.accent }}>
            {stats.exchanges}
          </div>
        </div>
      </div>

      <PassCTA lang={lang} onBoxOffice={onBoxOffice} onReplay={onReplay} />

      {scriptOpen && (
        <div className="lw-modal" onClick={() => setScriptOpen(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(680px, 94vw)",
              height: "min(86vh, 920px)",
              display: "flex",
              flexDirection: "column",
              background: "#0a0d14",
              border: "1px solid var(--line)",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 24px 80px rgba(0,0,0,.6)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                padding: "14px 16px",
                borderBottom: "1px solid var(--line)",
                flex: "0 0 auto",
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 15,
                  color: "var(--ink, #f5f0df)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {world.title} · {role.label}
              </div>
              <button
                onClick={() => setScriptOpen(false)}
                aria-label="Close"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--faint, #9aa0ad)",
                  fontSize: 22,
                  lineHeight: 1,
                  cursor: "pointer",
                  flex: "0 0 auto",
                }}
              >
                ✕
              </button>
            </div>

            <pre
              style={{
                flex: "1 1 auto",
                overflowY: "auto",
                margin: 0,
                padding: "20px",
                background: "#0a0d14",
                color: "#e8edf7",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 14.5,
                lineHeight: 1.75,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {script || t(lang, "thinking")}
            </pre>

            <div
              style={{
                display: "flex",
                gap: 8,
                padding: "12px 16px",
                borderTop: "1px solid var(--line)",
                flex: "0 0 auto",
              }}
            >
              <button className="lw-scriptbtn" onClick={copyScript}>
                {copied ? t(lang, "copied") : t(lang, "copyText")}
              </button>
              <button className="lw-scriptbtn" onClick={downloadScript}>
                {t(lang, "downloadTxt")}
              </button>
              <button
                className="lw-scriptbtn"
                style={{ marginLeft: "auto" }}
                onClick={() => setScriptOpen(false)}
              >
                {lang === "es" ? "Cerrar" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}