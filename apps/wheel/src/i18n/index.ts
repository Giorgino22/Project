import type { Lang } from '@tools/shared/i18n';
import { de } from './de';
import { en, type Dictionary } from './en';

/**
 * The languages of the wheel site. English lives at the root (/yes-or-no-wheel/), German
 * under /de/ (/de/ja-nein-gluecksrad/) – the same way KeepLocal does it.
 *
 * To add a language (e.g. French): copy en.ts to fr.ts, translate it, add it here and add 'fr'
 * to `Lang` in packages/shared/src/i18n.ts. Every page then exists in French as well.
 */
export const dictionaries = { en, de } satisfies Partial<Record<Lang, Dictionary>>;

export type SiteLang = keyof typeof dictionaries;

export const languages = Object.keys(dictionaries) as SiteLang[];

/** The texts of one language: t('de').wheel.spin → "Drehen" */
export function t(lang: SiteLang): Dictionary {
  return dictionaries[lang];
}
