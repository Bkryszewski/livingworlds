# Living Worlds

An AI-native, interactive-TV experience by **Legacy Studio Entertainment**. Audiences pick a world, step into a role, and play the story through a live conversation with its protagonist. Built as a Next.js App Router + TypeScript + Tailwind app, host-ready for Vercel and embeddable in a SamCart landing page.

Three playable worlds ship in this build, each adapted from its original short screenplay:

- **PERDIDO** — investigator Ruben Rivera and a dive that the sea has been giving back wrong since 1782.
- **MANIFEST** — journalist Veros Fernández and a $1.99 book that grants any wish, then quietly bills you for it.
- **STOPPAGE TIME** — FIFA agent Diana Voss, a rigged match ball, and seven months of surveillance all for nothing.

A fourth, **LA BUGA**, is shown as "coming soon."

---

## Two ways to play

Living Worlds has two modes, chosen by the **AI Engine** switch (top-right, ○ / ●), which is **OFF by default**.

### 1. Free mode (authored, no key, no cost) — the default
With the AI engine off, the story runs on **authored branching dialogue** adapted directly from each screenplay. The protagonist speaks pre-written lines, the player chooses from offered responses, evidence surfaces at the right beats, and the playthrough reaches the screenplay's real ending. This works for **every visitor with no setup**, and the studio pays nothing. The scripts live in `data/scripts.ts` — plain text you can edit freely.

### 2. AI mode (bring your own key — BYOK)
A player can flip the AI engine on and paste **their own API key** (Anthropic, OpenAI, Gemini, Azure, or a custom OpenAI-compatible endpoint). The same screenplay then drives an **open, improvised** version: the character responds in-voice to anything the player types.

**Important — who pays:** in AI mode the call goes **directly from the player's browser to their own provider, using their own key.** The key is stored only in that browser (localStorage) and is never sent to any server we run. **The studio is never billed for AI usage.** This is why AI mode is opt-in and the free authored mode is the default everyone lands in.

The panel includes a short **"How do I get a key?"** walkthrough, because an API key is a developer product separate from a ChatGPT/Claude subscription and most audiences won't already have one.

---

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. No environment variables are required — free mode and BYOK both work out of the box.

---

## Deploying to Vercel (no command line needed)

1. Create a free account at **vercel.com**.
2. Put this project in a **GitHub** repo (free GitHub account → new repository → upload the unzipped folder).
3. In Vercel, click **Add New → Project → Import** and pick that repo.
4. Click **Deploy**. About a minute later you get a live URL like `living-worlds.vercel.app`.

No API key or environment variable is needed to deploy, because the default free mode uses no AI and BYOK uses the player's own key.

> Optional "house key" path: an unused server route exists at `app/api/ai/route.ts` for studios who *want* to host their own key and pay for usage. It is **not** used by the default experience. If you ever enable it, set `ANTHROPIC_API_KEY` (or `OPENAI_API_KEY`) in Vercel's Environment Variables — never in the code.

---

## Embedding in SamCart

`samcart-embed.html` is a ready-to-paste snippet for a SamCart **Custom HTML** widget. Replace both instances of `https://YOUR-VERCEL-APP.vercel.app` with your deployed URL. The included `<script>` listens for height messages from the app so the iframe auto-resizes; if your SamCart plan strips scripts, the embed still works at a fixed height.

---

## Customizing

- **Edit the story (free mode):** `data/scripts.ts` — each world is a graph of nodes (`lines`, `choices`, `unlock`, `ending`).
- **Edit the canon (AI mode):** `data/worlds.ts` — `canon`, `hiddenCanon`, `voice`, roles, and archive. This is what constrains the AI to your story.
- **Posters / trailers:** replace the placeholder SVGs in `public/assets/` and the `poster` / `trailer` paths in `data/worlds.ts`.
- **Pass tiers / checkout:** `components/PassCTA.tsx`; point checkout at your SamCart URL via `NEXT_PUBLIC_CHECKOUT_URL` (see `.env.example`).
- **Copy / translation:** `lib/i18n.ts` (English + Spanish).
- **Look and feel:** `app/globals.css` (the ported cinematic design language, scoped `.lw-*`).

---

## Project structure

```
app/
  page.tsx            orchestrator: boot -> world -> role -> assistance -> play -> cut
  layout.tsx          metadata + viewport
  globals.css         cinematic design language (.lw-*)
  api/ai/route.ts     OPTIONAL server "house key" path (unused by default)
components/
  Hero, LanguageToggle, WorldSelector, WorldCard, RoleSelector,
  AssistanceSelector, CommsPanel, EvidenceArchive, WorldPlayer,
  YourCut, PassCTA, AIEngine
data/
  worlds.ts           the catalog + AI canon
  scripts.ts          authored free-mode playthroughs
lib/
  types.ts, i18n.ts, prompts.ts, aiClient.ts (BYOK router)
public/assets/        placeholder posters
samcart-embed.html    SamCart embed snippet
```

---

## Roadmap

- Per-role branching divergence in free mode (currently a shared spine with role-flavored openers).
- Voice input / push-to-talk and spoken playback in AI mode.
- Additional worlds (La Buga, The Effect, The Lucid Divide, Opt-Out).
- Save / resume and a richer "Your Cut" export.

---

(c) Legacy Studio Entertainment. Screenplays and characters by Brian Kryszewski de Ybarrondo.
