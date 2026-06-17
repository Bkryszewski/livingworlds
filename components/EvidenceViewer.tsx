"use client";
import { useEffect, useRef, useState } from "react";
import type { Evidence } from "@/data/evidence";
import type { Lang, World } from "@/lib/types";
import { t } from "@/lib/i18n";

/**
 * EvidenceViewer — the photo the character sent, opened. Renders the signature
 * artifact (journal / match ball / checkout card) and a HOLD-to-read gate that
 * surfaces the margin truth, then reports the reveal up to WorldPlayer (which
 * logs the clue and lets the character speak the reveal line).
 */
export default function EvidenceViewer({
  world,
  evidence,
  lang,
  alreadyRevealed,
  onReveal,
  onBack,
}: {
  world: World;
  evidence: Evidence;
  lang: Lang;
  alreadyRevealed: boolean;
  onReveal: () => void;
  onBack: () => void;
}) {
  const [revealed, setRevealed] = useState(alreadyRevealed);
  const [pct, setPct] = useState(alreadyRevealed ? 100 : 0);
  const timer = useRef<number | null>(null);

  useEffect(() => () => { if (timer.current) window.clearInterval(timer.current); }, []);

  function doReveal() {
    if (revealed) return;
    setRevealed(true);
    setPct(100);
    onReveal();
  }
  function startHold() {
    if (revealed) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const step = reduce ? 50 : 4;
    timer.current = window.setInterval(() => {
      setPct((p) => {
        const np = Math.min(100, p + step);
        if (np >= 100) {
          if (timer.current) window.clearInterval(timer.current);
          doReveal();
        }
        return np;
      });
    }, 30);
  }
  function endHold() {
    if (timer.current) window.clearInterval(timer.current);
    if (!revealed) setPct(0);
  }

  const margin = (
    <div className={"lw-margin" + (revealed ? " show" : "")}>
      {evidence.marginWarn && <div className="w">{evidence.marginWarn}</div>}
      <div className="eq">{evidence.marginEq}</div>
      <div className="hd">{evidence.marginHd}</div>
    </div>
  );

  return (
    <div className="lw-view" style={{ ["--accent" as string]: world.accent }}>
      <button className="lw-back" onClick={onBack} style={{ alignSelf: "flex-start" }}>
        ‹ {t(lang, "back")}
      </button>
      <div className="lw-kicker" style={{ color: world.accent }}>
        {t(lang, "evidence")} · {evidence.pushTitle}
      </div>
      <h1 className="lw-title" style={{ fontSize: 22, marginBottom: 12 }}>
        {evidence.headline.split("\n").map((l, i) => (
          <span key={i}>
            {l}
            {i === 0 && <br />}
          </span>
        ))}
      </h1>

      {evidence.kind === "journal" && (
        <div className="lw-doc journal">
          <div className="lw-jtitle">{evidence.jTitle}</div>
          <div className="lw-jtorn">{evidence.jTorn}</div>
          {evidence.jLines?.map((l, i) => (
            <div className="lw-jline" key={i}>{l}</div>
          ))}
          {margin}
        </div>
      )}

      {evidence.kind === "ball" && (
        <div className="lw-doc" style={{ background: "#13271c", color: "#dfeee6" }}>
          <div className="lw-dl" style={{ color: "#7fb79a" }}>
            Evidence intake · FIFA Security
          </div>
          <div style={{ display: "flex", justifyContent: "center", margin: "4px 0 12px" }}>
            <svg width="116" height="116" viewBox="0 0 116 116" aria-hidden>
              <circle cx="58" cy="58" r="46" fill="#f4f4f2" stroke="#11150f" strokeWidth="2" />
              <polygon points="58,18 76,32 69,54 47,54 40,32" fill="#11150f" opacity=".10" />
              <rect x="12" y="52" width="92" height="11" fill="#e23b3b" />
              <circle cx="58" cy="58" r="46" fill="none" stroke="#11150f" strokeWidth="1.5" />
            </svg>
          </div>
          <div style={{ textAlign: "center", fontSize: 13, color: "#cfe3d9", lineHeight: 1.5 }}>
            {evidence.ballCaption}
          </div>
          <div className={"lw-margin" + (revealed ? " show" : "")} style={{ borderColor: "#2f5a45" }}>
            <div className="eq" style={{ color: "#e23b3b" }}>{evidence.marginEq}</div>
            <div className="hd" style={{ color: "#7fb79a" }}>{evidence.marginHd}</div>
          </div>
        </div>
      )}

      {evidence.kind === "card" && (
        <div className="lw-doc">
          <div className="lw-dl">{evidence.cardLabel}</div>
          {evidence.cardRows?.map(([n, d]) => (
            <div className="lw-drow" key={n}>
              <span>{n}</span>
              <span className="dots" />
              <span className="dt">{d}</span>
            </div>
          ))}
          <div className="lw-pencil">{evidence.pencil}</div>
          {margin}
        </div>
      )}

      {!revealed && (
        <div
          className="lw-hold"
          onPointerDown={startHold}
          onPointerUp={endHold}
          onPointerLeave={endHold}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && doReveal()}
        >
          <div className="lw-holdfill" style={{ width: pct + "%" }} />
          <div className="lw-holdtxt">{pct > 0 ? t(lang, "reading") : evidence.holdText}</div>
        </div>
      )}

      {revealed && (
        <button className="lw-cta" style={{ background: world.accent, marginTop: 16 }} onClick={onBack}>
          {t(lang, "backToComms")}
        </button>
      )}
    </div>
  );
}
