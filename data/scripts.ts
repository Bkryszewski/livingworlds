// data/scripts.ts — authored "free mode" playthroughs (no AI, no key, no cost).
//
// Each world is adapted from its original screenplay into a guided branching
// conversation: the protagonist speaks pre-written lines, the player chooses
// from offered responses, clues surface as evidence, and the gated reveal lands
// at the authored beat before the real ending. Branches converge on the spine
// of the short and diverge mainly at the final choice, which colors the close.
//
// These are the source screenplays distilled into the protagonist's side of a
// live text/call. Voice is kept faithful to the scripts. When the player turns
// the AI engine ON, this file is bypassed and the same canon drives an open,
// improvised version instead (see lib/aiClient.ts).

import type { WorldScript } from "@/lib/types";

export const SCRIPTS: Record<string, WorldScript> = {
  // -------------------------------------------------------------------------
  // MANIFEST — Veros Fernández. Eerie, literary. "Todo se paga."
  // -------------------------------------------------------------------------
  manifest: {
    start: "open",
    nodes: {
      open: {
        id: "open",
        lines: [
          "okay. you're going to think i'm losing it.",
          "i bought a book today. a buck ninety-nine, used. wrote a sarcastic note in the margin daring it to find me twenty dollars.",
          "this morning a birthday card showed up. three weeks late. tía rosa. twenty inside.",
        ],
        choices: [
          { label: "That's just a late card, Veros.", to: "test" },
          { label: "...okay, that's a little strange.", to: "test" },
          { label: "What's the book called?", to: "title" },
        ],
      },
      title: {
        id: "title",
        lines: [
          "MANIFEST. by helen hadsell. gold leaf worn soft, the title rubbed to a ghost.",
          "five-word formula on the first page. clarify. visualize. offer. experience. receive.",
        ],
        unlock: "mf_formula",
        choices: [
          { label: "So you tested it again.", to: "test" },
          { label: "Sounds like every self-help book ever.", to: "test" },
        ],
      },
      test: {
        id: "test",
        lines: [
          "that's the thing — i'm a journalist. so i built a real test. falsifiable. specific. something i couldn't make happen by trying.",
          "wrote: interview someone important. underlined important.",
          "augusto reyes called me back. thirty years, no interviews, turned down the times twice. he picked up the phone on a tuesday and couldn't tell me why.",
        ],
        choices: [
          { label: "Coincidence. People change their minds.", to: "cascade" },
          { label: "What did he say it felt like?", to: "reyes" },
        ],
      },
      reyes: {
        id: "reyes",
        lines: [
          "he said it felt like agreeing with something that had been waiting on him a long time.",
          "rearranged a kitchen he'd kept the same for forty years. tuesday. couldn't say why.",
        ],
        choices: [
          { label: "And then it didn't stop.", to: "cascade" },
          { label: "You're scaring yourself, V.", to: "cascade" },
        ],
      },
      cascade: {
        id: "cascade",
        lines: [
          "it didn't stop. parking spaces. a source who ghosted me for a month calling at midnight. the exact right word landing mid-sentence.",
          "nothing huge. just weirdly specific. like the world started leaning my way and was trying not to make it obvious.",
          "my father ran a print shop. he'd say todo se paga — everything gets paid for. so i stopped writing in the book and started pulling threads.",
        ],
        choices: [
          { label: "Threads on what?", to: "card" },
          { label: "The names on the card.", to: "card" },
        ],
      },
      card: {
        id: "card",
        lines: [
          "there's a library checkout card tucked in the back. five names. five different hands. sixty years.",
          "thompson '68. martinez '74. collins '83. alvarez '91. whitman '97. at the bottom, pressed hard enough to dent the paper — it works.",
          "i ran them through the archive. own a business. be a principal. marry david. open a bakery. every wish, granted, on schedule.",
        ],
        unlock: "mf_card",
        choices: [
          { label: "So the book works. That's... good?", to: "alvarez" },
          { label: "What happened to them after?", to: "alvarez" },
        ],
      },
      alvarez: {
        id: "alvarez",
        lines: [
          "maría alvarez. still alive, seventies, still runs the bakery she wished for. i went. showed her the card. she went very still.",
          "she said: the bakery wasn't the miracle, mija. the bakery was the invoice.",
          "she got every loaf she asked for — and the spring she opened the doors, she buried her sister. healthy one week, gone the next.",
        ],
        unlock: "mf_invoice",
        choices: [
          { label: "The invoice. Energy drawn from somewhere.", to: "equilibrium" },
          { label: "That could just be grief talking.", to: "equilibrium" },
        ],
      },
      equilibrium: {
        id: "equilibrium",
        lines: [
          "that's what i wanted it to be. but every margin in that book — four hands across thirty years — wrote the same three words. some pressed hard enough to tear the page.",
          "maintain equilibrium.",
          "thompson got his store the season his house burned. collins married david; he was dead in three years. it draws the cost out of a pocket you weren't watching.",
        ],
        choices: [
          { label: "There's something else, isn't there.", to: "letter" },
          { label: "Veros — what do you actually want?", to: "letter" },
        ],
      },
      letter: {
        id: "letter",
        reveal: true,
        lines: [
          "...there was a page sewn into the back endpaper. folded down to the size of a stamp. whitman, 1997. the last hand.",
          "he wrote: people think it pulls the world toward them. it doesn't. it changes you. you redirect your own energy every waking hour and call it magic so you don't have to call it yourself.",
          "and then the part sitting on my chest. he asked the book to bring someone back. she came back — remembered the house, the dog, the song they danced to. everything. except him.",
        ],
        choices: [
          { label: "Don't write the wish, Veros.", to: "choice" },
          { label: "What's the one thing you've never said out loud?", to: "choice" },
        ],
      },
      choice: {
        id: "choice",
        lines: [
          "there's a clean stretch of margin and a pen right here. the one want i've never said to anyone. not even my father.",
          "i started the down-stroke of a single letter. the lamp flickered. the wine trembled a ring across the table.",
          "tell me what i do.",
        ],
        choices: [
          { label: "Cap the pen. Learn to want quietly.", to: "end_good" },
          { label: "Some things are worth the cost.", to: "end_push" },
        ],
      },
      end_good: {
        id: "end_good",
        ending: true,
        lines: [
          "despacito. buena letra. i lifted the pen away and pushed it to the far edge of the table. the room let its breath go.",
          "i lit the candle by my mother's photo. one small, level change. a flame the size of a fingernail.",
          "later i went back for the book. no record of it. no hadsell in the system, ever. the card's still in my coat, over my heart — one blank line left.",
          "i wrote: become worthy. not a prize. a direction. the book was never the thing that worked. i was. ...thanks for staying on the line.",
        ],
      },
      end_push: {
        id: "end_push",
        ending: true,
        lines: [
          "you're not wrong that i want it. that's exactly what scares me.",
          "i held the pen over the page a long time. long enough to feel the building exhale.",
          "and then i thought about alvarez burying her sister, and a man who got everything he asked for except the one face he wanted to see.",
          "i capped the pen. i wanted it too much to spend someone else getting it. lit a candle instead — small, level. ...stay on a little longer, would you.",
        ],
      },
    },
  },

  // -------------------------------------------------------------------------
  // PERDIDO — Ruben Rivera. Terse, haunted, elegiac.
  // -------------------------------------------------------------------------
  perdido: {
    start: "open",
    nodes: {
      open: {
        id: "open",
        lines: [
          "a boat came in twenty miles east. empty.",
          "meal half-eaten. wetsuit dripping. dive ladder down. people don't leave a boat like that — they secure a boat like that.",
          "i know that water. i've known it since i was sixteen.",
        ],
        choices: [
          { label: "Whose boat?", to: "couple" },
          { label: "What's twenty miles east?", to: "couple" },
        ],
      },
      couple: {
        id: "couple",
        lines: [
          "the PERDIDO. owners edgar and patty maines. texas money, an underwater camera, a cave with no name and no permit.",
          "edgar kept a journal in a dry bag. wouldn't let anyone touch it. first page, one word — perdido — pressed so hard the nib tore the paper.",
        ],
        unlock: "pd_boat",
        choices: [
          { label: "How old is the journal?", to: "journal" },
          { label: "What happened on the dive?", to: "captain" },
        ],
      },
      journal: {
        id: "journal",
        lines: [
          "the pages are 1782. the binding isn't. it's been rebound — the way a thing is rebound when people carry it a long way through a long time because they need it to survive.",
          "colonial spanish. a passage off the cape no chart shows, that opens — impossibly — into air. black stone. symbols cut by no hand he could name. the sea remembers another world.",
          "a coastal trader named perdido was lost with all hands in 1782. no wreckage. same water.",
        ],
        unlock: "pd_journal",
        choices: [
          { label: "You said you've known that water since sixteen.", to: "mateo" },
          { label: "What did the captain see?", to: "captain" },
        ],
      },
      captain: {
        id: "captain",
        lines: [
          "the charter captain's a wreck of a man now. chain-smokes, two streets back from the water.",
          "federales came hunting smugglers while the maineses were down. forty minutes, agents watching the surface the whole time. no bubbles. no divers came up. the sea just kept them.",
          "a locked room. and the lock was the whole ocean.",
        ],
        choices: [
          { label: "There has to be a rational read.", to: "diver" },
          { label: "You've known that water since sixteen.", to: "mateo" },
        ],
      },
      mateo: {
        id: "mateo",
        lines: [
          "...the summer i was sixteen, my friend mateo went down on one breath, right there. he never came up.",
          "i wrote the report myself, years later. accidental. site inaccessible. body not recovered. i've not put my face in that water since.",
          "i didn't tell the divers that part.",
        ],
        choices: [
          { label: "Talk to someone who remembers.", to: "diver" },
          { label: "What does the footage show?", to: "footage" },
        ],
      },
      diver: {
        id: "diver",
        lines: [
          "there's an old diver. eighty if he's a day. he listened like he'd been waiting for the knock.",
          "he said: every so often the sea takes some, out by the caves. the tourists drown and we find the tourists. these it does not give back. or — it gives them back wrong.",
          "a woman gone two years walked up out of the cove. not a day older. talked about stars under the water — stars that weren't ours. everyone who comes to ask him, he said, lost someone.",
        ],
        choices: [
          { label: "Gives them back wrong. Meaning what?", to: "footage" },
          { label: "Play the footage, Ruben.", to: "footage" },
        ],
      },
      footage: {
        id: "footage",
        reveal: true,
        lines: [
          "i played patty's recovered footage. two divers down past the reef, blue to indigo to black. the cave mouth — the symbols, exactly as a dead man drew them in 1782.",
          "the tunnel opens, the water goes still. a chamber lit from inside, cold blue, shapes too regular to be stone. a ring cut in the rock, taller than a man, the water in it moving like heat over a road.",
          "edgar grins at the camera. reaches back his hand. static. when it clears, the timestamp's jumped three days and eleven hours in a single frame. camera on the floor. battery spent on the far side of three days that passed in an instant.",
          "they were never dead. that was the only mercy i'd let myself believe. it was false.",
        ],
        unlock: "pd_footage",
        choices: [
          { label: "You're going back down, aren't you.", to: "descent" },
          { label: "File it accidental and walk away.", to: "descent" },
        ],
      },
      descent: {
        id: "descent",
        lines: [
          "i went over the side for the first time in thirty-four years. the cold first. then the body remembering what the man forgot.",
          "the chamber was worse for being real. the ring was open — not a door, not a machine. a place where the rock's pulled thin and what's behind it shows through. a ship under too many stars. a city of light no one's built yet. a pale shore — and on it, alive, unhurried, edgar and patty. patty turned and laughed.",
          "and closer. near enough to touch. a boy. sixteen. water still on him. mati.",
        ],
        choices: [
          { label: "Reach for him.", to: "choice" },
          { label: "Look at his eyes first.", to: "choice" },
        ],
      },
      choice: {
        id: "choice",
        lines: [
          "he looked out through the ring. looked right at the gray-haired stranger behind the mask. and found nothing. to mati, no time has passed at all.",
          "see you on the bottom, ruben. the last thing he ever said to me. thirty-four years ago.",
          "the ring's already closing. the rock thickening. a diver's hand on my harness. tell me what i do.",
        ],
        choices: [
          { label: "Live, Ruben. Choose to live.", to: "end_live" },
          { label: "Don't lose him twice.", to: "end_reach" },
        ],
      },
      end_live: {
        id: "end_live",
        ending: true,
        lines: [
          "i let the hand pull me back. for one long second the old gravity held me — see you on the bottom — and i chose, with the whole weight of thirty-four years, to live.",
          "broke the surface into ordinary daylight. the cliff sealed behind me like no one was ever lost there.",
          "i signed it accidental. site inaccessible. bodies not recovered. the true thing didn't fit any language my office owns. i kept the journal.",
          "years later a boat came in on the tide. no one aboard. a hand-shaped hull older than wood should survive. the name barely readable under the salt. perdido. ...a man should keep the things that tell him the truth. especially the one he spent his life refusing.",
        ],
      },
      end_reach: {
        id: "end_reach",
        ending: true,
        lines: [
          "i reached anyway. my hand found the surface of the ring, then cold stone. mati narrowed to a line. then to nothing.",
          "the chamber came down in a slow grinding dark and a diver hauled me out by the harness. i'd have stayed. that's the part i don't put in reports.",
          "i survived it. i didn't solve it. i'm starting to understand those are different things — and that surviving might be the only thing on offer. and might be enough.",
          "somewhere a boy stands on a pale shore under the wrong stars. sixteen forever. waiting on the bottom for a friend who was supposed to be right behind him. he's waiting still. ...stay on the line. i don't want the quiet yet.",
        ],
      },
    },
  },

  // -------------------------------------------------------------------------
  // STOPPAGE TIME — Diana Voss. Deadpan caper, dry as bone.
  // -------------------------------------------------------------------------
  stoppage: {
    start: "open",
    nodes: {
      open: {
        id: "open",
        lines: [
          "subject is vending. aggressively.",
          "micky santos. yellow vest three sizes too loud, teflon grin, works the crowd like it owes him money. i've been photographing him since march.",
          "and he just reached under the cart, pulled out a pristine match ball with a thin red stripe, and tossed it to a ball boy at the tunnel. tell me i didn't just watch that.",
        ],
        choices: [
          { label: "That's not a crime, Voss.", to: "confront" },
          { label: "A match ball? Go.", to: "confront" },
        ],
      },
      confront: {
        id: "confront",
        lines: [
          "everything he does is a crime. i just haven't proven it yet.",
          "i got to him at the tunnel. he says he sells meat pies. i say you just handed a ball to a ten-year-old who put it into play. we both look down — the ref's already waving the new ball in.",
          "his own ball's gone from the cart. a guard's wheeling it to lost-and-found at gate 7.",
        ],
        choices: [
          { label: "Who gave him the ball?", to: "micky" },
          { label: "Get the ball before it's logged.", to: "chase" },
        ],
      },
      micky: {
        id: "micky",
        lines: [
          "a man. suit, no lanyard. paid him four hundred dollars to deliver it to the tunnel before the fifty-fifth minute.",
          "four hundred. for the world cup semifinal. plus two meat pies.",
          "he thought it was drugs. in a soccer ball. says he's seen stranger.",
        ],
        unlock: "st_micky",
        choices: [
          { label: "What's actually in the ball?", to: "ball" },
          { label: "Get it before an official logs it.", to: "chase" },
        ],
      },
      chase: {
        id: "chase",
        lines: [
          "if that official radios it in, my whole operation goes dark — every name disappears.",
          "i told micky to cause a scene. he said he could do that for free. claimed the ball belonged to his crying eight-year-old named pablo, signed and everything. guard flips it. blank. micky goes — different ball.",
          "i lifted the real one out of the bin three feet away and walked. didn't run. ...pablo. i'll deal with him later.",
        ],
        choices: [
          { label: "What's inside it?", to: "ball" },
          { label: "Disarm it.", to: "ball" },
        ],
      },
      ball: {
        id: "ball",
        lines: [
          "thin red stripe at the equator. dug a thumbnail in, found a seam. pressed it — a faint click, a little LED pulses red once, then goes dormant. armed.",
          "held in the ref's palm more than three seconds, it fires a confirmation signal. penalty decision. and about half a billion dollars moves through three accounts before the whistle blows.",
          "the ball isn't the money. it's the proof he'll comply — for the people watching the accounts.",
        ],
        unlock: "st_ball",
        choices: [
          { label: "So you stopped it. Nice work.", to: "anyway" },
          { label: "Map the money.", to: "money" },
        ],
      },
      money: {
        id: "money",
        lines: [
          "three accounts. the half-billion's already staged. the signal just tells them it's safe to move.",
          "i've got the ball. no signal fires. so we're clean. right.",
          "...then explain why there's a roar upstairs.",
        ],
        unlock: "st_money",
        choices: [
          { label: "What's happening on the pitch?", to: "anyway" },
          { label: "Check the monitor.", to: "anyway" },
        ],
      },
      anyway: {
        id: "anyway",
        lines: [
          "ref number four just stopped play. he's pointing to the spot. calling the penalty. without the ball.",
          "he doesn't need the ball. he already has his money. the ball was only ever the confirmation. and he's calling it anyway.",
          "something's wrong. i built seven months around a signal this man doesn't need.",
        ],
        choices: [
          { label: "Seven? You said six.", to: "twist" },
          { label: "Why wouldn't he need the signal?", to: "twist" },
        ],
      },
      twist: {
        id: "twist",
        reveal: true,
        lines: [
          "seven. i miscounted earlier. i've been awake a long time.",
          "...there was a ref who needed a signal. we built the whole operation around him. referee number eleven.",
          "the assignment changed four days ago. number four instead. i got the notification. and i was so close to the close that i — i buried it. i buried it.",
          "number four is corrupt the old-fashioned way. cash in an envelope. no signals, no balls. number eleven is watching this from a hotel bar somewhere, completely clean. the network, the ball, the seven months — aimed at a referee who was never coming.",
        ],
        choices: [
          { label: "So nobody needed you at all.", to: "deflate" },
          { label: "Am I still getting arrested?", to: "mickyout" },
        ],
      },
      mickyout: {
        id: "mickyout",
        lines: [
          "i don't actually have anything on you. you delivered a soccer ball.",
          "for a suspicious man. ...welcome to fifa.",
          "on the monitor: penalty kick. the player steps up. scores. the crowd half-cheers, half-riots over a call that was never about a ball.",
        ],
        choices: [
          { label: "Nobody needed you at all.", to: "deflate" },
          { label: "Were the meat pies actually good?", to: "end_pie" },
        ],
      },
      deflate: {
        id: "deflate",
        lines: [
          "seven months. for a ball no one needed, a ref who was never coming, and a vendor selling meat pies.",
          "i'm going to write a very long report.",
          "micky says he'll be here. he's got one pie left. five dollars.",
        ],
        choices: [
          { label: "Buy the pie. Sit down.", to: "end_pie" },
          { label: "Walk up the stairwell.", to: "end_report" },
        ],
      },
      end_pie: {
        id: "end_pie",
        ending: true,
        lines: [
          "i asked if they were actually good. he said award-level. genuinely.",
          "i said i just saved a half-billion-dollar operation. he said — from nothing, yeah — four-fifty. best price he's got.",
          "i fished out five dollars and sat back down on the step. so we sat in a concrete stairwell eating meat pies while sixty thousand people argued about a penalty that was never about a ball.",
          "the red-striped ball sat between us. its LED pulsed once, faint, and went dark. ...they were good meat pies. thanks for staying on the line.",
        ],
      },
      end_report: {
        id: "end_report",
        ending: true,
        lines: [
          "i went up the stairwell to write it all down. every account, every name — and the four-day-old notification with my fingerprints on the part where i buried it.",
          "seven months of the cleanest operation anybody upstairs ever signed off on, and the only crime i can prove is the one i committed against my own case file.",
          "i stopped on the stairs. looked back. asked micky if the pies were actually good.",
          "he held up the last one. five dollars. ...i'm coming back down for that. just — give me a second. stay on the line.",
        ],
      },
    },
  },
};

export function getScript(worldId: string): WorldScript | undefined {
  return SCRIPTS[worldId];
}
