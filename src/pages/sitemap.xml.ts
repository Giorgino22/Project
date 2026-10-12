/** Builds /sitemap.xml at build time (the list of all pages for search engines). */
import type { APIRoute } from 'astro';
import { getAllPages } from '../site/pages';
import { buildSitemap } from '../site/sitemap';

export const GET: APIRoute = () =>
  new Response(buildSitemap(getAllPages()), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
