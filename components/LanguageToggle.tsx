"use client";
import type { Lang } from "@/lib/types";
import { LANGS } from "@/lib/i18n";

export default function LanguageToggle({
  lang,
  onChange,
}: {
  lang: Lang;
  onChange: (l: Lang) => void;
}) {
  return (
    <div className="lw-langtoggle" role="group" aria-label="Language">
      {LANGS.map((l) => (
        <button
          key={l.id}
          className={lang === l.id ? "on" : ""}
          onClick={() => onChange(l.id)}
          aria-pressed={lang === l.id}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
