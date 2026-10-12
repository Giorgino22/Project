import { sitemapResponse } from '@tools/shared/lib/endpoints';

export const GET = () => sitemapResponse('hub', ['/', '/privacy/', '/imprint/']);
