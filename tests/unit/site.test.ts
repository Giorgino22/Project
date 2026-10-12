import { describe, expect, it } from 'vitest';
import { dictionaries, languages, t } from '../../src/i18n';
import { alternatesOf, getAllPages, toolText } from '../../src/site/pages';
import { buildSitemap } from '../../src/site/sitemap';
import { tools } from '../../src/tools/registry';

describe('site structure', () => {
  const pages = getAllPages();

  it('has a page for every tool in every language', () => {
    expect(pages.filter((page) => page.kind === 'tool')).toHaveLength(tools.length * languages.length);
  });

  it('never uses the same URL twice', () => {
    const paths = pages.map((page) => page.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('only uses URL-friendly slugs', () => {
    for (const page of pages) expect(page.path).toMatch(/^\/([a-z0-9-]+\/)*$/);
  });

  it('links every page to all its language versions', () => {
    for (const page of pages) expect(alternatesOf(page.key)).toHaveLength(languages.length);
  });
});

describe('texts', () => {
  for (const lang of languages) {
    it(`${lang}: every tool has complete texts`, () => {
      for (const tool of tools) {
        const text = toolText(tool.id, lang);
        expect(text.title.length, `${tool.id} title`).toBeGreaterThan(10);
        expect(text.description.length, `${tool.id} description`).toBeGreaterThan(50);
        expect(text.description.length, `${tool.id} description is too long for Google`).toBeLessThanOrEqual(170);
        expect(text.steps.length).toBeGreaterThanOrEqual(3);
        expect(text.faq.length).toBeGreaterThanOrEqual(3);
      }
    });
  }

  it('all languages have the same number of FAQ entries on the home page', () => {
    const counts = Object.values(dictionaries).map((dict) => dict.home.faq.length);
    expect(new Set(counts).size).toBe(1);
  });

  it('German converter pages get German texts', () => {
    expect(toolText('png-to-jpg', 'de').h1).toBe('PNG in JPG umwandeln');
    expect(t('de').legal.privacy.slug).toBe('datenschutz');
  });
});

describe('sitemap', () => {
  it('lists every page with its language alternates', () => {
    const xml = buildSitemap(getAllPages());
    expect(xml).toContain('<loc>https://keeplocal.pages.dev/merge-pdf/</loc>');
    expect(xml).toContain('hreflang="de" href="https://keeplocal.pages.dev/de/pdf-zusammenfuegen/"');
    expect(xml).toContain('hreflang="x-default"');
    expect(xml.match(/<url>/g)).toHaveLength(getAllPages().length);
  });
});
