"use client";
// components/Account.tsx — the sign-in / credential overlay.
// Passwordless: enter name + email, receive a magic link, return signed in.
// Guests can dismiss it and keep playing. Festival language throughout
// (no "subscription" / "account" jargon in the credential copy).

import { useState } from "react";
import type { Lang } from "@/lib/types";
import { sendMagicLink, signOut, type LWProfile } from "@/lib/supabase";

const TIER_LABEL: Record<string, { en: string; es: string }> = {
  guest: { en: "Guest Pass", es: "Pase de Invitado" },
  festival: { en: "Festival Pass", es: "Pase de Festival" },
  judge: { en: "Judge's Credential", es: "Credencial de Jurado" },
  studio: { en: "Studio Pass", es: "Pase de Estudio" },
};

export default function Account({
  lang,
  profile,
  onSignedOut,
  onClose,
}: {
  lang: Lang;
  profile: LWProfile | null;
  onSignedOut: () => void;
  onClose: () => void;
}) {
  const es = lang === "es";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const valid =
    name.trim().length > 0 && /\S+@\S+\.\S+/.test(email.trim());

  const ghost: React.CSSProperties = {
    marginTop: 10,
    width: "100%",
    background: "transparent",
    border: "1px solid var(--line, #2a2a33)",
    color: "var(--faint, #9aa0ad)",
    borderRadius: 12,
    padding: "11px 14px",
    cursor: "pointer",
    font: "inherit",
  };

  async function submit() {
    if (!valid || busy) return;
    setBusy(true);
    setErr("");
    try {
      await sendMagicLink(email.trim(), name.trim(), lang);
      setSent(true);
    } catch {
      setErr(
        es
          ? "No se pudo enviar el enlace. Revisa el correo e intenta de nuevo."
          : "Couldn't send the link. Check the address and try again."
      );
    } finally {
      setBusy(false);
    }
  }

  // --- Signed-in view ---
  if (profile) {
    const tier = TIER_LABEL[profile.pass_tier] || TIER_LABEL.guest;
    return (
      <div className="lw-view" style={{ paddingTop: 8 }}>
        <div className="lw-kicker">
          {es ? "Tu credencial" : "Your credential"}
        </div>
        <h1 className="lw-title" style={{ marginBottom: 8 }}>
          {profile.name || (es ? "Bienvenido" : "Welcome")}
        </h1>
        <p className="lw-sub">{profile.email}</p>
        <p className="lw-onbnote" style={{ marginTop: 14 }}>
          {(es ? "Pase actual" : "Current pass") + ": "}
          {es ? tier.es : tier.en}
        </p>
        <button
          className="lw-cta"
          style={{ marginTop: 18 }}
          onClick={async () => {
            await signOut();
            onSignedOut();
            onClose();
          }}
        >
          {es ? "Cerrar sesión" : "Sign out"}
        </button>
        <button style={ghost} onClick={onClose}>
          {es ? "Volver" : "Back"}
        </button>
      </div>
    );
  }

  // --- Link-sent confirmation ---
  if (sent) {
    return (
      <div className="lw-view" style={{ paddingTop: 8 }}>
        <div className="lw-kicker">
          {es ? "Revisa tu correo" : "Check your email"}
        </div>
        <h1 className="lw-title" style={{ marginBottom: 8 }}>
          {es ? "Enlace enviado" : "Link sent"}
        </h1>
        <p className="lw-sub">
          {es
            ? `Enviamos un enlace de acceso a ${email}. Ábrelo en este dispositivo para entrar.`
            : `We sent a sign-in link to ${email}. Open it on this device to enter.`}
        </p>
        <button className="lw-cta" style={{ marginTop: 18 }} onClick={onClose}>
          {es ? "Entendido" : "Got it"}
        </button>
      </div>
    );
  }

  // --- Sign-in form ---
  return (
    <div className="lw-view" style={{ paddingTop: 8 }}>
      <div className="lw-kicker">{es ? "Acceso" : "Sign in"}</div>
      <h1 className="lw-title" style={{ marginBottom: 8 }}>
        {es ? "Guarda tu credencial" : "Save your credential"}
      </h1>
      <p className="lw-sub">
        {es
          ? "Sin contraseña. Te enviamos un enlace para entrar y guardar tu progreso y tu pase."
          : "No password. We'll email you a link to sign in and keep your progress and pass."}
      </p>

      <label className="lw-onblabel">{es ? "Tu nombre" : "Your name"}</label>
      <input
        className="lw-onbin"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={es ? "Nombre" : "Name"}
        autoFocus
      />

      <label className="lw-onblabel">{es ? "Tu correo" : "Your email"}</label>
      <input
        className="lw-onbin"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={es ? "tu@correo.com" : "you@email.com"}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
      />

      {err && (
        <p className="lw-onbnote" style={{ color: "var(--danger, #E5484D)" }}>
          {err}
        </p>
      )}

      <button
        className="lw-cta"
        style={{ marginTop: 18 }}
        disabled={!valid || busy}
        onClick={submit}
      >
        {busy
          ? es
            ? "Enviando…"
            : "Sending…"
          : es
          ? "Enviarme el enlace"
          : "Email me the link"}{" "}
        →
      </button>
      <button style={ghost} onClick={onClose}>
        {es ? "Ahora no" : "Not now"}
      </button>
    </div>
  );
}
