/**
 * Builds sitemap.xml: the list of all pages for search engines.
 * For every page we also list its other language versions (hreflang), so Google
 * shows German visitors the German page and English visitors the English one.
 */
import { defaultLang } from '../i18n';
import { absoluteUrl, type SitePage } from './pages';

/** Escapes characters that have a special meaning in XML. */
const xml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function buildSitemap(pages: SitePage[]): string {
  const byKey = Map.groupBy(pages, (page) => page.key);

  const entries = pages.map((page) => {
    const versions = byKey.get(page.key) ?? [];
    const fallback = versions.find((version) => version.lang === defaultLang);
    const links = versions.map(
      (version) =>
        `    <xhtml:link rel="alternate" hreflang="${version.lang}" href="${xml(absoluteUrl(version.path))}"/>`,
    );
    if (fallback) {
      links.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${xml(absoluteUrl(fallback.path))}"/>`);
    }
    return ['  <url>', `    <loc>${xml(absoluteUrl(page.path))}</loc>`, ...links, '  </url>'].join('\n');
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n');
}
