// data/evidence.ts — the signature artifact for each world, ported from the
// prototype's evidence screen. The player opens the photo the character sent
// and HOLDS to read the gated margin — which surfaces the warning, then the
// character speaks the reveal line. One discoverable clue per artifact.

export interface Evidence {
  /** Which renderer to use. */
  kind: "journal" | "ball" | "card";
  /** Push-card title + the clue title that gets logged. */
  pushTitle: string;
  /** Big headline on the evidence screen (may contain a line break as \n). */
  headline: string;
  /** Hold-bar prompt. */
  holdText: string;
  /** What the character says after the reveal (added to the thread). */
  revealLine: string;
  /** Gated margin truth (revealed on hold). */
  marginEq: string;
  marginHd: string;
  marginWarn?: string;

  // journal
  jTitle?: string;
  jTorn?: string;
  jLines?: string[];
  // ball
  ballCaption?: string;
  // card
  cardLabel?: string;
  cardRows?: [string, string][];
  pencil?: string;
}

export const EVIDENCE: Record<string, Evidence> = {
  perdido: {
    kind: "journal",
    pushTitle: "The journal",
    headline: "Older than Mexico.\nPressed hard enough to tear.",
    holdText: "hold to read the line beneath the sailor's hand",
    revealLine:
      "three hundred years ago a dead man drew that cave. the same ring. the same symbols. the same water that took me when i was sixteen. it was never a current. it never was. — R",
    jTitle: "PERDIDO",
    jTorn: "the nib tore the fiber",
    jLines: [
      "\u201cThere is a passage off the cape that no chart shows.\u201d",
      "\u201cIt opens \u2014 impossibly \u2014 into air. A compass hunting a north that keeps moving.\u201d",
      "\u201c...the vessel that will carry us home, if God allows. The Perdido.\u201d",
    ],
    marginEq: "THE SEA REMEMBERS ANOTHER WORLD",
    marginHd:
      "\u2014 and beneath it, a ring of symbols. the same cut into the cave Edgar dove. drawn in 1782.",
  },
  manifest: {
    kind: "card",
    pushTitle: "The checkout card",
    headline: "Five names. Five hands.\nSixty years.",
    holdText: "hold to read the pencil pressed into the card",
    revealLine:
      "every hand. sixty years. the same three words pressed hard enough to tear the paper. they weren't wishing \u2014 they were warning each other. now run the names. find me what each wish cost. \u2014 V",
    cardLabel: "Library checkout \u2014 do not remove",
    cardRows: [
      ["R. THOMPSON", "5 / 14 / 1968"],
      ["L. MARTINEZ", "10 / 2 / 1974"],
      ["D. COLLINS", "2 / 17 / 1983"],
      ["M. ALVAREZ", "7 / 19 / 1991"],
      ["J. WHITMAN", "6 / 12 / 1997"],
    ],
    pencil: "\u201cIt works.\u201d",
    marginWarn:
      "be careful what you focus on \u00b7 everything costs energy \u00b7 small changes only",
    marginEq: "MAINTAIN EQUILIBRIUM",
    marginHd: "\u2014 pressed hard, in every hand, decades apart",
  },
  stoppage: {
    kind: "ball",
    pushTitle: "The match ball",
    headline: "One stripe.\nHalf a billion dollars.",
    holdText: "press the seam \u2014 hold to arm-check the transmitter",
    revealLine:
      "armed. one squeeze and the next time the ref palms it for three seconds, half a billion moves before the whistle. seven months for this. find me the man in the suit who handed it off. \u2014 D",
    ballCaption:
      "Match ball \u00b7 a single thin red stripe at the equator. A seam beneath it. A transmitter inside.",
    marginEq: "ARMED \u00b7 LED LIVE",
    marginHd:
      "\u2014 held in the ref's palm three seconds, it fires the signal: half a billion through three accounts before the whistle",
  },
};

export function getEvidence(worldId: string): Evidence | undefined {
  return EVIDENCE[worldId];
}
