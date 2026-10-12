import { de } from './de';
import { en, type Dictionary } from './en';

/**
 * All languages of the site.
 * The default language lives at the root (/merge-pdf/), all others get a prefix
 * (/de/pdf-zusammenfuegen/).
 *
 * To add a language (e.g. French): copy en.ts to fr.ts, translate it, import it
 * here and add it to `dictionaries`. Every page then exists in French as well.
 */
export const dictionaries = { en, de } satisfies Record<string, Dictionary>;

export type Lang = keyof typeof dictionaries;

export const languages = Object.keys(dictionaries) as Lang[];

export const defaultLang: Lang = 'en';

/** The texts of one language: t('de').nav.home → "Startseite" */
export function t(lang: Lang): Dictionary {
  return dictionaries[lang];
}

export function isLang(value: string): value is Lang {
  return value in dictionaries;
}
