/** Builds /sitemap.xml: every page in every language, each with its other language versions. */
import { sitemapResponse } from '@tools/shared/lib/endpoints';
import { alternatesOf, getAllPages, site } from '../site';

export const GET = () =>
  sitemapResponse(
    site.id,
    getAllPages().map((page) => ({ path: page.path, alternates: alternatesOf(page.key) })),
  );
