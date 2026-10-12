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
  name: 'Practical Tools',

  /** Your central domain WITHOUT "https://" (e.g. 'practical-tools.com'). Each site becomes a subdomain. */
  domain: 'example.com',

  /** Who runs the sites – required by law in many countries (legal notice + privacy policy). */
  owner: {
    name: '', // e.g. 'Max Muster'
    address: '', // e.g. 'Musterstrasse 1, 8000 Zürich, Switzerland'
    email: '', // e.g. 'hello@your-domain.com'
  },

  /** Date shown on the privacy policies. Update it whenever you switch ads, statistics or tips on/off. */
  legalUpdated: '2026-10-12',

  /** Where the sites are hosted (named in the privacy policies). */
  hosting: {
    name: 'Cloudflare, Inc.',
    address: '101 Townsend St, San Francisco, CA 94107, USA',
    privacyUrl: 'https://www.cloudflare.com/privacypolicy/',
  },

  /** 💰 Google AdSense publisher ID (one account for all sites), looks like 'ca-pub-1234567890123456'. */
  adsenseClient: '',

  /** 💰 Tip jar (Ko-fi, Buy Me a Coffee…). Empty = no tip box. */
  supportUrl: '',

  /** 📈 Set to true after turning on Cloudflare Web Analytics for your domain (cookie-free statistics). */
  analytics: false,
};

/**
 * All websites of the network. To add a site: create apps/<name>/ (copy apps/wheel as a starting
 * point) and add it here – every site's footer and the hub page then link to it automatically.
 */
export const sites = [
  {
    id: 'hub',
    subdomain: '',
    name: network.name,
    description: 'Free online tools that are fast, simple and respect your privacy.',
  },
  {
    id: 'keeplocal',
    subdomain: 'keeplocal',
    name: 'KeepLocal',
    description: 'PDF & image tools that never upload your files.',
  },
  {
    id: 'wheel',
    subdomain: 'wheel',
    name: 'Spin the Wheel',
    description: 'Random name picker wheel for classrooms, games and decisions.',
  },
  {
    id: 'typing',
    subdomain: 'typing',
    name: 'Typing Test',
    description: 'Typing speed test, typing practice and a keyboard tester.',
  },
] as const;

export type SiteId = (typeof sites)[number]['id'];

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
