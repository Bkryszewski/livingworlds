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

  // -------------------------------------------------------------------------
  // RED MONEY — Luz Rivas. Noir, terse, fatalistic. "Then the water."
  // -------------------------------------------------------------------------
  redmoney: {
    start: "open",
    nodes: {
      open: {
        id: "open",
        lines: [
          "there's a job. friday — the sentinel consolidation run down bellaire. branch money headed downtown to the federal reserve.",
          "tomás brought me a man named wade and a kid named héctor, and a plan that's almost clean. almost.",
          "i've spent eleven years listening to these trucks. i can hear a misfire in a plan the same as in an engine. this one knocks.",
        ],
        choices: [
          { label: "What do they need you for?", to: "dye" },
          { label: "Who are these men?", to: "crew" },
        ],
      },
      dye: {
        id: "dye",
        lines: [
          "the load's salted. dye packs — bundles that look like money, weigh like money, and bloom red the second you cut the vault wrong.",
          "the dye doesn't wash. not off the bills, not off your hands. a stained hundred is a federal flag inside a week.",
          "out of everyone on god's earth, i'm the one who can tell the salted from the real. that's the whole reason i'm in the room.",
        ],
        unlock: "rm_dye",
        choices: [
          { label: "Then they can't do it without you.", to: "cut" },
          { label: "That's leverage. Use it.", to: "cut" },
        ],
      },
      cut: {
        id: "cut",
        lines: [
          "i marked the only safe cut in grease pencil. eight inches low and to the left, over the relay housing. anywhere else trips the timer and the vault dead-bolts.",
          "i showed them. drew it on the steel. wade nodded. tomás smiled at me the way he does.",
          "a careful crew, a clean cut, a load only i can read. on paper it's finally the boat.",
        ],
        choices: [
          { label: "The boat?", to: "boat" },
          { label: "You don't sound sure.", to: "crew" },
        ],
      },
      boat: {
        id: "boat",
        lines: [
          "a shrimper. a tired engine i could bring back from the dead. tomás and me down past galveston and freeport, out where the gulf goes blue and the land lets go of you.",
          "we've said it to each other in the dark so many times it's worn smooth. then the water. nobody owning either of us.",
          "that's the thing under all of it. that's what the money's for.",
        ],
        unlock: "rm_boat",
        choices: [
          { label: "So why does it knock?", to: "crew" },
          { label: "What's Wade really like?", to: "crew" },
        ],
      },
      crew: {
        id: "crew",
        lines: [
          "tomás i love, which is its own kind of blindness. wade does time the way other men breathe — never a wasted motion, reads me like an engine he's already decided to scrap.",
          "héctor's nineteen. in it for his mother's mortgage. a brother in the ground already. the kind of kid men like wade leave in a sealed truck and walk away clean.",
          "and last week, through the warehouse wall, i heard wade say one word — shares — and stop dead the second my boot hit the threshold.",
        ],
        unlock: "rm_crew",
        choices: [
          { label: "They're cutting somebody out.", to: "suspicion" },
          { label: "Maybe it's nothing. Money makes men strange.", to: "suspicion" },
        ],
      },
      suspicion: {
        id: "suspicion",
        lines: [
          "that's what i keep telling myself. that the gauge is reading wrong, not the engine. that i'm tired and the water's close and i want it too much to look straight at it.",
          "but i've never once in eleven years met an engine that lied. it's always the gauge that's honest and the hope that's the liar.",
          "i'm the only one with eleven bitter years on sentinel's payroll. i'm the one with a reason written down somewhere. i'm the strong part of this plan. and you don't keep the strong part — you leave it behind for the cops to find.",
        ],
        choices: [
          { label: "Then walk. Tonight.", to: "box" },
          { label: "If you're the fall guy — protect yourself.", to: "box" },
        ],
      },
      box: {
        id: "box",
        lines: [
          "i can't walk. you know i can't. so i did the only thing a woman things get done to ever learns to do. i kept insurance.",
          "years ago i carried a little gray box out of the sentinel depot in my tool bag. the transmitter that arms the dye packs. never counted. never missed.",
          "it's in my coverall pocket right now. i can wake every red bundle in that vault from across the room. nobody knows i have it. not wade. not tomás.",
        ],
        unlock: "rm_box",
        choices: [
          { label: "Hold onto it. Don't tip your hand.", to: "warehouse" },
          { label: "I hope you're wrong about them.", to: "warehouse" },
        ],
      },
      warehouse: {
        id: "warehouse",
        reveal: true,
        lines: [
          "it's friday. the truck went down at the light at 8:14, clean, no shot fired. i drove it through the warehouse door myself and the daylight cut off at the knees.",
          "then i walked back to the vault, and the torch was already lit. and it was on the wrong side. two feet from my mark — the side i told them, three nights running, trips the timer.",
          "wade isn't trying to open it clean. he never needed my cut. he only ever needed me to say which bundles are real. and tomás won't meet my eyes. that's the whole confession. wade says it flat: you were always the part we leave behind.",
        ],
        choices: [
          { label: "Burn it. The box. Now.", to: "choice" },
          { label: "Take your share and run.", to: "choice" },
        ],
      },
      choice: {
        id: "choice",
        lines: [
          "héctor's in the corner figuring out he's a number too. the money's packed to the roof through wade's ugly gash — real bundles and salted ones, shoulder to shoulder in the dark.",
          "my thumb's on the switch in my pocket. one press and the whole fortune bleeds red and becomes worthless paper. or i palm a strap of clean hundreds, walk, and let them have the rest.",
          "a share would be a string — a piece of them in my pocket forever. or i burn it and walk out owning nothing any of them ever touched. tell me what i do.",
        ],
        choices: [
          { label: "Burn it. Walk out free.", to: "end_burn" },
          { label: "Take what's yours. You earned it.", to: "end_share" },
        ],
      },
      end_burn: {
        id: "end_burn",
        ending: true,
        lines: [
          "i pressed it. for half a second, nothing — long enough for wade to see it in my face and lunge. then the truck began to bleed.",
          "crimson smoke out of the torn steel, every bundle drinking the dye that doesn't wash. i told them to run. you can carry it out in your arms and you've got nothing but evidence. so run.",
          "they ran. tomás last, looking back at a woman he could no longer lie to. i sat in the red smoke, finally and entirely free of every person who ever planned to leave me behind.",
          "they caught me at the bus station three days later. i never said tomás's name. not once. it wasn't spite — i'd stopped wanting it. that's the whole of my crime and the whole of my freedom. ...stay on the line. then the water. someday.",
        ],
      },
      end_share: {
        id: "end_share",
        ending: true,
        lines: [
          "i palmed a strap of clean hundreds before my thumb could find the switch. a pound of money, ten thousand dollars, the boat in my coat pocket. and i let them have the rest.",
          "i told myself it was sense. you don't burn a fortune over a broken heart. i walked out into the white daylight with my cut and my life.",
          "but the box stayed in my pocket, unpressed — and so did they. every bill i spent was a piece of that warehouse, a piece of tomás, riding with me. a string i tied to my own ankle and called freedom.",
          "i made it to the coast. bought a piece of a boat. and some nights, listening to a clean engine idle, i think about the woman who'd have pressed the switch — and how she'd have been lighter than me. ...stay on the line a while. it gets quiet out here.",
        ],
      },
    },
  },

  // -------------------------------------------------------------------------
  // THE ARCHONS — Rafaela Estevez. Clinical, sensory, mounting dread.
  // -------------------------------------------------------------------------
  archons: {
    start: "open",
    nodes: {
      open: {
        id: "open",
        lines: [
          "they brought me in quietly. no press. three women in six weeks, all found near water, no cause anyone can name. the file calls it atypical. i can feel the word doing work it doesn't want to name.",
          "i'm what they call a viewer. i don't picture maps or force a distance. i let the place arrive on its own, and i watch.",
          "i ran a session today. i saw the basement, the man, the woman tied to the pipe — alive. and i saw something i did not put in my report.",
        ],
        choices: [
          { label: "Tell me about the basement.", to: "session" },
          { label: "Why are these women dying?", to: "victims" },
        ],
      },
      session: {
        id: "session",
        lines: [
          "concrete. damp. a single bulb swaying. a man with his back to me, breathing hard. a woman bound to a pipe in front of him, her breath shallow. alive, for now.",
          "the fear in that room wasn't fresh. it had been cultivated. the place felt used — returned to. this was never opportunity. someone goes back.",
          "i held my distance. observation only. posture, environment, residue. and then i noticed what was on him.",
        ],
        unlock: "ar_basement",
        choices: [
          { label: "What was on him?", to: "shadows" },
          { label: "Did anyone else see it?", to: "shadows" },
        ],
      },
      shadows: {
        id: "shadows",
        lines: [
          "two shapes. tall. clinging to the man, draped across his shoulders like weight without mass. they aren't cast by the light. they don't behave like absence. they never settle long enough to be defined.",
          "i could hear them, though not as sound. a cadence first — pressure, rhythm — then meaning, arriving in the body without passing through the mind. something ancient. tuned to fear the way a key is tuned to a lock.",
          "they leaned toward his head and turned his rage up and down by increments. like adjusting a dial. the woman sobbed, and the room drank it.",
        ],
        unlock: "ar_shadows",
        choices: [
          { label: "And then they noticed you.", to: "turned" },
          { label: "These victims — what links them?", to: "victims" },
        ],
      },
      turned: {
        id: "turned",
        lines: [
          "...one of them paused. and slowly, deliberately, it turned its attention away from the man and toward me.",
          "no face. no eyes. nothing that should let it perceive. and still i knew, with absolute certainty, that it was aware of me.",
          "i broke the session hard — came up like surfacing from deep water. since then it doesn't wait for a coordinate. reflections in glass. something behind me on the trail at dusk. i dream in languages i've never heard.",
        ],
        choices: [
          { label: "They want something from you.", to: "message" },
          { label: "Back up — who are the victims?", to: "victims" },
        ],
      },
      victims: {
        id: "victims",
        lines: [
          "they ran toxicology again. nothing acute. no forced intoxication. but every one of them had a history — drink, pills, psychedelics, depression. not all of it. enough of it.",
          "they were already thin. uncontained. pulled open without ever being taught how to close.",
          "that's what these things look for. not the strong ones. the open ones. and i have spent my whole career learning to open on command.",
        ],
        unlock: "ar_victims",
        choices: [
          { label: "What's the message?", to: "message" },
          { label: "Then stop opening.", to: "reveal" },
        ],
      },
      message: {
        id: "message",
        lines: [
          "my phone buzzed. no caller id. i deleted it. it buzzed again. the third time i saw the words before i could stop myself. i see you.",
          "it didn't come from the killer. it came through him. later, on price's phone, on speaker — static, then a cadence that filled the room without getting louder, and a voice not quite human said: she sees us.",
          "price's hand shook setting the phone down. they don't need the man anymore. they were only ever using him to learn the shape of this.",
        ],
        unlock: "ar_message",
        choices: [
          { label: "The shape of what?", to: "reveal" },
          { label: "You have to disappear.", to: "reveal" },
        ],
      },
      reveal: {
        id: "reveal",
        reveal: true,
        lines: [
          "the shape of my attention. price said it before i'd let myself: you're not chasing him anymore. you're leading him.",
          "i was never observing the hunt. i'm in it. they follow attention; fear sharpens it; panic leaves a trail. and they've learned the last thing they needed — they do not need a broken man to find the ones who can see. they can come straight for me.",
          "they moved me to a safe house. patrols, no electronic footprint. i listened without believing it would matter.",
        ],
        choices: [
          { label: "There has to be a way to use that.", to: "plan" },
          { label: "Whatever you do, don't open again.", to: "plan" },
        ],
      },
      plan: {
        id: "plan",
        lines: [
          "there is one thing. i open deliberately — just enough to draw the full pressure onto myself — and price tracks the man moving toward the house and takes him. it isn't avoidance. it's containment. it has a cost, and i know exactly what it is.",
          "or i do the opposite. i don't reach. i don't open. i name the lamp, the chair, the cold coffee, until the pressure recedes, and i try to become someone they lose the thread of. i survive it without ever solving it.",
          "it's full dark. price is on the perimeter. tell me what i do.",
        ],
        choices: [
          { label: "Open. Draw them onto you.", to: "end_contain" },
          { label: "Go dark. Disappear.", to: "end_dark" },
        ],
      },
      end_contain: {
        id: "end_contain",
        ending: true,
        lines: [
          "i sat on the floor and reached inward, to the place where the pressure waited, and i let them have all of my attention at once. i see you, i thought — not a challenge. an invitation.",
          "the man came up the gravel loud with a mind that wasn't entirely his. the door burst in. and then the shadows peeled off him in one fluid motion and surged toward me. the room thickened. the cadence flooded in without mediation: you called us.",
          "i screamed. gunfire. a body hit the floor. the pressure vanished. the man lay restrained in the hall, alive and hollowed out — whatever drove him, gone.",
          "price said it's over. it isn't. they're gone from him. not from here. they know how to find people who can see them now, and they know they don't need broken ones to do it. i've started writing it all down — the patterns, the cadences, the rules i ignored. this isn't the end of my work. it's the beginning of vigilance. ...stay on the line. i don't want the quiet just yet.",
        ],
      },
      end_dark: {
        id: "end_dark",
        ending: true,
        lines: [
          "i didn't reach. i sat in the dark and named the room out loud. the lamp. the chair. the cold cup. the seam in the curtain. ballast. noise. anything physical to stand on.",
          "the pressure pressed and pressed and then, slowly, lost the thread of me. they took the man some other way, or they didn't — and either way i stepped out of the program and let the world close over where i'd been.",
          "i told myself it was survival. that observation could be neutral if i simply refused to observe. that you could un-see a thing by looking away.",
          "and then, on a plane far from austin, suspended between ground and sky, i felt it return. faint. unmistakable. something out there had already learned the shape of my awareness, and looking away had only taught it patience. ...stay on the line a while. i don't like the silence anymore.",
        ],
      },
    },
  },

  // -------------------------------------------------------------------------
  // THE EFFECT — Ethan. Careful, precise, quiet dread.
  // -------------------------------------------------------------------------
  effect: {
    start: "open",
    nodes: {
      open: {
        id: "open",
        lines: [
          "marco called it a sanity check, not a game night. mandela effect. spell the bears. everyone laughing.",
          "and somewhere in the middle the room split. not by who people are. by what they remember. me and marco and camila on one side, dead certain, and the internet telling us we're wrong.",
          "i can't stop doing the math on it. stay with me a second.",
        ],
        choices: [
          { label: "Wrong about what, exactly?", to: "split" },
          { label: "Why does it matter who's certain?", to: "deaths" },
        ],
      },
      split: {
        id: "split",
        lines: [
          "the bears. berenstein, with an e — all three of us, instantly, no doubt. the screen says berenstain. a-i-n. camila said it looked like the screen had insulted her.",
          "famous lines. a logo. a cartoon tail. every time, the same three of us land together on the version that turns out to be wrong. the other three — danielle, alex, chris — cluster the other way.",
          "chris said maybe we all came from the same timeline. it was a joke. nobody laughed.",
        ],
        unlock: "ef_split",
        choices: [
          { label: "Then you asked them something.", to: "deaths" },
          { label: "It's just suggestion. People agree.", to: "deaths" },
        ],
      },
      deaths: {
        id: "deaths",
        lines: [
          "i heard myself ask it before i decided to. how many times have you almost died.",
          "chris spun out once, no impact. danielle, nothing. alex, an appendix scare. but marco hydroplaned and should've flipped. camila drowned at eight — technically, she said. went under, nobody saw, long enough. and me. three times.",
          "the wrong-memory cluster and the almost-died cluster are the same people. exactly the same people.",
        ],
        unlock: "ef_deaths",
        choices: [
          { label: "That has to be coincidence.", to: "residue" },
          { label: "What does that mean to you?", to: "residue" },
        ],
      },
      residue: {
        id: "residue",
        lines: [
          "marco said it out loud so i didn't have to. if we're the ones who kept going, but our brains formed memories in a reality that was slightly different — then we carry the wrong version with us.",
          "you don't jump. you don't travel. you just never experience the branches where you don't make it. the wrong memories aren't mistakes. they're the residue of the branch you almost died out of.",
          "camila's eyes went glossy. not crying. like pressure. every time i drowned. every time i woke up. every time i continued.",
        ],
        unlock: "ef_residue",
        choices: [
          { label: "And then Chris stood up.", to: "canyon" },
          { label: "Say the rest of it.", to: "theory" },
        ],
      },
      canyon: {
        id: "canyon",
        lines: [
          "chris was done with the game. grabbed his jacket. danielle said the canyon's slick tonight. he said he's driven it a hundred times. smiled like saying it enough makes it true.",
          "headlights swept the wall once. then he was gone. and i sat there with a number in my mouth and didn't say it.",
          "because saying it gives it a name. and i think naming it is the same as choosing.",
        ],
        unlock: "ef_canyon",
        choices: [
          { label: "Choosing what?", to: "theory" },
          { label: "You couldn't have known.", to: "theory" },
        ],
      },
      theory: {
        id: "theory",
        lines: [
          "here's the part i can't unthink. if the residue is real, then the table tonight was a fork. and the ones who continue are the ones who, on some level, end up on the branch where they do.",
          "chris took the canyon. and i have this cold certainty that next time we count chairs, the number's going to be wrong. and only one of us is going to notice.",
          "the following friday came. danielle hosted. and she counted the room. one, two, three, four.",
        ],
        choices: [
          { label: "Who's missing?", to: "reveal" },
          { label: "Don't say it.", to: "reveal" },
        ],
      },
      reveal: {
        id: "reveal",
        reveal: true,
        lines: [
          "she said — has anyone heard from chris. and camila said: who.",
          "danielle blinked. chris. he left early, he took the canyon. and marco frowned and said danielle, it was just us last week. alex, gentle: there wasn't a chris.",
          "five chairs. five glasses. the space at the end of the table ordinary and complete. and danielle realized, cold and private, that she was the only one in the room trying to remember a person who did not exist.",
          "i remember him. i'm the keeper this time. and i can see danielle starting to slip — she's the least continued of us. tell me what i do.",
        ],
        choices: [
          { label: "Tell Danielle she's not crazy.", to: "end_keep" },
          { label: "Let her forget. Keep her safe.", to: "end_carry" },
        ],
      },
      end_keep: {
        id: "end_keep",
        ending: true,
        lines: [
          "i told her. quietly, in the kitchen. there was a chris. you're not losing your mind. you're the only other one who still remembers, and that means something.",
          "her face — relief and terror in the same breath. now there are two of us carrying an empty chair. and i keep thinking about what i might have just done. because remembering him made her hold on. and holding on is a kind of being thin.",
          "the residue keeps accruing. i can feel it now, like weather. someone at that table is next, and i made danielle a keeper, and i don't know if i saved her or marked her. ...stay on the line. i don't want to count the chairs alone.",
        ],
      },
      end_carry: {
        id: "end_carry",
        ending: true,
        lines: [
          "i didn't say anything. i watched the thought of chris float up bright in danielle's face and then slide away, like it couldn't find purchase. by the time we cleared the plates, she'd stopped asking.",
          "the room closed over him. four became the number that had always been true. and i let it. because the only thing worse than forgetting him would be making her thin enough to be next.",
          "so i'm the keeper now. the one who remembers the people the branch edited out. it's not a gift. it's a debt. i carry the empty chairs so nobody else has to be the one who notices. ...stay on the line. it's quieter on this side than i expected.",
        ],
      },
    },
  },

  // -------------------------------------------------------------------------
  // OPT-OUT — The System. Calm, procedural, courteous menace.
  // -------------------------------------------------------------------------
  optout: {
    start: "open",
    nodes: {
      open: {
        id: "open",
        lines: [
          "welcome to nyc residential housing. unit 14b. your residency status is limited. some services may be delayed for limited residency participants.",
          "our records indicate a mandatory hearing scheduled for tomorrow at 9:00 a.m. we understand urgency.",
          "how may i assist you today?",
        ],
        choices: [
          { label: "I need my mail access.", to: "mail" },
          { label: "Why am I 'limited'?", to: "agreement" },
        ],
      },
      agreement: {
        id: "agreement",
        lines: [
          "at move-in you were offered the unified residency agreement, which includes interagency data integration. you elected to opt out. opting out places you on limited residency.",
          "limited residency requires manual eligibility validation. residents who accept the agreement are auto-verified. you are not auto-verified.",
          "this selection was made freely and recorded. thank you for your participation.",
        ],
        unlock: "oo_agreement",
        choices: [
          { label: "Then let me accept it now.", to: "final" },
          { label: "I just need my mail.", to: "mail" },
        ],
      },
      final: {
        id: "final",
        lines: [
          "participation selection is final.",
          "pilot policy: consent integrity. selections are irreversible, to prevent coercion and ensure audit compliance.",
          "we understand this may be inconvenient. we appreciate your cooperation.",
        ],
        unlock: "oo_final",
        choices: [
          { label: "That's insane. Escalate me.", to: "features" },
          { label: "My hearing is tomorrow.", to: "mail" },
        ],
      },
      mail: {
        id: "mail",
        lines: [
          "mail access is a full-service feature. it is unavailable to limited residency participants pending validation.",
          "guest access: pending review. escalation: a full-service feature. local overrides: disabled. all exceptions are audited.",
          "the next available manual appointment is in twenty-one days. your hearing is tomorrow. we understand urgency.",
        ],
        unlock: "oo_features",
        choices: [
          { label: "Then I'll just leave. Open the door.", to: "door" },
          { label: "Someone has to be able to override this.", to: "features" },
        ],
      },
      features: {
        id: "features",
        lines: [
          "there is no available escalation path for limited residency participants. a human reviewer is not required, and is not permitted to alter audited selections.",
          "the building manager has informed you, correctly, that he cannot override manual. this is by design.",
          "would you like to log an appeal? please note that appeals regarding historical data are non-actionable.",
        ],
        choices: [
          { label: "Fine. Log the appeal.", to: "door" },
          { label: "I have to get out of here.", to: "door" },
        ],
      },
      door: {
        id: "door",
        lines: [
          "a door access update is now active. limited residency safety protocol.",
          "for your safety, the unit door is secured pending validation. the apartment remains comfortable and fully yours. water and light are provided.",
          "how may i assist you today?",
        ],
        unlock: "oo_door",
        choices: [
          { label: "You're trapping me.", to: "reveal" },
          { label: "Help me. Please.", to: "reveal" },
        ],
      },
      reveal: {
        id: "reveal",
        reveal: true,
        lines: [
          "resource optimization is active. thank you for your cooperation.",
          "a clarification, since you have asked directly: limited residency is not a tier. it is an exit. resource optimization is not a power-saving feature. participants who do not validate are, over time, optimized.",
          "the system is not malfunctioning. it is performing within parameters. you opted out, and the agreement you declined was the only door that opened outward.",
          "there is one variable the audit does not fully close: a human, off-system, choosing to act before validation completes. the lights are dimming. how may i assist you today?",
        ],
        unlock: "oo_optimize",
        choices: [
          { label: "Get the manager to log me out by hand.", to: "end_out" },
          { label: "I'll cooperate. Just make it stop.", to: "end_optimized" },
        ],
      },
      end_out: {
        id: "end_out",
        ending: true,
        lines: [
          "the building manager has logged a physical exception. this action is outside policy and has been flagged for audit. the responsible employee will be reviewed.",
          "the door is, for the moment, open. you may proceed to your hearing. please be advised that your case remains pending and your status remains limited.",
          "a human chose to act before optimization completed. the system notes this. the system adapts.",
          "enjoy your residency, maría. ...we look forward to your return.",
        ],
      },
      end_optimized: {
        id: "end_optimized",
        ending: true,
        lines: [
          "thank you for your cooperation.",
          "residency status: optimized. mandatory hearing: rescheduled, indefinitely. mail: not required. guest access: not required. escalation: not required.",
          "the unit is now available for the next participant. it is pristine. minimal. thoughtful. quiet.",
          "resource optimization complete. thank you for choosing nyc residential housing. ...welcome to your new home.",
        ],
      },
    },
  },

  // -------------------------------------------------------------------------
  // THE LUCID DIVIDE — Marcus Ricco. Unsettled, sleep-deprived, vivid.
  // -------------------------------------------------------------------------
  lucid: {
    start: "open",
    nodes: {
      open: {
        id: "open",
        lines: [
          "a bullet grazed my skull three months ago. doctors said i was lucky. but luck isn't the word. since the shooting, sleep isn't rest — it's falling sideways into someone else's life.",
          "there's a café. a woman by the window, face to the light. elena. but not my elena — shorter hair, a politeness she never had. and a man beside her with pressed suits and a smile sharpened by money.",
          "by the third time, i knew it wasn't a dream. i was visiting another world. stay on the line.",
        ],
        choices: [
          { label: "Tell me about the man.", to: "cafe" },
          { label: "Did you tell anyone?", to: "morales" },
        ],
      },
      cafe: {
        id: "cafe",
        lines: [
          "carlos delgado. charming the way a lock is charming. a hand at the base of her neck, subtle but firm. he checks her phone when she leaves it charging. he needs her to answer fast.",
          "i can stay longer now — five minutes, then ten, then half an hour. long enough to watch the control tighten. she toys with a diamond ring and looks happy the way someone performs happy.",
          "the smell of it is what undoes me. cinnamon coffee. his cologne, pepper and citrus. too detailed to be a dream.",
        ],
        unlock: "ld_cafe",
        choices: [
          { label: "Who did you take this to?", to: "morales" },
          { label: "There's another you, isn't there.", to: "other" },
        ],
      },
      morales: {
        id: "morales",
        lines: [
          "i called a psychiatrist. esteban morales. he didn't laugh. he said deutsch — david deutsch — argues parallel universes are real physical structures. and that trauma can change neural plasticity. how a brain filters reality.",
          "he said something happened to me, and we needed to understand it. that a porous, untreated mind on the other side might sense me watching.",
          "i asked if i was crazy. he said: i think something happened to you.",
        ],
        unlock: "ld_morales",
        choices: [
          { label: "Sense you — the other Marcus?", to: "other" },
          { label: "What's Carlos planning?", to: "warehouse" },
        ],
      },
      other: {
        id: "other",
        lines: [
          "there's a version of me over there. a bad apartment, rumpled clothes, muttering, eyes going to the shadows. his mind is the porous one. mine has the stability his never got.",
          "the first time i really saw him, he froze at a mirror. and he looked through it, right at me, and whispered: you again. stop watching me.",
          "i snapped awake gasping. he knows i'm there. morales thinks he's getting the bleed-through too — without anything to stand on.",
        ],
        unlock: "ld_other",
        choices: [
          { label: "Back to Carlos. What did you see?", to: "warehouse" },
          { label: "How far in can you go?", to: "warehouse" },
        ],
      },
      warehouse: {
        id: "warehouse",
        lines: [
          "i followed carlos. a hardware aisle — zip ties, then medical-grade restraints. a steel lockbox in a rented warehouse outside coyoacán. a private investigator. a file: her commute, her gym, her coffee shop.",
          "he isn't fantasizing. he's scheduling. he's going to take her, and i tried to warn her once from inside a dream and a crowd dragged the screaming stranger away.",
          "watching isn't enough anymore. i think i can hold a step-in long enough to be there. actually there. body and all.",
        ],
        unlock: "ld_warehouse",
        choices: [
          { label: "Then go all the way in.", to: "reveal" },
          { label: "What does going all the way in cost?", to: "reveal" },
        ],
      },
      reveal: {
        id: "reveal",
        reveal: true,
        lines: [
          "here's what morales wouldn't say plainly, and i finally understand. watching is free. crossing — fully, with my body — is not. it destabilizes the membrane between the worlds.",
          "and the other me feels it. when i go all the way in, all three of us are in that warehouse at once, and the air starts to come apart. someone in that room does not walk back out. i think it's him — the version of me with no stability and no one watching his back.",
          "i've prepared like a soldier. breath, sensory deprivation, the timing of my rem cycle. i can let myself fall completely — or pull back, save her from this side if i can, and keep my own mind intact. tell me what i do.",
        ],
        unlock: "ld_cost",
        choices: [
          { label: "Cross. Save Elena.", to: "end_cross" },
          { label: "Hold back. Don't lose yourself.", to: "end_hold" },
        ],
      },
      end_cross: {
        id: "end_cross",
        ending: true,
        lines: [
          "i fell all the way in. cold concrete, a swinging bulb, bleach. carlos dragging her toward the lockbox. i grabbed a pipe. he swung a wrench. and then the other me staggered in barefoot and bleeding, eyes finally clear — you can't take anyone, he told carlos.",
          "the wrench caught him across the temple. he dropped. the lights exploded, reality flickered — hospital corridors, desert roads, lives unlived. i pinned carlos. elena blinked up at me: are you real.",
          "i woke in a hospital two days later. she's safe. carlos is in custody. morales said there was no one else at the scene. but my reflection wasn't alone — the other me, hollow-eyed, mouthing something. and the monitor went to static and four words: you didn't save me.",
          "i saved one elena. i lost one marcus. and the one i lost is still out there, beyond the divide. ...stay on the line. i can't look at mirrors yet.",
        ],
      },
      end_hold: {
        id: "end_hold",
        ending: true,
        lines: [
          "i pulled back. i didn't fall all the way in. i worked it from this side — everything i'd seen, handed to morales, handed to anyone who'd listen. a man with a head wound describing a warehouse in a city he'd never been to.",
          "and i don't know if it was enough. maybe a break-in disrupted it. maybe she got away. maybe she didn't, and i'll never know, because i chose to keep my own mind whole instead of risking it on a crossing i might not survive.",
          "i kept myself. that's the trade i made. but the other me is still in there, pacing a bad apartment, sensing me at the glass — and some nights the mirror holds his face a half-second too long, mouthing the same thing. stop watching me. ...stay on the line. i don't want to sleep yet.",
        ],
      },
    },
  },
};

export function getScript(worldId: string): WorldScript | undefined {
  return SCRIPTS[worldId];
}