"use client";
import { useState } from "react";
import type { Lang } from "@/lib/types";
import { t } from "@/lib/i18n";

/**
 * Onboard — a one-time capture shown after the hero, before the world selector.
 * Collects a display name (required) and an optional email. Stored locally on
 * the device (no server, no real account yet). The name personalizes the AI
 * character and tags the player's dashboard.
 */
export default function Onboard({
  lang,
  initial,
  onDone,
}: {
  lang: Lang;
  initial: { name: string; email: string };
  onDone: (p: { name: string; email: string }) => void;
}) {
  const [name, setName] = useState(initial.name || "");
  const [email, setEmail] = useState(initial.email || "");
  const valid = name.trim().length > 0;

  return (
    <div className="lw-view">
      <div className="lw-kicker">{t(lang, "welcomeKicker")}</div>
      <h1 className="lw-title" style={{ marginBottom: 8 }}>
        {t(lang, "welcomeTitle")}
      </h1>
      <p className="lw-sub">{t(lang, "welcomeSub")}</p>

      <label className="lw-onblabel">{t(lang, "yourName")}</label>
      <input
        className="lw-onbin"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t(lang, "namePlaceholder")}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter" && valid)
            onDone({ name: name.trim(), email: email.trim() });
        }}
      />

      <label className="lw-onblabel">
        {t(lang, "yourEmail")}{" "}
        <span style={{ color: "var(--faint)", textTransform: "none", letterSpacing: 0 }}>
          · {t(lang, "optional")}
        </span>
      </label>
      <input
        className="lw-onbin"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t(lang, "emailPlaceholder")}
      />

      <button
        className="lw-cta"
        style={{ marginTop: 18 }}
        disabled={!valid}
        onClick={() => onDone({ name: name.trim(), email: email.trim() })}
      >
        {t(lang, "enter")} →
      </button>
      <p className="lw-onbnote">{t(lang, "localOnlyNote")}</p>
    </div>
  );
}
