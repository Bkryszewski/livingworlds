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
  const [showScript, setShowScript] = useState(false);
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

      {/* script - save locally */}
      <div className="lw-scriptrow">
        <button
          className="lw-scriptbtn"
          onClick={() => setShowScript((s) => !s)}
        >
          {showScript ? "▾ " : "▸ "}
          {t(lang, "yourScript")}
        </button>
        <button className="lw-scriptbtn" onClick={copyScript}>
          {copied ? t(lang, "copied") : t(lang, "copyText")}
        </button>
        <button className="lw-scriptbtn" onClick={downloadScript}>
          {t(lang, "downloadTxt")}
        </button>
      </div>
      {showScript && (
        <pre className="lw-scriptbox">{script || t(lang, "thinking")}</pre>
      )}

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
    </div>
  );
}
