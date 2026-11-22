/**
 * The "map" of the wheel site: which pages exist, in which languages, at which URLs.
 * Everything that needs URLs (page generation, sitemap, language menu, links between pages)
 * asks this file, so URLs are defined in one place only. The page TEXTS are in src/i18n/.
 */
import type { ToolPageData } from '@tools/shared/components/ToolPage.astro';
import { defaultLang, langPrefix, type Alternate } from '@tools/shared/i18n';
import { languages, t, type SiteLang } from './i18n';
import type { Dictionary } from './i18n/en';

export const site = {
  id: 'wheel' as const,
  /** AdSense ad unit IDs for this site (empty = no ad). The publisher ID is in network.ts. */
  adSlots: { afterTool: '', beforeFaq: '' },
};

/** The same for all language versions of a page: 'home', 'yesNo', 'numbers', 'letters', 'teams' */
export type PageKey = keyof Dictionary['pages'];

/** One page in one language, ready to render. */
export interface WheelPage extends ToolPageData {
  key: PageKey;
  lang: SiteLang;
  /** Entries a first-time visitor sees */
  preset: string[];
}

/** pagePath('yesNo', 'de') → "/de/ja-nein-gluecksrad/" */
export function pagePath(key: PageKey, lang: SiteLang): string {
  const slug = t(lang).pages[key].slug;
  return `${langPrefix(lang)}/${slug ? `${slug}/` : ''}`;
}

/** All pages in one language (for the menu and the "more tools" list). */
export function pagesIn(lang: SiteLang): WheelPage[] {
  const texts = t(lang).pages;
  return (Object.keys(texts) as PageKey[]).map((key) => ({ ...texts[key], key, lang, path: pagePath(key, lang) }));
}

/** Every page of the site in every language. */
export function getAllPages(): WheelPage[] {
  return languages.flatMap(pagesIn);
}

/** All language versions of a page (for the language menu, hreflang links and the sitemap). */
export function alternatesOf(key: PageKey): Alternate[] {
  return languages.map((lang) => ({ lang, path: pagePath(key, lang) }));
}

/**
 * Name under which a page remembers the visitor's entries in their browser. Each language has
 * its own, so the German yes/no wheel doesn't start with "Yes" and "No" after a visit to the English one.
 */
export function storageKey(page: WheelPage): string {
  const names: Record<PageKey, string> = {
    home: 'wheel:home',
    yesNo: 'wheel:yes-no',
    numbers: 'wheel:numbers',
    letters: 'wheel:letters',
    teams: 'teams:names',
  };
  return page.lang === defaultLang ? names[page.key] : `${names[page.key]}:${page.lang}`;
}
