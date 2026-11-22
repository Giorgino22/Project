import type { Lang } from '@tools/shared/i18n';
import { de } from './de';
import { en, type Dictionary } from './en';

/**
 * The languages of the typing site. English lives at the root (/keyboard-test/), German
 * under /de/ (/de/tastaturtest/) – the same way KeepLocal does it.
 *
 * To add a language (e.g. French): copy en.ts to fr.ts, translate it (and add French word lists),
 * add it here and add 'fr' to `Lang` in packages/shared/src/i18n.ts.
 */
export const dictionaries = { en, de } satisfies Partial<Record<Lang, Dictionary>>;

export type SiteLang = keyof typeof dictionaries;

export const languages = Object.keys(dictionaries) as SiteLang[];

/** The texts of one language: t('de').test.restart → "Neu starten" */
export function t(lang: SiteLang): Dictionary {
  return dictionaries[lang];
}
