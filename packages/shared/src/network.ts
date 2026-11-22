/**
 * ======================================================================
 *  YOUR WEBSITE NETWORK – the settings ALL sites share. Edit this file.
 * ======================================================================
 *
 * Every website lives on a subdomain of one central domain:
 *   example.com            → the hub (lists all sites, legal pages)
 *   keeplocal.example.com  → PDF & image tools
 *   wheel.example.com      → spin the wheel
 *   typing.example.com     → typing test
 *   humm.example.com       → find a song by humming
 *
 * Money features stay OFF while their value is empty ('').
 * Every change to this file rebuilds and republishes ALL sites (they all use it).
 * Where to get each value: docs/LAUNCH-CHECKLIST.md
 */

import { defaultLang, type Lang } from './i18n';

export const network = {
  /** Name of the whole network (hub page, footers). */
  name: 'Tool-Tin',

  /** Your central domain WITHOUT "https://" (e.g. 'practical-tools.com'). Each site becomes a subdomain. */
  domain: 'toolstin.com',

  /** Who runs the sites – required by law in many countries (legal notice + privacy policy). */
  owner: {
    name: 'Martin Odermatt', // e.g. 'Max Muster'
    address: 'Brückenstrasse 12, 5430 Wettingen, Schweiz', // e.g. 'Musterstrasse 1, 8000 Zürich, Switzerland'
    email: 'martin@odermatts.ch', // e.g. 'hello@your-domain.com'
  },

  /** Date shown on the privacy policies. Update it whenever you switch ads, statistics or tips on/off. */
  legalUpdated: '2026-10-15',

  /** Where the sites are hosted (named in the privacy policies). */
  hosting: {
    name: 'Cloudflare, Inc.',
    address: '101 Townsend St, San Francisco, CA 94107, USA',
    privacyUrl: 'https://www.cloudflare.com/privacypolicy/',
  },

  /** Money: Google AdSense publisher ID (one account for all sites), looks like 'ca-pub-1234567890123456'. */
  adsenseClient: '',

  /** Money: tip jar (Ko-fi, Buy Me a Coffee…). Empty = no tip box. */
  supportUrl: '',

  /** Statistics: set to true after turning on Cloudflare Web Analytics for your domain (cookie-free statistics). */
  analytics: true,
};

/** The IDs of all sites. To add a site, add its ID here AND an entry to `sites` below. */
export type SiteId = 'hub' | 'keeplocal' | 'wheel' | 'typing' | 'humm';

export interface Site {
  id: SiteId;
  /** '' = the central domain itself (only the hub) */
  subdomain: string;
  name: string;
  /** One sentence for footers and the hub page */
  description: string;
  /** Most popular pages of the site, linked from the hub page */
  links: { path: string; label: string }[];
  /**
   * Only for a site that sends something to a server (Humm): one honest sentence that replaces
   * "Everything runs in your browser. Nothing is uploaded." at the bottom of the site's pages.
   */
  dataNote?: string;
  /**
   * The site for speakers of other languages: where they should go, its name, one sentence and
   * (for the hub's German start page) its most popular pages, e.g.
   * de: { path: '/de/', name: 'Glücksrad', description: '…', links: [...] }. Footers of pages in
   * that language link there instead of to the English start page. A site without pages in that
   * language (Humm) can still have German texts here; its path then stays '/'.
   */
  translations?: Partial<Record<Lang, SiteText>>;
}

export interface SiteText {
  path: string;
  name: string;
  description: string;
  links?: { path: string; label: string }[];
}

/**
 * All websites of the network. To add a site: create apps/<name>/ (copy apps/wheel as a starting
 * point) and add it here – every site's footer and the hub page then link to it automatically.
 */
