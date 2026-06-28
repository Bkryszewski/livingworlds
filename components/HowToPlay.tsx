"use client";
// components/HowToPlay.tsx — a bilingual "how a session works" guide.
// Shown as an overlay from the Hero ("How to play") and the header ("?").
// Doubles as feature discovery: points players at Your Cut's script panel,
// the AI engine, the Dashboard, and signing in.

import type { Lang } from "@/lib/types";

interface Step {
  n: string;
  en: { title: string; body: string };
  es: { title: string; body: string };
}

const STEPS: Step[] = [
  {
    n: "1",
    en: {
      title: "Pick a world",
      body: "Choose any title from the dial. Each one is a self-contained short you can finish in a sitting.",
    },
    es: {
      title: "Elige un mundo",
      body: "Escoge cualquier título del dial. Cada uno es un corto independiente que puedes terminar de una vez.",
    },
  },
  {
    n: "2",
    en: {
      title: "Choose your role",
      body: "Your role changes what the character tells you and how the story bends. Replay a world as a different role to see a new side of it.",
    },
    es: {
      title: "Elige tu rol",
      body: "Tu rol cambia lo que el personaje te cuenta y cómo se inclina la historia. Repite un mundo con otro rol para ver una cara nueva.",
    },
  },
  {
    n: "3",
    en: {
      title: "Play the conversation",
      body: "The character reaches you on a private line. Make choices, ask questions, and uncover evidence in the Archive — hold a piece of evidence to reveal what it's hiding.",
    },
    es: {
      title: "Vive la conversación",
      body: "El personaje te contacta por una línea privada. Toma decisiones, haz preguntas y descubre pruebas en el Archivo — mantén pulsada una prueba para revelar lo que esconde.",
    },
  },
  {
    n: "4",
    en: {
      title: "Reach your ending",
      body: "Your choices lead to one of two endings. There's no wrong way to play it.",
    },
    es: {
      title: "Llega a tu final",
      body: "Tus decisiones llevan a uno de dos finales. No hay una forma incorrecta de jugar.",
    },
  },
  {
    n: "5",
    en: {
      title: "Get Your Cut",
      body: "At the end you receive Your Cut: a cinematic recap, a greenlight coverage score, and your full scene rendered as a script. Tap “▸ Your Script” to read it, then Copy or Download it.",
    },
    es: {
      title: "Recibe tu versión (Your Cut)",
      body: "Al final recibes Your Cut: un resumen cinematográfico, una puntuación de cobertura y tu escena completa convertida en guion. Toca “▸ Your Script” para leerlo, y cópialo o descárgalo.",
    },
  },
  {
    n: "6",
    en: {
      title: "Go deeper (optional)",
      body: "Flip on the AI Engine (○ AI, top bar) with your own key to play an open, improvised version of any world instead of the scripted one.",
    },
    es: {
      title: "Profundiza (opcional)",
      body: "Activa el Motor de IA (○ AI, barra superior) con tu propia clave para jugar una versión abierta e improvisada de cualquier mundo en lugar de la guionizada.",
    },
  },
  {
    n: "7",
    en: {
      title: "Track your progress",
      body: "Open the Dashboard (📊) to see the worlds you've played, the roles you've taken, and your skills grow. Sign in (top bar) to save your name and keep your progress.",
    },
    es: {
      title: "Sigue tu progreso",
      body: "Abre el Tablero (📊) para ver los mundos que jugaste, los roles que tomaste y cómo crecen tus habilidades. Inicia sesión (barra superior) para guardar tu nombre y tu progreso.",
    },
  },
];

export default function HowToPlay({
  lang,
  onClose,
}: {
  lang: Lang;
  onClose: () => void;
}) {
  const es = lang === "es";
  return (
    <div className="lw-view" style={{ paddingTop: 8 }}>
      <div className="lw-kicker">{es ? "Cómo se juega" : "How to play"}</div>
      <h1 className="lw-title" style={{ marginBottom: 6 }}>
        {es ? "Living Worlds" : "Living Worlds"}
      </h1>
      <p className="lw-sub" style={{ marginBottom: 16 }}>
        {es
          ? "Una historia interactiva que resuelves conversando. Así transcurre una sesión."
          : "An interactive story you talk your way through. Here's how a session goes."}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {STEPS.map((s) => {
          const c = es ? s.es : s.en;
          return (
            <div key={s.n} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span
                style={{
                  flex: "0 0 auto",
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  background: "var(--accent, #5BE0E6)",
                  color: "#04121a",
                  fontWeight: 700,
                  fontSize: 13,
                  marginTop: 2,
                }}
              >
                {s.n}
              </span>
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 15,
                    marginBottom: 2,
                    color: "var(--ink, #f5f0df)",
                  }}
                >
                  {c.title}
                </div>
                <div
                  style={{
                    fontSize: 13.5,
                    lineHeight: 1.45,
                    color: "var(--faint, #9aa0ad)",
                  }}
                >
                  {c.body}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="lw-onbnote" style={{ marginTop: 18 }}>
        {es
          ? "Cambia entre inglés y español cuando quieras con el selector de idioma."
          : "Switch between English and Español anytime with the language toggle."}
      </p>

      <button className="lw-cta" style={{ marginTop: 14 }} onClick={onClose}>
        {es ? "Empezar a jugar" : "Start playing"} →
      </button>
    </div>
  );
}