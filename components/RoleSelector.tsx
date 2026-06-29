"use client";
import { useState } from "react";
import type { Lang, World } from "@/lib/types";
import { t } from "@/lib/i18n";

/**
 * RoleSelector — the audience picks a narrative role. Each role gates the
 * opener, objective, and which evidence the Archive surfaces. The adversarial
 * "Conflict Creator" role is flagged.
 *
 * For guests who haven't given an email yet, this screen also captures
 * email (required) + name (optional) right alongside the role choice, so the
 * details/role page is a single step. Signed-in users (and guests who already
 * provided an email) skip the capture entirely.
 */
export default function RoleSelector({
  world,
  lang,
  selected,
  onSelect,
  initial,
  signedIn,
  onContinue,
}: {
  world: World;
  lang: Lang;
  selected: string | null;
  onSelect: (id: string) => void;
  initial: { name: string; email: string };
  signedIn: boolean;
  onContinue: (p: { name: string; email: string }) => void;
}) {
  const [name, setName] = useState(initial.name || "");
  const [email, setEmail] = useState(initial.email || "");
  // Only ask for an email if we don't already have one (guest, first time).
  const needCapture = !signedIn && !initial.email;
  const emailOk = /\S+@\S+\.\S+/.test(email.trim());
  const canContinue = !!selected && (needCapture ? emailOk : true);

  function go() {
    if (!canContinue) return;
    onContinue(
      needCapture
        ? { name: name.trim(), email: email.trim() }
        : { name: initial.name, email: initial.email }
    );
  }

  return (
    <div className="lw-view">
      <div className="lw-kicker" style={{ color: world.accent }}>
        {t(lang, "roleKicker")}
      </div>
      <h1 className="lw-title" style={{ marginBottom: 14 }}>
        {t(lang, "chooseRole")}
      </h1>

      {needCapture && (
        <div style={{ marginBottom: 6 }}>
          <label className="lw-onblabel">{t(lang, "yourEmail")}</label>
          <input
            className="lw-onbin"
            type="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t(lang, "emailPlaceholder")}
          />
          <label className="lw-onblabel">
            {t(lang, "yourName")}{" "}
            <span
              style={{
                color: "var(--faint)",
                textTransform: "none",
                letterSpacing: 0,
              }}
            >
              · {t(lang, "optional")}
            </span>
          </label>
          <input
            className="lw-onbin"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t(lang, "namePlaceholder")}
          />
        </div>
      )}

      {world.roles.map((r) => (
        <div
          key={r.id}
          className={`lw-rolecard ${selected === r.id ? "on" : ""}`}
          style={{ ["--accent" as string]: world.accent }}
          onClick={() => onSelect(r.id)}
        >
          <div className="rl">
            <span className="rn">{r.label}</span>
            {r.adversary && (
              <span className="badge adv">{t(lang, "conflict")}</span>
            )}
          </div>
          <div className="rt">{r.tagline}</div>
          <div className="rmeta">
            <b style={{ color: world.accent }}>{t(lang, "objective")}:</b>{" "}
            {r.objective}
          </div>
        </div>
      ))}

      <button
        className="lw-cta"
        disabled={!canContinue}
        onClick={go}
        style={{ margin: "8px 0 24px" }}
      >
        {t(lang, "chooseAssistance")} →
      </button>
    </div>
  );
}