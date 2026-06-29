"use client";
import type { Lang, World } from "@/lib/types";
import { t } from "@/lib/i18n";

/**
 * RoleSelector — the audience picks a narrative role. Each role gates the
 * opener, objective, and which evidence the Archive surfaces. The adversarial
 * "Conflict Creator" role is flagged.
 */
export default function RoleSelector({
  world,
  lang,
  selected,
  onSelect,
  onContinue,
}: {
  world: World;
  lang: Lang;
  selected: string | null;
  onSelect: (id: string) => void;
  onContinue: () => void;
}) {
  return (
    <div className="lw-view">
      <div className="lw-kicker" style={{ color: world.accent }}>
        {t(lang, "roleKicker")}
      </div>
      <h1 className="lw-title" style={{ marginBottom: 14 }}>
        {t(lang, "chooseRole")}
      </h1>

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
        disabled={!selected}
        onClick={onContinue}
        style={{ margin: "8px 0 24px" }}
      >
        {t(lang, "chooseAssistance")} →
      </button>
    </div>
  );
}