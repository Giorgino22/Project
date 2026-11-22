/**
 * The "map" of the typing site: which pages exist, in which languages, at which URLs.
 * Everything that needs URLs (page generation, sitemap, language menu, links between pages)
 * asks this file, so URLs are defined in one place only. The page TEXTS are in src/i18n/.
 */
import type { ToolPageData } from '@tools/shared/components/ToolPage.astro';
import { langPrefix, type Alternate } from '@tools/shared/i18n';
import { languages, t, type SiteLang } from './i18n';
import type { Dictionary } from './i18n/en';
import type { TestOptions } from './lib/typing';

export const site = {
  id: 'typing' as const,
  /** AdSense ad unit IDs for this site (empty = no ad). The publisher ID is in network.ts. */
  adSlots: { afterTool: '', beforeFaq: '' },
};

/** The same for all language versions of a page: 'home', 'threeMinutes', … 'keyboard' */
export type PageKey = keyof Dictionary['pages'];

/** One page in one language, ready to render. */
export interface TypingPage extends ToolPageData {
  key: PageKey;
  lang: SiteLang;
  /** Settings of the typing test on this page (the keyboard test page has none) */
  test?: TestOptions;
  /** true = no ads on this page (pages for children) */
  noAds?: boolean;
}

/** pagePath('keyboard', 'de') → "/de/tastaturtest/" */
export function pagePath(key: PageKey, lang: SiteLang): string {
  const slug = t(lang).pages[key].slug;
  return `${langPrefix(lang)}/${slug ? `${slug}/` : ''}`;
}

/** All pages in one language (for the menu and the "more tools" list). */
export function pagesIn(lang: SiteLang): TypingPage[] {
  const texts = t(lang).pages;
  return (Object.keys(texts) as PageKey[]).map((key) => ({ ...texts[key], key, lang, path: pagePath(key, lang) }));
}

/** Every page of the site in every language. */
export function getAllPages(): TypingPage[] {
  return languages.flatMap(pagesIn);
}

/** All language versions of a page (for the language menu, hreflang links and the sitemap). */
export function alternatesOf(key: PageKey): Alternate[] {
  return languages.map((lang) => ({ lang, path: pagePath(key, lang) }));
}
