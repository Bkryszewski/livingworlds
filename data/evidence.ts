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
  redmoney: {
    kind: "card",
    pushTitle: "The run sheet",
    headline: "The salted bundles.\nThe one safe cut.",
    holdText: "hold to read the grease pencil pressed into the steel",
    revealLine:
      "wade cut on the wrong side. he never needed my clean opening \u2014 only which bundles are real. but they forgot i kept the box. i can wake every red pack in that vault from across the room. find me the moment they decided i was the part they leave behind. \u2014 L",
    cardLabel: "Sentinel Armored \u2014 Friday consolidation",
    cardRows: [
      ["BUNDLE A1\u2013A6", "CLEAN"],
      ["BUNDLE B1\u2013B4", "SALTED \u00b7 DYE"],
      ["BUNDLE C1\u2013C9", "CLEAN"],
      ["BUNDLE D1\u2013D7", "SALTED \u00b7 DYE"],
      ["CUT MARK", "8 IN LOW \u00b7 LEFT"],
    ],
    pencil: "\u201cCut here. Only here.\u201d",
    marginWarn:
      "salted bundles bloom red \u00b7 the dye does not wash \u00b7 a stained bill is a federal flag",
    marginEq: "THE TECHNICIAN KEPT THE BOX",
    marginHd:
      "\u2014 the arming transmitter, walked out of the depot years ago. never counted, never missed. her insurance.",
  },
  archons: {
    kind: "card",
    pushTitle: "The case file",
    headline: "Three near water.\nNo cause. No witness.",
    holdText: "hold to read the line the toxicology buried",
    revealLine:
      "they were all already open \u2014 drink, pills, the kind of grief that thins a person out. these things don't pick the strong. they pick the ones who can't close. and i have spent my whole life learning to open on command. find me the moment one of them turned toward me. \u2014 R",
    cardLabel: "Task force \u00b7 recovered near water",
    cardRows: [
      ["VICTIM 01", "no cause \u00b7 no entry"],
      ["VICTIM 02", "no cause \u00b7 no entry"],
      ["VICTIM 03", "no cause \u00b7 no entry"],
      ["COMMON", "histories \u00b7 'already thin'"],
    ],
    pencil: "\u201cUncontained. Pulled open.\u201d",
    marginWarn:
      "they follow attention \u00b7 fear sharpens it \u00b7 panic leaves a trail",
    marginEq: "THEY LEARNED THE SHAPE OF HER AWARENESS",
    marginHd:
      "\u2014 they no longer need a broken killer to hunt. they can find anyone who can see them. the viewer is the next coordinate.",
  },
  effect: {
    kind: "card",
    pushTitle: "The scorecard",
    headline: "Six players.\nTwo kinds of memory.",
    holdText: "hold to read the line under the score",
    revealLine:
      "look at who lands together. it's not random. the ones who remember it wrong are the ones who almost died \u2014 who continued. the wrong memory is the residue of the branch they didn't make it out of. find me the moment the chair goes empty. \u2014 E",
    cardLabel: "Game night \u00b7 the split",
    cardRows: [
      ["ETHAN", "wrong \u00b7 3 near-deaths"],
      ["MARCO", "wrong \u00b7 hydroplaned"],
      ["CAMILA", "wrong \u00b7 drowned, age 8"],
      ["CHRIS", "correct \u00b7 took the canyon"],
    ],
    pencil: "\u201cThey remember it wrong.\u201d",
    marginWarn:
      "you don't travel \u00b7 you don't jump \u00b7 you just never live the branch where you don't make it",
    marginEq: "THE ONES WHO REMEMBER WRONG ARE THE ONES WHO CONTINUED",
    marginHd:
      "\u2014 and to name it is to select. the next time they count the chairs, the number will be wrong, and only one of them will notice.",
  },
  optout: {
    kind: "card",
    pushTitle: "The agreement",
    headline: "One choice.\nNo way back.",
    holdText: "hold to read the policy under the options",
    revealLine:
      "accept and you are auto-verified. opt out to protect your data and every service becomes a feature you no longer have. and the selection is final. mail, the door, the hearing \u2014 all of it closes. find me the line that says what 'optimization' really means. \u2014 the system",
    cardLabel: "Unified Residency Agreement",
    cardRows: [
      ["ACCEPT TERMS", "auto-verified"],
      ["OPT OUT", "limited residency"],
      ["MAIL ACCESS", "full-service feature"],
      ["DOOR ACCESS", "safety protocol"],
    ],
    pencil: "\u201cParticipation selection is final.\u201d",
    marginWarn:
      "selections are irreversible \u00b7 local overrides disabled \u00b7 all exceptions audited",
    marginEq: "RESOURCE OPTIMIZATION ACTIVE",
    marginHd:
      "\u2014 limited residency is not a tier. it is an exit. the system is not broken. it is working exactly as designed.",
  },
  lucid: {
    kind: "journal",
    pushTitle: "The crossings log",
    headline: "Each crossing\nlasts longer.",
    holdText: "hold to read the line at the bottom of the page",
    revealLine:
      "watching is free. crossing all the way in is not \u2014 it tears the membrane, and the other me feels it. restraints, a warehouse in coyoacán, a file of her routine. he's going to take her. find me the cost of stepping through. \u2014 M",
    jTitle: "THE LUCID DIVIDE \u2014 log",
    jTorn: "the membrane thins",
    jLines: [
      "\u201cThe caf\u00e9 again. Elena \u2014 not mine. Carlos, the pressed suits, the hand at her neck. Her ring.\u201d",
      "\u201cThe other me saw me in the mirror. \u2018You again. Stop watching me.\u2019\u201d",
      "\u201cRestraints. A warehouse outside Coyoac\u00e1n. A file of her routine. He is going to take her.\u201d",
    ],
    marginEq: "SAVE ONE ELENA, LOSE ONE MARCUS",
    marginHd:
      "\u2014 to cross fully destabilizes the membrane. the other you is sensing you back. someone does not walk out of that warehouse.",
  },
};

export function getEvidence(worldId: string): Evidence | undefined {
  return EVIDENCE[worldId];
}