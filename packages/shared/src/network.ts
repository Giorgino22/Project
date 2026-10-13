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
 *
 * Money features stay OFF while their value is empty ('').
 * Where to get each value: docs/LAUNCH-CHECKLIST.md
 */

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
  legalUpdated: '2026-10-12',

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
  analytics: false,
};

/** The IDs of all sites. To add a site, add its ID here AND an entry to `sites` below. */
export type SiteId = 'hub' | 'keeplocal' | 'wheel' | 'typing';

export interface Site {
  id: SiteId;
  /** '' = the central domain itself (only the hub) */
  subdomain: string;
  name: string;
  /** One sentence for footers and the hub page */
  description: string;
  /** Most popular pages of the site, linked from the hub page */
  links: { path: string; label: string }[];
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
      { path: '/password-generator/', label: 'Password generator' },
    ],
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
  },
];

/** "wheel" → "https://wheel.example.com" (the hub gets the bare domain). */
export function siteUrl(id: SiteId): string {
  const site = sites.find((s) => s.id === id);
  if (!site) throw new Error(`Unknown site: ${id}`);
  return `https://${site.subdomain ? `${site.subdomain}.` : ''}${network.domain}`;
}

/** Is a money/statistics feature switched on? */
export const features = {
  ads: network.adsenseClient.trim() !== '',
  support: network.supportUrl.trim() !== '',
  analytics: network.analytics,
};

/** True while the domain is still the placeholder – builds print a warning then. */
export const isPlaceholderDomain = network.domain === 'example.com';
