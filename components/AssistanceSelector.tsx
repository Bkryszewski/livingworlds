"use client";
import type { AssistanceLevel, Lang, World } from "@/lib/types";
import { t } from "@/lib/i18n";

const LEVELS: { id: AssistanceLevel; key: string; descKey: string }[] = [
  { id: "Guided", key: "guided", descKey: "guidedDesc" },
  { id: "Balanced", key: "balanced", descKey: "balancedDesc" },
  { id: "Independent", key: "independent", descKey: "independentDesc" },
  { id: "Expert", key: "expert", descKey: "expertDesc" },
];

/**
 * AssistanceSelector — how much the story guides the player. This is not a
 * difficulty setting; it controls how proactively the character hints.
 */
export default function AssistanceSelector({
  world,
  lang,
  selected,
  onSelect,
  onEnter,
}: {
  world: World;
  lang: Lang;
  selected: AssistanceLevel;
  onSelect: (a: AssistanceLevel) => void;
  onEnter: () => void;
}) {
  return (
    <div className="lw-view">
      <div className="lw-kicker" style={{ color: world.accent }}>
        {t(lang, "assistKicker")}
      </div>
      <h1 className="lw-title" style={{ marginBottom: 14 }}>
        {t(lang, "chooseAssistance")}
      </h1>

      <div className="lw-assist">
        {LEVELS.map((lvl) => (
          <button
            key={lvl.id}
            className={`lw-arow ${selected === lvl.id ? "on" : ""}`}
            style={{ ["--accent" as string]: world.accent }}
            onClick={() => onSelect(lvl.id)}
          >
            <span className="an">{t(lang, lvl.key)}</span>
            <span className="ad">{t(lang, lvl.descKey)}</span>
          </button>
        ))}
      </div>

      <button
        className="lw-cta"
        onClick={onEnter}
        style={{ margin: "16px 0 24px", background: world.accent }}
      >
        {t(lang, "enterWorld")} →
      </button>
    </div>
  );
}
