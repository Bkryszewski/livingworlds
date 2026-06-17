"use client";
import type { Lang } from "@/lib/types";
import { t, LANGS } from "@/lib/i18n";

/**
 * Hero — the title experience. Lands the audience inside Living Worlds and
 * gates entry on a language choice (step 2 of the flow). Preserves the
 * prototype's cinematic title treatment.
 */
export default function Hero({
  lang,
  onLang,
  onEnter,
}: {
  lang: Lang;
  onLang: (l: Lang) => void;
  onEnter: () => void;
}) {
  return (
    <div className="lw-view" style={{ justifyContent: "center" }}>
      <div className="lw-kicker">{t(lang, "presents")}</div>
      <h1 className="lw-title" style={{ fontSize: 40, letterSpacing: "0.04em" }}>
        {t(lang, "brand")}
      </h1>
      <p className="lw-sub">{t(lang, "promise")}</p>

      <div className="lw-flabel">{t(lang, "chooseLanguage")}</div>
      <div className="lw-assist" style={{ marginBottom: 22 }}>
        {LANGS.map((l) => (
          <button
            key={l.id}
            className={`lw-arow ${lang === l.id ? "on" : ""}`}
            onClick={() => onLang(l.id)}
          >
            <span className="an">{l.label}</span>
          </button>
        ))}
      </div>

      <button className="lw-cta" onClick={onEnter}>
        {t(lang, "enter")}
      </button>
    </div>
  );
}
