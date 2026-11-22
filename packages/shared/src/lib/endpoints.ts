/**
 * Builds sitemap.xml and robots.txt for a site. Each app calls these from
 * src/pages/sitemap.xml.ts and src/pages/robots.txt.ts with its own list of pages.
 */
import { defaultLang, type Alternate } from '../i18n';
import { features, network, siteUrl, type SiteId } from '../network';

const xml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** A page for the sitemap: its path and – if it exists in several languages – all its language versions. */
export interface SitemapPage {
  path: string;
  alternates?: Alternate[];
}

/**
 * Pages → sitemap.xml response. Pages can be plain paths ('/yes-or-no-wheel/') or pages with
 * their language versions: then every entry also lists those versions (hreflang, plus x-default =
 * the English page), so Google shows German visitors the German page – the same format KeepLocal uses.
 */
export function sitemapResponse(site: SiteId, pages: (string | SitemapPage)[]): Response {
  const base = siteUrl(site);
  const entries = pages.map((page) => {
    const { path, alternates = [] } = typeof page === 'string' ? { path: page } : page;
    const lines = [`    <loc>${xml(base + path)}</loc>`];
    if (alternates.length > 1) {
      for (const version of alternates) {
        lines.push(`    <xhtml:link rel="alternate" hreflang="${version.lang}" href="${xml(base + version.path)}"/>`);
      }
      const fallback = alternates.find((version) => version.lang === defaultLang);
      if (fallback) lines.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${xml(base + fallback.path)}"/>`);
    }
    return ['  <url>', ...lines, '  </url>'].join('\n');
  });
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}

export function robotsResponse(site: SiteId): Response {
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${siteUrl(site)}/sitemap.xml\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

/** ads.txt – Google AdSense checks it on the main domain; it then also covers all subdomains. */
export function adsTxtResponse(): Response {
  const body = features.ads
    ? `google.com, ${network.adsenseClient.replace(/^ca-/, '')}, DIRECT, f08c47fec0942fa0\n`
    : '# Fill in adsenseClient in packages/shared/src/network.ts to activate this file.\n';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
