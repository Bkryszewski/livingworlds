"use client";
import type { Lang } from "@/lib/types";
import { t } from "@/lib/i18n";

/**
 * BoxOffice — the festival-style passes screen. Ported from the Living Worlds
 * "Festival Box Office" handoff (Guest / Festival / Judge's / Studio), adapted
 * to the .lw-* class system. Selecting a pass sets local state and confirms via
 * a toast; billing + feature-gating are intentionally not wired yet.
 */

export interface Pass {
  id: string;
  icon: string;
  name: string;
  price: string;
  priceNote: string;
  accent: string;
  ribbon?: string;
  tag: string;
  perks: string[];
}

export const PASSES: Pass[] = [
  {
    id: "guest",
    icon: "🎟️",
    name: "Guest Pass",
    price: "Free",
    priceNote: "",
    accent: "#9aa6b4",
    tag: "Walk the festival floor.",
    perks: [
      "One featured world, Solo play",
      "The Dimension Dial & standard assistance",
      "A taste of Greenlight Coverage — 1 run",
    ],
  },
  {
    id: "festival",
    icon: "🎬",
    name: "Festival Pass",
    price: "$24.99/yr",
    priceNote: "or $4.99/mo",
    accent: "#46C7E6",
    ribbon: "Most popular",
    tag: "All-access. Every screening, every reality.",
    perks: [
      "Every live world, unlimited playthroughs",
      "Save & resume your cuts",
      "Unlimited Greenlight Coverage, scored 1–10",
      "Read the original — full library",
    ],
  },
  {
    id: "judge",
    icon: "🏆",
    name: "Judge's Credential",
    price: "Earned or premium",
    priceNote: "sit on the jury",
    accent: "#E6A85C",
    tag: "Sit on the jury. Score the cuts.",
    perks: [
      "Everything in the Festival Pass",
      "Judge mode — rate & rank playthroughs",
      "Festival leaderboards & laurels",
      "Earn it by standing, or jump the line",
    ],
  },
  {
    id: "studio",
    icon: "🎥",
    name: "Studio Pass",
    price: "Creator tier",
    priceNote: "run the studio",
    accent: "#C77DFF",
    tag: "Bring your own IP. Run the studio.",
    perks: [
      "Everything in the Judge's Credential",
      "Upload your screenplay or story",
      "Author worlds, roles & canon",
      "Creator dashboard & co-sign credits",
    ],
  },
];

export function passName(id: string): string {
  return (PASSES.find((p) => p.id === id) || PASSES[0]).name;
}

export default function BoxOffice({
  lang,
  current,
  onChoose,
  onBack,
}: {
  lang: Lang;
  current: string;
  onChoose: (id: string) => void;
  onBack: () => void;
}) {
  return (
    <div className="lw-view">
      <button className="lw-back" onClick={onBack} style={{ alignSelf: "flex-start" }}>
        ‹ {t(lang, "back")}
      </button>

      <div className="lw-passhead">
        <div className="lw-passlaurels">❰ ✦ ❱</div>
        <div className="lw-lwmark">LIVING WORLDS</div>
        <div className="lw-passtitle">{t(lang, "boxOffice")}</div>
        <div className="lw-passsub">{t(lang, "boxOfficeSub")}</div>
      </div>

      <div className="lw-passlist">
        {PASSES.map((p) => {
          const isCurrent = current === p.id;
          const cta =
            p.id === "guest"
              ? "Use Guest Pass"
              : p.id === "festival"
              ? "Get Festival Pass"
              : p.id === "judge"
              ? "Claim Credential"
              : "Go Studio";
          return (
            <div
              key={p.id}
              className={"lw-pass" + (isCurrent ? " current" : "")}
              style={{ ["--accent" as string]: p.accent }}
            >
              {p.ribbon && <div className="lw-ribbon">{p.ribbon}</div>}
              <div className="lw-passfoil" />
              <div className="lw-passtop">
                <span className="lw-passicon">{p.icon}</span>
                <div className="lw-passname">
                  <b>{p.name}</b>
                  <span>{p.tag}</span>
                </div>
                <div className="lw-passprice">
                  <b>{p.price}</b>
                  {p.priceNote && <span>{p.priceNote}</span>}
                </div>
              </div>
              <div className="lw-passrip" />
              <div className="lw-perks">
                {p.perks.map((k, i) => (
                  <div className="lw-perk" key={i}>
                    <span className="ck">✓</span>
                    {k}
                  </div>
                ))}
              </div>
              {isCurrent ? (
                <button className="lw-passcta current" disabled>
                  ✦ {t(lang, "yourPass")}
                </button>
              ) : (
                <button className="lw-passcta" onClick={() => onChoose(p.id)}>
                  {cta}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <p className="lw-note" style={{ textAlign: "center" }}>
        {t(lang, "boxOfficeNote")}
      </p>
    </div>
  );
}