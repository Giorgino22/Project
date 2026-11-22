# CLAUDE.md

A network of free tool websites in one npm-workspaces monorepo. Each site is a fully static
Astro 7 app deployed to its own subdomain of one central domain. Everything runs in the visitor's
browser; nothing is uploaded – except in Humm (see below), the one site with a server part. Owner is a coding apprentice: keep code simple and well commented,
explain complex parts, and value usability.

## Layout

- `packages/shared/` – `@tools/shared`: `src/network.ts` is the ONE settings file for all sites
  (domain, owner, AdSense ID, tip link, analytics, list of sites + `siteUrl()`); shared components/styles.
- `apps/keeplocal/` – PDF & image tools (English + German). Has its own CLAUDE-relevant rules below.
- `apps/<other>/` – further sites, each with its own tests and `wrangler.jsonc`. Wheel and typing are English + German
  (see "Languages" below), Humm is English only.
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

## Languages (wheel, typing, hub legal pages)

- Same approach as KeepLocal: English at the root, German under `/de/` with German slugs (no umlauts in URLs:
  `gluecksrad`, `tippen-ueben`). Texts in `src/i18n/{en,de}.ts` (`Dictionary = typeof en`), URLs only from
  `src/site.ts`, all pages from `src/pages/[...path].astro`. German addresses visitors with "Sie" (like KeepLocal);
  tool buttons/messages avoid pronouns (they also appear on the kids page).
- Shared: `packages/shared/src/i18n.ts` (`Lang`, frame texts, `legalPaths`), `SiteLayout`/`ToolPage` take `lang` +
  `alternates` (→ `<html lang>`, hreflang en/de/x-default, language menu, footer links), `sitemapResponse` takes
  `{ path, alternates }`. `network.ts` → `translations.de` gives each site's German name/start page (footers link there).
- Scripts get their texts as JSON in `data-i18n`. Each language stores its own entries/bests (`…:de` keys).
- Typing in German: big number = Anschläge pro Minute (`cpm`), words per minute below it. German word lists
  (`src/lib/words-de.ts`): nouns capitalised, no ß and no word starting with Ä/Ö/Ü (Swiss keyboards). Keyboard test:
  ISO QWERTZ (`qwertzMainBlock`, Enter two rows tall) with German or Swiss labels (`ch`), Swiss first for `de-CH` browsers.
- The hub's privacy policy/legal notice exist in English and German (`apps/hub/src/pages/de/`) – change both together.

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

- Tool texts may have optional `sections` (long-form text below "How it works"), `seeAlso` (link to a related tool,
  `{link}` = its name) and `privacy` (wording for tools without files). Rendered by `src/components/ToolPage.astro`.
- Swiss QR-bill (`swiss-qr-bill`): SIX Implementation Guidelines 2.3 – structured addresses (type S) ONLY (combined/K
  addresses are invalid since 21 Nov 2025). `src/lib/qr-bill.ts` checks input and builds the payload (QR-IBAN ⇔ QRR,
  mod-10 recursive / ISO 11649 check digits, SIX "Latin" character set; typographic dashes/quotes become plain ones);
  `src/lib/qr-bill-layout.ts` turns a bill into shapes (mm, style-guide positions) that `src/scripts/qr-bill-svg.ts`
  draws as the preview and `src/lib/qr-bill-pdf.ts` draws into a PDF (pdf-lib + `@cantoo/fontkit`, dynamic import on
  click). Font: "QR Bill Sans" = Liberation Sans subset (OFL, renamed) in `public/fonts/`, made by
  `scripts/make-qr-bill-fonts.py`, which also writes the width table `src/lib/qr-bill-font-widths.json` used for line
  breaks. (The `swissqrbill` npm package was evaluated: its PDF output needs PDFKit, its SVG doesn't convert with
  pdf-lib's `drawSvg`.)
- Password card (`password-card`): `src/lib/password-card.ts`; the card is generated in the browser only (never at
  build time). Printing: on `beforeprint` a copy of the card is put into `<body>` and the print CSS hides everything else.

## Humm specifics (apps/humm)

- `wrangler.jsonc` has `main: src/worker/index.ts`, `run_worker_first: ["/api/*"]` (pages are served without the
  Worker), a `ratelimits` binding `SEARCH_LIMIT` (6/min per IP) and `keep_vars`. Secret: `GEMINI_API_KEY`.
  Only route: `POST /api/identify`.
- `src/worker/gemini.ts`: models tried in order (`MODELS`, `GEMINI_MODEL` first), per-model and total time limits,
  `thinkingLevel: 'low'`, no `temperature` (Gemini 3 wants the default). First try: `responseSchema` JSON. With
  `check` (the page sends it right after a quick answer that heard ≥ 2 words but is < 70 % sure) and from the second
  try ("Search again"): the `google_search` tool and JSON described in the prompt (schema + search don't mix
  reliably); if that fails it answers without search. `check` songs are "not confirmed", never "wrong". Each request
  is ONE user message (history goes into the prompt) – never replay model turns (Gemini 3 thought signatures).
- Google requires showing `searchEntryPoint.renderedContent` next to answers that used Google Search: it is shown in
  a sandboxed `<iframe srcdoc>` (no scripts).
- Song IDs: after Gemini answers, the Worker looks every song up in Wikidata (`src/worker/songids.ts`: search title →
  items whose name = title and whose description/performer names the artist → Spotify P2207, YouTube P1651, Apple Music
  P10110) and adds `ids` to the guess. Wikidata is CC0, free, no key; Wikimedia wants a User-Agent.
- Links (`src/lib/songs.ts`): direct `open.spotify.com/track/ID` / `youtube.com/watch?v=ID` / `music.apple.com/song/ID`
  when known (phones open the apps), otherwise honest "Search on Spotify/YouTube" links. IDs are validated by regex.
- Previews are shown right in each result row, no tap needed (`showPreview` in SongFinder.astro): Apple's 30 s preview
  in Humm's own `.mini-player`, found in the BROWSER via JSONP (`src/scripts/itunes.ts`: `lookup` by Wikidata's Apple
  ID, else `search` "title artist" and only a result with the same title AND artist – no covers/karaoke; Apple refuses
  Cloudflare Workers; /search was down in April 2026, back by August). Else Spotify's embed (`?theme=0`, 80 px). No
  YouTube player (the owner doesn't want videos; the YouTube link stays). Embeds can't be paused from outside, so
  `stopPreviews()` reloads them. These loads only happen after the visitor searched: deliberate exceptions to "no
  third-party requests" (disclosed in the privacy policy). Don't name classes `.preview` – base.css uses it (QR tool).
- Melody check (the visitor's idea: "get the melodies of the songs"): the page downloads each Apple preview (needs CORS
  on Apple's CDN – untested live; if it fails there is just no check), decodes it at 16 kHz → 8 kHz, finds its melody
  (`src/lib/songmelody.ts`: FFT 1024/hop 256, overtone salience, Viterbi path, voicing) and compares it with the hummed
  tune (`src/lib/compare.ts`: 0.1 s steps, subsequence DTW over 24 half-semitone shifts, octaves folded). `fitLabel`
  claims a fit only with ≥ 6 s of tune (measured: shorter hums fit wrong songs by chance). The player's progress line
  becomes the song's melody with the tune drawn on top; the preview starts 0.5 s before the fit. Tests: made-up songs
  and hums (`tests/unit/music.ts`, `voice.ts`); `?debug` shows the numbers and offers the recording as a download.
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
