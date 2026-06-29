"use client";
import type { Lang } from "@/lib/types";
import { t } from "@/lib/i18n";

/**
 * Hero — the title experience. Lands the audience inside Living Worlds and
 * sends them straight into the Dimension Dial. Language is handled by the
 * toggle in the top HUD, so there's no language step here.
 */
export default function Hero({
  lang,
  onEnter,
  onHowTo,
}: {
  lang: Lang;
  onEnter: () => void;
  onHowTo?: () => void;
}) {
  return (
    <div className="lw-view" style={{ justifyContent: "center" }}>
      <div className="lw-kicker">{t(lang, "presents")}</div>
      <h1 className="lw-title" style={{ fontSize: 40, letterSpacing: "0.04em" }}>
        {t(lang, "brand")}
      </h1>
      <p className="lw-sub">{t(lang, "promise")}</p>

      <button className="lw-cta" onClick={onEnter}>
        {t(lang, "enter")}
      </button>

      {onHowTo && (
        <button
          onClick={onHowTo}
          style={{
            marginTop: 14,
            background: "transparent",
            border: "none",
            color: "var(--faint, #9aa0ad)",
            textDecoration: "underline",
            textUnderlineOffset: 3,
            cursor: "pointer",
            font: "inherit",
            fontSize: 13.5,
          }}
        >
          {lang === "es" ? "Cómo se juega" : "How to play"}
        </button>
      )}

      <div
        style={{
          marginTop: 16,
          fontSize: 12,
          color: "var(--faint, #9aa0ad)",
        }}
      >
        <a
          href="/terms"
          style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: 3 }}
        >
          {lang === "es" ? "Términos" : "Terms"}
        </a>
        {"  ·  "}
        <a
          href="/privacy"
          style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: 3 }}
        >
          {lang === "es" ? "Privacidad" : "Privacy"}
        </a>
      </div>
    </div>
  );
}