export const sites: Site[] = [
  {
    id: 'hub',
    subdomain: '',
    name: network.name,
    description: 'Free online tools that are fast, simple and respect your privacy.',
    links: [],
    translations: {
      de: { path: '/de/', name: network.name, description: 'Kostenlose Online-Tools: schnell, einfach und mit Respekt für Ihre Privatsphäre.' },
    },
  },
  {
    id: 'keeplocal',
    subdomain: 'keeplocal',
    name: 'KeepLocal',
    description: 'PDF & image tools that never upload your files.',
    links: [
      { path: '/merge-pdf/', label: 'Merge PDF' },
      { path: '/image-to-text/', label: 'Image to text' },
      { path: '/jpg-to-pdf/', label: 'JPG to PDF' },
      { path: '/compress-image/', label: 'Compress image' },
      { path: '/swiss-qr-bill-generator/', label: 'Swiss QR-bill' },
      { path: '/password-generator/', label: 'Password generator' },
      { path: '/password-card-generator/', label: 'Password card' },
    ],
    translations: {
      de: {
        path: '/de/',
        name: 'KeepLocal',
        description: 'PDF- & Bild-Tools, die Ihre Dateien nie hochladen.',
        links: [
          { path: '/de/pdf-zusammenfuegen/', label: 'PDF zusammenfügen' },
          { path: '/de/bild-zu-text/', label: 'Bild zu Text' },
          { path: '/de/jpg-in-pdf/', label: 'JPG in PDF' },
          { path: '/de/bild-komprimieren/', label: 'Bild komprimieren' },
          { path: '/de/qr-rechnung-erstellen/', label: 'QR-Rechnung erstellen' },
          { path: '/de/passwort-generator/', label: 'Passwort-Generator' },
          { path: '/de/passwortkarte/', label: 'Passwortkarte' },
        ],
      },
    },
  },
  {
    id: 'wheel',
    subdomain: 'wheel',
    name: 'Spin the Wheel',
    description: 'Random name picker wheel for classrooms, games and decisions.',
    links: [
      { path: '/', label: 'Spin the wheel' },
      { path: '/yes-or-no-wheel/', label: 'Yes or no wheel' },
      { path: '/random-team-generator/', label: 'Team generator' },
    ],
    translations: {
      de: {
        path: '/de/',
        name: 'Glücksrad',
        description: 'Glücksrad und Namen-Zufallsgenerator für Schule, Spiele und Entscheidungen.',
        links: [
          { path: '/de/', label: 'Glücksrad drehen' },
          { path: '/de/ja-nein-gluecksrad/', label: 'Ja-oder-Nein-Rad' },
          { path: '/de/teamgenerator/', label: 'Teamgenerator' },
        ],
      },
    },
  },
  {
    id: 'typing',
    subdomain: 'typing',
    name: 'Typing Test',
    description: 'Typing speed test, typing practice and a keyboard tester.',
    links: [
      { path: '/', label: 'Typing speed test' },
      { path: '/typing-practice/', label: 'Typing practice' },
      { path: '/keyboard-test/', label: 'Keyboard test' },
    ],
    translations: {
      de: {
        path: '/de/',
        name: 'Tipptest',
        description: 'Tipptest, Tippen üben und Tastaturtest – mit deutschen Wörtern.',
        links: [
          { path: '/de/', label: 'Tipptest' },
          { path: '/de/tippen-ueben/', label: 'Tippen üben' },
          { path: '/de/tastaturtest/', label: 'Tastaturtest' },
        ],
      },
    },
  },
  {
    id: 'humm',
    subdomain: 'humm',
    name: 'Humm',
    description: 'Hum, sing or whistle a tune and find out which song it is.',
    links: [{ path: '/', label: 'Find a song by humming' }],
    dataNote: 'To find the song, your recording is sent to Google’s AI. We don’t keep it.',
    // Humm is English only; this is how the hub's German page describes it.
    translations: {
      de: {
        path: '/',
        name: 'Humm',
        description: 'Summen, singen oder pfeifen Sie eine Melodie – Humm findet den Song (Seite auf Englisch).',
        links: [{ path: '/', label: 'Song durch Summen finden' }],
      },
    },
  },
];

/** "wheel" → "https://wheel.example.com" (the hub gets the bare domain). */
export function siteUrl(id: SiteId): string {
  const site = sites.find((s) => s.id === id);
  if (!site) throw new Error(`Unknown site: ${id}`);
  return `https://${site.subdomain ? `${site.subdomain}.` : ''}${network.domain}`;
}

/**
 * A site's start page, name and description in a language – the English ones if the site has no
 * version in that language. siteIn('wheel', 'de') → { url: 'https://wheel.example.com/de/', name: 'Glücksrad', … }
 */
export function siteIn(id: SiteId, lang: Lang): Required<SiteText> & { url: string } {
  const site = sites.find((s) => s.id === id)!;
  const translation = lang === defaultLang ? undefined : site.translations?.[lang];
  const path = translation?.path ?? '/';
  return {
    url: siteUrl(id) + path,
    path,
    name: translation?.name ?? site.name,
    description: translation?.description ?? site.description,
    links: translation?.links ?? site.links,
  };
}

/** Is a money/statistics feature switched on? */
export const features = {
  ads: network.adsenseClient.trim() !== '',
  support: network.supportUrl.trim() !== '',
  analytics: network.analytics,
};

/** True while the domain is still the placeholder – builds print a warning then. */
export const isPlaceholderDomain = network.domain === 'example.com';
