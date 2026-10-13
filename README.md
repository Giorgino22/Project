# Tool-Tin – a network of free, private tool websites

One central domain, and one website per topic on its own subdomain. Every tool runs **inside the
visitor's browser**: nothing is uploaded, and there is no server or database. Hosting is free and
costs don't grow with the number of visitors. Income comes from ads (one Google AdSense account
for all sites), tips and affiliate links.

| Site | Address | What it offers | Market leader's monthly visits* |
| --- | --- | --- | --- |
| **Hub** | `example.com` | Lists all sites; privacy policy, legal notice, `ads.txt` | – |
| **KeepLocal** | `keeplocal.example.com` | 20 PDF & image tools incl. image to text (OCR), English + German | iLovePDF ~255M, imagetotext.info ~5.7M |
| **Spin the Wheel** | `wheel.example.com` | Name picker wheel, yes/no, number & letter wheels, team generator | Wheel of Names ~17–25M |
| **Typing Test** | `typing.example.com` | Typing test (30 s – 5 min), practice lessons, kids test, keyboard tester | Monkeytype ~15M |

\* Third-party estimates (Semrush/Similarweb). Why these sites: [docs/STRATEGY.md](docs/STRATEGY.md).

- **Going live (≈ 3 hours, once):** [docs/LAUNCH-CHECKLIST.md](docs/LAUNCH-CHECKLIST.md)
- **KeepLocal in detail:** [apps/keeplocal/README.md](apps/keeplocal/README.md)

## All settings are in one file

[`packages/shared/src/network.ts`](packages/shared/src/network.ts) holds your domain, your name
and address (for the legal pages), the AdSense ID, the tip link and the statistics switch. Every
money feature stays **off** until you fill in its value. Ad units are set per site: in
`apps/keeplocal/src/config.ts`, `apps/wheel/src/site.ts` and `apps/typing/src/site.ts`.

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
└── typing/                 ← typing.example.com
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
KeepLocal's libraries are listed in its README.
