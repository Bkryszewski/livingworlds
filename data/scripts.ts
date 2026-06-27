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
};

export function getScript(worldId: string): WorldScript | undefined {
  return SCRIPTS[worldId];
}