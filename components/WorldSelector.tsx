"use client";
import { useRef, useState } from "react";
import type { Lang, World } from "@/lib/types";
import { t } from "@/lib/i18n";
import { canPlayWorld } from "@/lib/access";

/**
 * WorldSelector — the Dimension Dial. A swipeable poster carousel of worlds
 * (ported faithfully from the prototype): scaled/faded side cards, arrows,
 * dots, a Solo/Co-op mode row, and the "Enter [WORLD]" CTA. Locked worlds show
 * "acquiring signal". The Box Office button opens the festival passes.
 */
export default function WorldSelector({
  worlds,
  lang,
  tier,
  onOpen,
  passLabel,
  onBoxOffice,
}: {
  worlds: World[];
  lang: Lang;
  tier?: string;
  onOpen: (id: string) => void;
  passLabel?: string;
  onBoxOffice?: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [mode, setMode] = useState<"solo" | "coop">("solo");
  const dragX = useRef(0);
  const active = worlds[idx] || worlds[0];

  const prev = () => setIdx((i) => Math.max(0, i - 1));
  const next = () => setIdx((i) => Math.min(worlds.length - 1, i + 1));

  // Released world the current tier can't play yet → show a lock, route to passes.
  const gatedFor = (w: World) => !w.locked && !canPlayWorld(tier, w.id);

  const go = (w: World, i: number) => {
    if (i !== idx) {
      setIdx(i);
      return;
    }
    if (w.locked) return;
    if (gatedFor(w)) {
      onBoxOffice?.();
      return;
    }
    onOpen(w.id);
  };

  return (
    <div className="lw-view" style={{ ["--accent" as string]: active.accent }}>
      <div className="lw-dialhead">
        <div className="lw-lwmark">LIVING WORLDS</div>
        <div className="lw-dialkick" style={{ color: active.accent }}>
          {t(lang, "dimensionDial")}
        </div>
        <div className="lw-lwsub">{t(lang, "brandSub")}</div>
      </div>

      {onBoxOffice && (
        <button className="lw-boxoffice" onClick={onBoxOffice}>
          🎟 {t(lang, "boxOffice")}
          {passLabel ? " · " + passLabel : ""}
        </button>
      )}

      <div
        className="lw-dial"
        onPointerDown={(e) => {
          dragX.current = e.clientX;
        }}
        onPointerUp={(e) => {
          const dx = e.clientX - dragX.current;
          if (dx > 42) prev();
          else if (dx < -42) next();
        }}
      >
        <div
          className="lw-dialtrack"
          style={{ transform: `translateX(calc(-${idx} * 250px))` }}
        >
          {worlds.map((w, i) => {
            const copy = w.copy[lang];
            return (
              <div
                key={w.id}
                className={
                  "lw-wcard" +
                  (i === idx ? " active" : "") +
                  (w.locked ? " locked" : "")
                }
                style={{ ["--accent" as string]: w.accent }}
                onClick={() => go(w, i)}
              >
                <div className="cov">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={w.poster} alt={w.title} />
                  <div className="covscrim" />
                  {w.locked && <div className="lockbadge">{t(lang, "soon")}</div>}
                  {gatedFor(w) && (
                    <div className="lockbadge">
                      🔒 {lang === "es" ? "Festival" : "Festival"}
                    </div>
                  )}
                </div>
                <div className="wcbody">
                  <div className="wctop">
                    <span className="wcgenre">{w.genre}</span>
                    <span className="wcsig">
                      {Array.from({ length: 5 }).map((_, k) => (
                        <i key={k} className={w.locked ? "" : "on"} />
                      ))}
                    </span>
                  </div>
                  <div className="wctitle">{w.title}</div>
                  <div className="wcprem">{copy.logline}</div>
                  <div className="wcmeta">{copy.subtitle}</div>
                </div>
              </div>
            );
          })}
        </div>
        <button className="lw-dialarrow left" disabled={idx === 0} onClick={prev}>
          ‹
        </button>
        <button
          className="lw-dialarrow right"
          disabled={idx === worlds.length - 1}
          onClick={next}
        >
          ›
        </button>
      </div>

      <div className="lw-dialhint">{t(lang, "swipeHint")}</div>
      <div className="lw-dialdots">
        {worlds.map((_, i) => (
          <span
            key={i}
            className={"dot" + (i === idx ? " on" : "")}
            onClick={() => setIdx(i)}
          />
        ))}
      </div>

      <div className="lw-moderow">
        <button
          className={"lw-modebtn" + (mode === "solo" ? " on" : "")}
          onClick={() => setMode("solo")}
        >
          <span className="ml">{t(lang, "solo")}</span>
          <span className="ms">{t(lang, "soloSub")}</span>
        </button>
        <button className="lw-modebtn locked" disabled>
          <span className="ml">
            {t(lang, "coop")} <span className="lk">{t(lang, "soon")}</span>
          </span>
          <span className="ms">{t(lang, "coopSub")}</span>
        </button>
      </div>

      <button
        className="lw-cta"
        disabled={active.locked}
        style={{ background: active.accent }}
        onClick={() => {
          if (active.locked) return;
          if (gatedFor(active)) {
            onBoxOffice?.();
            return;
          }
          onOpen(active.id);
        }}
      >
        {active.locked
          ? t(lang, "signalAcquiring")
          : gatedFor(active)
          ? lang === "es"
            ? "🔒 Desbloquear con Festival Pass"
            : "🔒 Unlock with Festival Pass"
          : `${t(lang, "enterPrefix")} ${active.title}`}
      </button>

      <p className="lw-note" style={{ marginTop: 14 }}>
        {t(lang, "dialFooter")}
      </p>
      <div style={{ height: 18 }} />
    </div>
  );
}