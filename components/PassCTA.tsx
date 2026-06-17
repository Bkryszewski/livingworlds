"use client";
import type { Lang } from "@/lib/types";
import { t } from "@/lib/i18n";

/**
 * PassCTA — the closing prompt that points to the Festival Box Office.
 * Festival framing only (Guest / Festival / Judge's / Studio); never the word
 * "subscription." The Box Office screen is where passes are actually chosen.
 */
export default function PassCTA({
  lang,
  onBoxOffice,
  onReplay,
}: {
  lang: Lang;
  onBoxOffice: () => void;
  onReplay: () => void;
}) {
  return (
    <div className="lw-passcard">
      <h3>{t(lang, "unlockTitle")}</h3>
      <p>{t(lang, "unlockBody")}</p>

      <button className="lw-cta" onClick={onBoxOffice}>
        🎟 {t(lang, "boxOfficeCta")}
      </button>

      <button
        className="lw-cta ghost"
        onClick={onReplay}
        style={{ marginTop: 14 }}
      >
        {t(lang, "playAnother")}
      </button>
    </div>
  );
}
