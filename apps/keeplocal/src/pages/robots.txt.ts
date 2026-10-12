/** Builds /robots.txt: tells search engines they may crawl everything, and where the sitemap is. */
import type { APIRoute } from 'astro';
import { absoluteUrl } from '../site/pages';

export const GET: APIRoute = () =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl('/sitemap.xml')}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
