# CLAUDE.md

A network of free tool websites in one npm-workspaces monorepo. Each site is a fully static
Astro 7 app deployed to its own subdomain of one central domain. Everything runs in the visitor's
browser; nothing is uploaded. Owner is a coding apprentice: keep code simple and well commented,
explain complex parts, and value usability.

## Layout

- `packages/shared/` – `@tools/shared`: `src/network.ts` is the ONE settings file for all sites
  (domain, owner, AdSense ID, tip link, analytics, list of sites + `siteUrl()`); shared components/styles.
- `apps/keeplocal/` – PDF & image tools (English + German). Has its own CLAUDE-relevant rules below.
- `apps/<other>/` – further sites (English only for now), each with its own tests and `wrangler.jsonc`.

## Commands (run from the repo root)

- `npm run check` / `npm run test:unit` / `npm run test:e2e` – run for every workspace
- One site: `npm run dev -w apps/keeplocal`, `npm run test:e2e -w apps/wheel`, …
- Run check + unit + e2e before pushing. CI (`.github/workflows/ci.yml`) runs the same.
- Playwright `webServer` uses `astro preview --ignore-lock` (otherwise Astro backgrounds itself in
  agent environments). Each app uses its own port (keeplocal 4321, wheel 4322, typing 4323, hub 4324).

## Rules for all sites

- Tools must never send user data anywhere. Each app has an e2e test that blocks third-party requests.
- Insert user/file-derived strings with `textContent`, never `innerHTML`.
- Load heavy libraries with dynamic `import()` inside handlers.
- Meta descriptions ≤ 170 characters; one `<h1>` per page; canonical + sitemap per site.

## KeepLocal specifics (apps/keeplocal)

- `src/tools/registry.ts` lists tools; texts live in `src/i18n/{en,de}.ts` (`Dictionary = typeof en`).
- `src/site/pages.ts` is the single source of URLs. `src/pages/[...path].astro` renders all pages.
- pdf.js: use the **legacy** build (`pdfjs-dist/legacy/build/pdf.mjs`); assets copied to `public/pdfjs/<version>/`.
- PDF editing uses `@cantoo/pdf-lib`; results are always new, unencrypted documents built with `copyPages`.
