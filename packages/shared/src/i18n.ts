/**
 * Languages of the network's sites and the texts of the shared page frame (header, footer,
 * tool page template) in each of them.
 *
 * English is the default language and lives at the root of a site ("/yes-or-no-wheel/").
 * Other languages get a prefix ("/de/ja-nein-gluecksrad/") – the same way KeepLocal does it.
 * Which pages exist in which language is decided by each site (e.g. apps/wheel/src/site.ts).
 */

export type Lang = 'en' | 'de';

export const defaultLang: Lang = 'en';

/** One language version of a page, e.g. { lang: 'de', path: '/de/tastaturtest/' } */
export interface Alternate {
  lang: Lang;
  path: string;
}

/** URL prefix of a language: "" for English, "/de" for German. */
export function langPrefix(lang: Lang): string {
  return lang === defaultLang ? '' : `/${lang}`;
}

/** Replaces {placeholders}: fill('More from {network}', { network: 'Tool-Tin' }) → 'More from Tool-Tin' */
export function fill(text: string, values: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (match, name: string) => (name in values ? String(values[name]) : match));
}

const en = {
  /** Name of the language in the language menu */
  name: 'English',
  /** Used for Facebook/LinkedIn previews */
  locale: 'en_US',
  skip: 'Skip to content',
  mainMenu: 'Main',
  language: 'Language',
  languages: 'Languages',
  sitePages: '{site} pages',
  toolsOnSite: 'Tools on this site',
  moreFrom: 'More from {network}',
  moreTools: 'More free tools',
  allTools: 'All our tools',
  privacy: 'Privacy policy',
  imprint: 'Legal notice',
  noUpload: 'Everything runs in your browser. Nothing is uploaded.',
  howItWorks: 'How it works',
  faq: 'Frequently asked questions',
  related: 'More free tools',
  ad: 'Advertisement',
  supportTitle: 'Did this help?',
  supportText: 'The tools are free and stay free. If you’d like to say thanks, you can buy me a coffee.',
  supportButton: 'Buy me a coffee',
};

/** The texts of the shared page frame. TypeScript reports an error if a language misses one. */
export const frameTexts: Record<Lang, typeof en> = {
  en,
  de: {
    name: 'Deutsch',
    locale: 'de_DE',
    skip: 'Zum Inhalt springen',
    mainMenu: 'Hauptmenü',
    language: 'Sprache',
    languages: 'Sprachen',
    sitePages: 'Seiten von {site}',
    toolsOnSite: 'Tools auf dieser Seite',
    moreFrom: 'Mehr von {network}',
    moreTools: 'Weitere kostenlose Tools',
    allTools: 'Alle unsere Tools',
    privacy: 'Datenschutz',
    imprint: 'Impressum',
    noUpload: 'Alles läuft in Ihrem Browser. Nichts wird hochgeladen.',
    howItWorks: 'So funktioniert’s',
    faq: 'Häufige Fragen',
    related: 'Weitere kostenlose Tools',
    ad: 'Anzeige',
    supportTitle: 'Hat es geholfen?',
    supportText:
      'Die Tools sind kostenlos und bleiben es. Wenn Sie Danke sagen möchten, können Sie mir einen Kaffee spendieren.',
    supportButton: 'Kaffee spendieren',
  },
};

/** The hub's legal pages in each language (they cover the hub, the wheel and the typing site). */
export const legalPaths: Record<Lang, { privacy: string; imprint: string }> = {
  en: { privacy: '/privacy/', imprint: '/imprint/' },
  de: { privacy: '/de/datenschutz/', imprint: '/de/impressum/' },
};
