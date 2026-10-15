# Tool-Tin – a network of free, private tool websites

One central domain, and one website per topic on its own subdomain. Every tool runs **inside the
visitor's browser**: nothing is uploaded, and there is no server or database. Hosting is free and
costs don't grow with the number of visitors. Income comes from ads (one Google AdSense account
for all sites), tips and affiliate links.

**The one exception is Humm**, the song finder: recognising a hummed tune needs an AI, so Humm has a
small server part (a Cloudflare Worker) that sends the recording to Google's Gemini AI. Each search
costs a fraction of a cent – see [apps/humm](#humm-the-song-finder) below.

| Site | Address | What it offers | Market leader's monthly visits* |
| --- | --- | --- | --- |
| **Hub** | `example.com` | Lists all sites; privacy policy, legal notice, `ads.txt` | – |
| **KeepLocal** | `keeplocal.example.com` | 20 PDF & image tools incl. image to text (OCR), English + German | iLovePDF ~255M, imagetotext.info ~5.7M |
| **Spin the Wheel** | `wheel.example.com` | Name picker wheel, yes/no, number & letter wheels, team generator | Wheel of Names ~17–25M |
| **Typing Test** | `typing.example.com` | Typing test (30 s – 5 min), practice lessons, kids test, keyboard tester | Monkeytype ~15M |
| **Humm** | `humm.example.com` | Find a song by humming, singing or whistling it, with previews; uses Google's Gemini AI | Google's "hum to search" (in the Google app) |

\* Third-party estimates (Semrush/Similarweb). Why these sites: [docs/STRATEGY.md](docs/STRATEGY.md).

- **Going live (≈ 3 hours, once):** [docs/LAUNCH-CHECKLIST.md](docs/LAUNCH-CHECKLIST.md)
- **KeepLocal in detail:** [apps/keeplocal/README.md](apps/keeplocal/README.md)

## All settings are in one file

[`packages/shared/src/network.ts`](packages/shared/src/network.ts) holds your domain, your name
and address (for the legal pages), the AdSense ID, the tip link and the statistics switch. Every
money feature stays **off** until you fill in its value. Ad units are set per site: in
`apps/keeplocal/src/config.ts`, `apps/wheel/src/site.ts`, `apps/typing/src/site.ts` and `apps/humm/src/site.ts`.

## Run it on your computer

You need [Node.js](https://nodejs.org) 22.12 or newer. Run all commands in this folder.

```bash
npm install
npm run dev -w apps/wheel      # → http://localhost:4322, changes appear instantly
```

| Site | Start it | Address |
| --- | --- | --- |
| KeepLocal | `npm run dev -w apps/keeplocal` | http://localhost:4321 |
| Spin the Wheel | `npm run dev -w apps/wheel` | http://localhost:4322 |
| Typing Test | `npm run dev -w apps/typing` | http://localhost:4323 |
| Hub | `npm run dev -w apps/hub` | http://localhost:4324 |
| Humm | `npm run dev -w apps/humm` | http://localhost:4325 (the page only – see below for the AI part) |

| Command (for all sites) | What it does |
| --- | --- |
| `npm run build` | Builds every site into its `apps/<site>/dist/` folder |
| `npm run check` | TypeScript check of all code |
| `npm run test:unit` | Fast tests of the logic (Vitest) |
| `npm run test:e2e` | Browser tests that use every tool like a visitor (Playwright) |

Add `-w apps/<site>` to run a command for one site only. The browser tests need Chromium once:
`npx playwright install chromium`. GitHub runs all checks on every push (`.github/workflows/ci.yml`).

## How the project is organised

```
packages/shared/            ← code all sites share ("@tools/shared")
├── src/network.ts          ← THE settings file + the list of sites
├── src/components/         ← page layout, tool page template, icons, ad slot, tip box
├── src/icons/              ← the icon shapes (Lucide) used by every site
├── src/lib/                ← search-engine data, sitemap/robots/ads.txt, storage, fair random numbers
├── src/styles/base.css     ← the design of all sites: colours, the Archivo typeface, buttons, fields
└── scripts/og-image.mjs    ← creates a site's social-media preview image
apps/
├── hub/                    ← example.com
├── keeplocal/              ← keeplocal.example.com (its own README)
├── wheel/                  ← wheel.example.com
├── typing/                 ← typing.example.com
└── humm/                   ← humm.example.com (the only site with a server part: src/worker/)
docs/                       ← strategy and launch checklist
```

Each small site follows the same pattern:

- `src/site.ts`: everything search engines and visitors read (titles, descriptions, steps, FAQ).
  Change texts here, no code needed.
- `src/components/`: the tool itself (HTML plus a `<script>` that runs in the browser).
- `src/lib/`: the logic as plain functions, unit-tested in `tests/unit/`.
- `tests/e2e/`: browser tests. `site.spec.ts` checks every page for search-engine tags, phone
  layout and **requests to other servers** (there must be none).
- `wrangler.jsonc`: the Cloudflare settings for publishing this site.

## Humm, the song finder

Humm records a tune in the browser (and draws the melody on a staff while you hum, silence in red),
then sends it to its Worker at `/api/identify`. The Worker asks Google's Gemini AI and answers. When
the visitor taps "Play preview", the browser gets a 30-second preview from Apple's free iTunes Search
API; the Spotify and YouTube links open DuckDuckGo's first result for the song. "Search again" sends the songs
that were wrong plus the visitor's feedback, and from then on Gemini may also **search Google** for
the words it heard.

| File | What it does |
| --- | --- |
| `src/components/SongFinder.astro` | The tool: record key, melody staff, waiting circle, results, "That's it" |
| `src/lib/` | Pure logic, unit-tested: WAV file, note detection, smooth melody line with silences, time estimate, song matching and links, shared types |
| `src/scripts/itunes.ts` | Asks Apple for a preview from the visitor's browser (only when "Play preview" is tapped) |
| `src/worker/index.ts` | The Worker: `/api/identify` (+ rate limit); everything else comes from `dist/` |
| `src/worker/gemini.ts` | Asks Gemini: models in turn, time limits, web search from the second try |
| `src/worker/answer.ts` | The AI's instructions and safe reading of its answer |

- **Settings** (Cloudflare → Worker `humm` → Settings → Variables and Secrets): the secret
  `GEMINI_API_KEY` (required) and the optional variable `GEMINI_MODEL` (a model to try first).
  The models it tries are listed in `MODELS` in `src/worker/gemini.ts`.
- **Costs and limits:** Google's terms require the **paid** Gemini API for a public app used in
  Switzerland, the EU or the UK. A search costs well under one cent; web searches (from the second
  try) are free for the first 5,000 per month, then about $14 per 1,000. Each IP address can search
  6 times per minute (`ratelimits` in `wrangler.jsonc`). Set a spending limit at Google – see the
  launch checklist.
- **Try the AI part locally:** put `GEMINI_API_KEY=…` into `apps/humm/.dev.vars` (never committed),
  then `npm run build -w apps/humm && npx wrangler dev --config apps/humm/wrangler.jsonc`.
- **Logs:** Cloudflare → Worker `humm` → Observability → Logs shows which model answered and how
  long it took (never the recording).

## Add another site

1. Copy `apps/wheel` to `apps/<name>`. Change the name and port in `package.json`,
   `playwright.config.ts` and `wrangler.jsonc`, and the site ID in `astro.config.mjs`.
2. In `packages/shared/src/network.ts`, add the ID to `SiteId` and an entry to `sites`. Every
   footer and the hub then link to the new site automatically.
3. Write `src/site.ts` and the tool component. Run `npm install`, then the checks.
4. Publish it as its own Cloudflare Worker (see the launch checklist).

Or ask Claude, e.g. *"Add a new site for a unit converter, following the README"*.

## Technology

[Astro](https://astro.build) 7 (static sites, TypeScript) · Cloudflare Workers (static assets,
free plan) · [Vitest](https://vitest.dev) · [Playwright](https://playwright.dev).
KeepLocal's libraries are listed in its README. Humm also uses Google's
[Gemini API](https://ai.google.dev/gemini-api/docs) and Apple's
[iTunes Search API](https://performance-partners.apple.com/search-api) for previews.
