import { sitemapResponse } from '@tools/shared/lib/endpoints';
import { allPages, site } from '../site';

export const GET = () => sitemapResponse(site.id, allPages.map((page) => page.path));
