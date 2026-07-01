"use client";
import { useState } from "react";
import type { Lang } from "@/lib/types";

/**
 * SaveEmail — lightweight, lead-only capture. Shown two ways:
 *   • reason="exit" — the back arrow during a story (only after real progress)
 *   • reason="cut"  — on the Your Cut payoff screen
 * Always skippable. Captures the email as a marketing lead (saveLead upstream);
 * it is NOT sign-in — real cross-device sync lives behind the HUD "Sign in".
 * Copy promises only what a lead delivers: we email you when there's more.
 */
const COPY = {
  en: {
    title: "Save your Perdido",
    leadExit: "You're onto something.",
    leadCut: "That's a wrap.",
    body: "Leave your email and we'll let you know when there's more to play — new roles, new cases, the other side of the story.",
    nameLabel: "Your name",
    optional: "optional",
    namePh: "First name",
    emailPh: "you@email.com",
    save: "Save",
    skipExit: "Leave without saving",
    skipCut: "No thanks",
  },
  es: {
    title: "Guarda tu Perdido",
    leadExit: "Vas por buen camino.",
    leadCut: "Eso es todo.",
    body: "Déjanos tu correo y te avisamos cuando haya más por jugar — nuevos papeles, nuevos casos, el otro lado de la historia.",
    nameLabel: "Tu nombre",
    optional: "opcional",
    namePh: "Nombre",
    emailPh: "tu@correo.com",
    save: "Guardar",
    skipExit: "Salir sin guardar",
    skipCut: "Ahora no",
  },
} as const;

export default function SaveEmail({
  lang,
  reason,
  accent,
  defaultName = "",
  defaultEmail = "",
  onSave,
  onSkip,
}: {
  lang: Lang;
  reason: "exit" | "cut";
  accent: string;
  defaultName?: string;
  defaultEmail?: string;
  onSave: (email: string, name: string) => void;
  onSkip: () => void;
}) {
  const c = COPY[lang] ?? COPY.en;
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const emailOk = /\S+@\S+\.\S+/.test(email.trim());

  function submit() {
    if (!emailOk) return;
    onSave(email.trim(), name.trim());
  }

  return (
    <div className="lw-modal" onClick={onSkip}>
      <div className="lw-modalcard" onClick={(e) => e.stopPropagation()}>
        <div className="lw-view" style={{ paddingTop: 8 }}>
          <div className="lw-kicker" style={{ color: accent }}>
            {reason === "exit" ? c.leadExit : c.leadCut}
          </div>
          <h1 className="lw-title" style={{ marginBottom: 8 }}>
            {c.title}
          </h1>
          <p className="lw-sub" style={{ marginBottom: 14 }}>
            {c.body}
          </p>

          <input
            className="lw-onbin"
            type="email"
            inputMode="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={c.emailPh}
            onKeyDown={(e) => {
              if (e.key === "Enter" && emailOk) submit();
            }}
          />
          <label className="lw-onblabel">
            {c.nameLabel}{" "}
            <span
              style={{
                color: "var(--faint)",
                textTransform: "none",
                letterSpacing: 0,
              }}
            >
              · {c.optional}
            </span>
          </label>
          <input
            className="lw-onbin"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={c.namePh}
            onKeyDown={(e) => {
              if (e.key === "Enter" && emailOk) submit();
            }}
          />

          <button
            className="lw-cta"
            disabled={!emailOk}
            onClick={submit}
            style={{ background: accent, marginTop: 16 }}
          >
            {c.save}
          </button>
          <button
            onClick={onSkip}
            style={{
              marginTop: 10,
              width: "100%",
              background: "transparent",
              border: "1px solid var(--line, #2a2a33)",
              color: "var(--faint, #9aa0ad)",
              borderRadius: 12,
              padding: "11px 14px",
              cursor: "pointer",
              font: "inherit",
            }}
          >
            {reason === "exit" ? c.skipExit : c.skipCut}
          </button>
        </div>
      </div>
    </div>
  );
}