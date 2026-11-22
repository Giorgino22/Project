/** Builds /sitemap.xml. The legal pages exist in English and German, so they list each other. */
import { legalPaths } from '@tools/shared/i18n';
import { sitemapResponse } from '@tools/shared/lib/endpoints';

const versionsOf = (kind: 'privacy' | 'imprint') => [
  { lang: 'en' as const, path: legalPaths.en[kind] },
  { lang: 'de' as const, path: legalPaths.de[kind] },
];

export const GET = () =>
  sitemapResponse('hub', [
    '/',
    ...(['privacy', 'imprint'] as const).flatMap((kind) =>
      versionsOf(kind).map((version) => ({ path: version.path, alternates: versionsOf(kind) })),
    ),
  ]);
