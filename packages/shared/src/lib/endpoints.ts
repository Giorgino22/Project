/**
 * Builds sitemap.xml and robots.txt for a site. Each app calls these from
 * src/pages/sitemap.xml.ts and src/pages/robots.txt.ts with its own list of pages.
 */
import { features, network, siteUrl, type SiteId } from '../network';

const xml = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** paths like ['/', '/yes-or-no-wheel/'] → sitemap.xml response */
export function sitemapResponse(site: SiteId, paths: string[]): Response {
  const base = siteUrl(site);
  const urls = paths.map((path) => `  <url><loc>${xml(base + path)}</loc></url>`).join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
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
