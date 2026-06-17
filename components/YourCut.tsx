"use client";
import type { Lang, Role, World } from "@/lib/types";
import { t } from "@/lib/i18n";
import PassCTA from "./PassCTA";

/**
 * YourCut — the closing "Your Cut" summary screen. Shows the AI-generated
 * cinematic recap, the player's run stats, then the Pass CTA.
 */
export default function YourCut({
  world,
  role,
  lang,
  assistance,
  cut,
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
  loading: boolean;
  stats: { trust: number; clues: number; exchanges: number };
  onBoxOffice: () => void;
  onReplay: () => void;
}) {
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

      <div className="lw-stats">
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
