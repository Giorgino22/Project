# CLAUDE.md

A network of free tool websites in one npm-workspaces monorepo. Each site is a fully static
Astro 7 app deployed to its own subdomain of one central domain. Everything runs in the visitor's
browser; nothing is uploaded – except in Humm (see below), the one site with a server part. Owner is a coding apprentice: keep code simple and well commented,
explain complex parts, and value usability.

## Layout

- `packages/shared/` – `@tools/shared`: `src/network.ts` is the ONE settings file for all sites
  (domain, owner, AdSense ID, tip link, analytics, list of sites + `siteUrl()`); shared components/styles.
- `apps/keeplocal/` – PDF & image tools (English + German). Has its own CLAUDE-relevant rules below.
- `apps/<other>/` – further sites (English only for now), each with its own tests and `wrangler.jsonc`.
- `apps/humm/` – song finder: static Astro page + a Cloudflare Worker (`src/worker/`) that asks Google's Gemini.

## Commands (run from the repo root)

- `npm run check` / `npm run test:unit` / `npm run test:e2e` – run for every workspace
- One site: `npm run dev -w apps/keeplocal`, `npm run test:e2e -w apps/wheel`, …
- Run check + unit + e2e before pushing. CI (`.github/workflows/ci.yml`) runs the same.
- Playwright `webServer` uses `astro preview --ignore-lock` (otherwise Astro backgrounds itself in
  agent environments). Each app uses its own port (keeplocal 4321, wheel 4322, typing 4323, hub 4324, humm 4325).

## Rules for all sites

- Tools must never send user data anywhere. Each app has an e2e test that blocks third-party requests.
  Only exception: Humm sends the visitor's recording + notes to its own Worker, which forwards them to Gemini.
  The page itself still makes no third-party requests on load; it says on the page, in its footer
  (`dataNote` in network.ts) and in the hub's privacy policy (#song-finder) where the recording goes.
- Insert user/file-derived strings with `textContent`, never `innerHTML`.
- Load heavy libraries with dynamic `import()` inside handlers.
- Meta descriptions ≤ 170 characters; one `<h1>` per page; canonical + sitemap per site.

## Design system (all sites)

- One stylesheet for all sites: `packages/shared/src/styles/base.css` (tokens at the top). Site CSS files only
  add layout for their own tools. Concept: "a tin of tools" – flat surfaces, ink type, one signal colour.
- Colours: paper `#fbfbf9`, desk `#efefeb` (tool surface, `.card`), ink `#1d1e20`, pencil `#5e6166`,
  edge `#85888c` (input borders, 3:1), marker `#ffd400` (ONLY main actions, current state, highlights).
- Type: Archivo variable, self-hosted via `@fontsource-variable/archivo` (never Google Fonts). Expanded
  (`font-stretch` ~115%) for big headlines (`.display`), normal for text, condensed (75%) for numbers.
- Icons: Lucide shapes in `packages/shared/src/icons/icons.ts`, rendered with `<Icon name="…" />`.
- Never: emojis, tinted cards with shadows, pill chips, all-caps labels, "A · B · C" chains, "→" on links,
  one-word accents in headlines. Numbers only for real sequences (how-to steps).
- Motion: at most one orchestrated animation per page, plays once; the element's normal CSS is the END
  state, so `prefers-reduced-motion` (disabled globally in base.css) shows the finished picture.
- Social images: `npm run images -w apps/<site>` (packages/shared/scripts/og-image.mjs).

## KeepLocal specifics (apps/keeplocal)

- `src/tools/registry.ts` lists tools; texts live in `src/i18n/{en,de}.ts` (`Dictionary = typeof en`).
- `src/site/pages.ts` is the single source of URLs. `src/pages/[...path].astro` renders all pages.
- pdf.js: use the **legacy** build (`pdfjs-dist/legacy/build/pdf.mjs`); assets copied to `public/pdfjs/<version>/`.
- PDF editing uses `@cantoo/pdf-lib`; results are always new, unencrypted documents built with `copyPages`.
- OCR ("Image to text") uses tesseract.js. `scripts/copy-ocr-assets.mjs` copies its worker, WASM core and
  language data (eng, deu) to `public/ocr/<version>/`. Always pass `workerPath`, `corePath` and `langPath` –
  the library's defaults load from CDNs, which would break the no-third-party-requests rule.

