# Adding tools and languages

More tools and more languages mean more pages that can be found on Google – this is how the
site grows. Both are designed to be small, repeatable jobs.

> **Shortcut:** you can ask Claude to do it, e.g.
> *"Add a 'Word counter' tool with English and German texts and a browser test, following
> docs/ADDING-TOOLS.md"* or *"Add French as a language"*.

## How a page is put together

```
src/tools/registry.ts          which tools exist (id, category, component, icon)
        │
        ├── src/i18n/en.ts, de.ts   the texts of each tool page (title, intro, steps, FAQ, UI labels)
        │
        ├── src/components/tools/X.astro   the tool itself: HTML + <script> that runs in the browser
        │         └── uses src/lib/*.ts    pure logic (unit-tested), e.g. mergePdfs()
        │
        └── src/pages/[...path].astro      creates one page per tool and language,
                                          using the template src/components/ToolPage.astro
```

The sitemap, the language menu, the footer links and the "More free tools" boxes all read
the registry, so a new tool appears everywhere by itself.

## Add a new tool (example: "Word counter")

**1. Register it** in `src/tools/registry.ts`:

```ts
{ id: 'word-counter', category: 'generator', component: 'WordCounter', icon: 'file-text' },
```

Also add `'WordCounter'` to the `ComponentName` type at the top of the same file.
Icons come from `src/icons/icons.ts`. To add one, copy the inner SVG elements of any
[Lucide icon](https://lucide.dev/icons/) into that file.

**2. Write the texts** in `src/i18n/en.ts`, in the `tools` section (same shape as the others):

```ts
'word-counter': {
  slug: 'word-counter',            // → /word-counter/
  name: 'Word counter',
  short: 'Count words and characters.',
  title: 'Word Counter – Count Words & Characters Online',
  description: 'Count words, characters and sentences instantly. Free, private – your text never leaves your browser.',
  h1: 'Word counter',
  lead: '…',
  steps: ['…', '…', '…'],
  faq: [{ q: '…', a: '…' }, /* 3–4 questions */],
},
```

…and the labels the tool shows go in `components` (e.g. `WordCounter: { words: 'Words', … }`).
Then do the same in `de.ts` with a German slug (e.g. `woerter-zaehlen`). **TypeScript reports
an error until every language has every text**, so `npm run check` tells you what's missing.

**3. Build the component** `src/components/tools/WordCounter.astro`. Copy a similar tool
(`PasswordGenerator.astro` for text tools, `CompressImage.astro` for file tools) and change it.
The pattern is always the same:

```astro
---
import { t, type Lang } from '../../i18n';
import type { ToolDefinition } from '../../tools/registry';
import ToolShell from './ToolShell.astro';

interface Props { lang: Lang; tool: ToolDefinition }
const { lang } = Astro.props;
const text = t(lang).components.WordCounter;
---

<ToolShell lang={lang} component="WordCounter">
  <textarea data-input aria-label={text.inputLabel}></textarea>
  <p data-output></p>
</ToolShell>

<script>
  import { $, readTexts, toolRoots } from '../../scripts/ui';
  import { countWords } from '../../lib/text';   // pure logic lives in src/lib (with a unit test!)

  for (const root of toolRoots('WordCounter')) {
    const t = readTexts<{ words: string }>(root);  // the translated texts from ToolShell
    const input = $<HTMLTextAreaElement>(root, '[data-input]');
    input.addEventListener('input', () => {
      $(root, '[data-output]').textContent = `${countWords(input.value)} ${t.words}`;
    });
  }
</script>
```

Register the component in `src/components/tools/index.ts`.

**4. Test it.**
- Logic in `src/lib/…` → a unit test in `tests/unit/` (`npm run test:unit`).
- The tool in the browser → a test in `tests/e2e/` (`npm run test:e2e`).
  The test `tools never send files anywhere` in `tests/e2e/site.spec.ts` shows how to prove that a
  tool contacts no server. Add your tool there if it handles files.

**5. Check everything:** `npm run check && npm test`, then push.

### Rules every tool follows

- **Nothing leaves the browser.** No `fetch()` to other servers and no uploads. Heavy libraries are
  bundled and loaded with `await import(…)` only when needed.
- **Put text from users or files into the page with `textContent`, never `innerHTML`.**
  File names and photo metadata can contain anything, including code (XSS).
- **All visible text comes from the language files.** Never hard-code English in a component.
- **Errors are explained.** Throw `UserError` with a translated message; everything else is
  shown as "Something went wrong: …" by `runTask()`.

## Add a converter page (e.g. "PNG to WebP")

Converter pages share one component and get their texts from a template, so a new pair is **one line**
in `src/tools/registry.ts`:

```ts
{ id: 'png-to-webp', category: 'image', component: 'ConvertImage', icon: 'repeat', convert: { from: 'png', to: 'webp' } },
```

All pairs of JPG, PNG and WebP exist already. A new input format (e.g. AVIF or GIF) also needs:
an entry in `src/lib/formats.ts`, a description in `formats` in every language file, and a check
that browsers can open it.

## Add a language (example: French)

1. Copy `src/i18n/en.ts` to `src/i18n/fr.ts`. Change the first line to
   `export const fr: Dictionary = {` and set `lang: 'fr'`, `locale: 'fr_FR'`, `name: 'Français'`.
   Add `import type { Dictionary, ToolText } from './en';` at the top, as in `de.ts`.
2. Translate every text. **Translate the slugs too** (`'merge-pdf'` → `'fusionner-pdf'`): people
   search in their own language, and so does Google.
3. Translate the `converter()` template (look at `de.ts` – grammar differs between languages).
4. Register it in `src/i18n/index.ts`: `export const dictionaries = { en, de, fr } …`
5. `npm run check && npm test`. The tests check that every page exists in every language, that no
   URL is used twice, and that all texts are complete.

Every tool page now exists in French too, with `hreflang` links, its own sitemap entries and
an entry in the language menu, all automatically.

Good next languages (big markets, fewer local tool sites): French, Italian, Spanish, Dutch,
Polish, Portuguese.
