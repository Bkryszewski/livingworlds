"use client";
import type { Lang, World } from "@/lib/types";
import { t } from "@/lib/i18n";

/**
 * WorldCard — a cinematic poster card for one world in the selector.
 * Poster paths are placeholders under /public/assets (swap for real art).
 * Uses a plain <img> so any format (incl. placeholder SVGs) renders without
 * next/image SVG restrictions.
 */
export default function WorldCard({
  world,
  lang,
  onOpen,
}: {
  world: World;
  lang: Lang;
  onOpen: (id: string) => void;
}) {
  const copy = world.copy[lang];
  const locked = world.locked;

  return (
    <div
      className={`lw-feature ${locked ? "locked" : ""}`}
      style={{ ["--accent" as string]: world.accent }}
      onClick={() => !locked && onOpen(world.id)}
      role="button"
      aria-disabled={locked}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="poster" src={world.poster} alt={world.title} />
      <div className="scrim" />
      <div className="body">
        <div className="wname">{world.title}</div>
        <div className="tags">
          {copy.subtitle} · {copy.logline}
        </div>
        {locked ? (
          <span className="lockchip">{t(lang, "comingSoon")}</span>
        ) : (
          <span className="go" style={{ background: world.accent }}>
            {t(lang, "open")} →
          </span>
        )}
      </div>
    </div>
  );
}