## Humm specifics (apps/humm)

- `wrangler.jsonc` has `main: src/worker/index.ts`, `run_worker_first: ["/api/*"]` (pages are served without the
  Worker), a `ratelimits` binding `SEARCH_LIMIT` (6/min per IP) and `keep_vars`. Secret: `GEMINI_API_KEY`.
  Only route: `POST /api/identify`.
- `src/worker/gemini.ts`: models tried in order (`MODELS`, `GEMINI_MODEL` first), per-model and total time limits,
  `thinkingLevel: 'low'`, no `temperature` (Gemini 3 wants the default). First try: `responseSchema` JSON. From the
  second try ("Search again"): the `google_search` tool and JSON described in the prompt (schema + search don't mix
  reliably); if that fails it answers without search. Each request is ONE user message (history goes into the
  prompt) – never replay model turns (Gemini 3 thought signatures).
- Google requires showing `searchEntryPoint.renderedContent` next to answers that used Google Search: it is shown in
  a sandboxed `<iframe srcdoc>` (no scripts).
- Song IDs: after Gemini answers, the Worker looks every song up in Wikidata (`src/worker/songids.ts`: search title →
  items whose name = title and whose description/performer names the artist → Spotify P2207, YouTube P1651, Apple Music
  P10110) and adds `ids` to the guess. Wikidata is CC0, free, no key; Wikimedia wants a User-Agent.
- Links (`src/lib/songs.ts`): direct `open.spotify.com/track/ID` / `youtube.com/watch?v=ID` / `music.apple.com/song/ID`
  when known (phones open the apps), otherwise honest "Search on Spotify/YouTube" links. IDs are validated by regex.
- Previews are shown right in each result row, no tap needed (`showPreview` in SongFinder.astro): Spotify's embed player
  (`?theme=0` = dark, 80 px compact; 30 s preview, full song when logged in) when the Spotify ID is known; else Apple's
  preview by ID via JSONP `itunes.apple.com/lookup` in the BROWSER (`src/scripts/itunes.ts`; Apple refuses Cloudflare
  Workers and its /search answered 404 in 2026), played by Humm's own `.mini-player`; else YouTube's player
  (youtube-nocookie.com). Embeds can't be paused from outside, so `stopPreviews()` reloads them (new search, new
  recording, "That's it"). These loads only happen after the visitor searched: deliberate exceptions to "no third-party
  requests" (disclosed in the privacy policy). Don't name classes `.preview` – base.css uses it for the QR tool.
- Not used: Spotify Web API (2026 dev mode: Premium owner, no business use; preview_url gone since 2024), song.link
  (public API closed), Deezer (non-commercial), DuckDuckGo "\" (showed result pages, not the song).
- The melody line: `detectPitch` (src/lib/pitch.ts) ~30×/s with only a tiny absolute floor (`QUIET`; phone mics are
  quiet, soft humming ≈ 0.005 RMS – a fixed 0.01 limit once turned soft singing red). `melodyLine` (src/lib/melody.ts):
  "sound" = louder than a tenth of the visitor's own singing (`soundLevel`); phrases of sound (pauses ≤ 0.3 s bridged)
  keep the line going through unclear bits; median; moving average; drawn as quadratic curves. Real pauses
  (`silences()`) are red dashes (`--stop`) with a legend. `tests/unit/voice.ts` makes a realistic "na na na" voice
  (formants, vibrato, phone mic, noise) for regression tests.
- Browser tests use Chromium's fake microphone fed with a generated tune (`tests/e2e/melody.ts`) and answer
  `/api/identify` themselves; unit tests replace `fetch` (`tests/unit/worker.test.ts`).
