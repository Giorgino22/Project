# CLAUDE.md

Privacy-first tools website (PDF, image, generators) built with Astro 7 as a fully static site.
Every tool runs in the visitor's browser; nothing is ever uploaded. Owner is a coding apprentice:
keep code simple and well commented, and explain complex parts.

## Commands

- `npm run dev` – dev server (copies pdf.js assets first via `predev`)
- `npm run check` – `astro check` (TypeScript for .ts and .astro); must report 0 errors/warnings/hints
- `npm run test:unit` – Vitest, `tests/unit/**`
- `npm run test:e2e` – Playwright against the built site (`webServer` runs build + `astro preview --ignore-lock`)
- Run all three before pushing. CI (`.github/workflows/ci.yml`) runs the same.

## Architecture

- `src/config.ts` – the only user-facing settings file (site name/URL, owner, ads, tips, affiliates,
  analytics). Money features are off while their value is empty; `features` derives booleans.
- `src/tools/registry.ts` – list of tools. Converter pages (`convert: {from, to}`) reuse `ConvertImage`.
- `src/i18n/{en,de}.ts` – all texts. `Dictionary = typeof en`; other languages must match it.
  Converter page texts come from the `converter()` function in each dictionary.
- `src/site/pages.ts` – single source of URLs (`getAllPages`, `toolPath`, `alternatesOf`).
- `src/pages/[...path].astro` – renders every page; `sitemap.xml.ts`, `robots.txt.ts`, `ads.txt.ts` endpoints.
- `src/components/tools/*.astro` – tool UI + `<script>`; texts reach scripts via `data-i18n` (ToolShell).
- `src/lib/` – pure, unit-tested logic (no DOM). `src/scripts/` – browser-only helpers.

## Rules

- Tools must never make network requests with user data. `tests/e2e/site.spec.ts` enforces it.
- Insert user/file-derived strings with `textContent`, never `innerHTML`.
- No hard-coded UI text in components; add keys to every language file.
- Load heavy libraries with dynamic `import()` inside handlers (pdf-lib ≈ 550 KB, pdf.js ≈ 430 KB).
- pdf.js: use the **legacy** build (`pdfjs-dist/legacy/build/pdf.mjs`); the modern build needs
  `Map.getOrInsertComputed`, which many browsers lack. Assets are copied to `public/pdfjs/<version>/`.
- PDF editing uses `@cantoo/pdf-lib` (opens encrypted PDFs via `password`); results are always new,
  unencrypted documents built with `copyPages`.
- Keep `<meta name="description">` texts ≤ 170 characters (unit test checks tool pages).
