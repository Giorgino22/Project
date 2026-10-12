/**
 * ===================================================================
 *  SITE SETTINGS – the one file you edit to launch and to earn money
 * ===================================================================
 *
 * Every money feature stays OFF while its value is empty ('').
 * Fill in a value, push to GitHub, and Cloudflare rebuilds the site.
 * Where to get each value: docs/LAUNCH-CHECKLIST.md
 */
import type { Lang } from './i18n';
import type { ToolId } from './tools/registry';

export interface AffiliateOffer {
  /** Tool pages where this recommendation appears, e.g. ['password-generator'] */
  tools: ToolId[];
  /** Your personal affiliate link */
  url: string;
  /** Texts per language. A language without text simply doesn't show the box. */
  text: Partial<Record<Lang, { title: string; body: string; button: string }>>;
}

export const config = {
  /** Name shown in the header, page titles and legal pages. */
  siteName: 'KeepLocal',

  /**
   * Your domain, WITHOUT a slash at the end. Search engines see this address, so it must be
   * the real one before you tell Google about the site (the build log warns while it's the placeholder).
   */
  siteUrl: 'https://keeplocal.pages.dev',

  /** Who runs the site. Required by law in many countries (legal notice + privacy policy). */
  owner: {
    name: '', // e.g. 'Max Muster'
    address: '', // e.g. 'Musterstrasse 1, 8000 Zürich, Switzerland'
    email: '', // e.g. 'hello@your-domain.com'
  },

  /** Date shown on the privacy policy. Update it whenever you switch ads, analytics or affiliates on/off. */
  legalUpdated: '2026-10-12',

  /** Where the site is hosted (named in the privacy policy). */
  hosting: {
    name: 'Cloudflare, Inc.',
    address: '101 Townsend St, San Francisco, CA 94107, USA',
    privacyUrl: 'https://www.cloudflare.com/privacypolicy/',
  },

  /** 💰 Google AdSense. Leave empty until your AdSense account is approved. */
  ads: {
    /** Your publisher ID, looks like 'ca-pub-1234567890123456' */
    adsenseClient: '',
    /** Ad unit IDs (only digits) for the two ad places on every tool page. Empty = no ad there. */
    slots: {
      afterTool: '',
      beforeFaq: '',
    },
  },

  /** 💰 Tip jar (Ko-fi, Buy Me a Coffee, a Stripe Payment Link…). Empty = no tip box. */
  supportUrl: '',

  /**
   * 💰 Affiliate recommendations, shown on matching tool pages and marked as ads.
   * Example – a password manager on the password generator page:
   *
   * {
   *   tools: ['password-generator'],
   *   url: 'https://your-affiliate-link.example',
   *   text: {
   *     en: { title: 'Never forget a password again', body: 'A password manager stores all your passwords securely and fills them in for you.', button: 'Try it free' },
   *     de: { title: 'Nie wieder Passwörter vergessen', body: 'Ein Passwort-Manager speichert alle Passwörter sicher und füllt sie automatisch aus.', button: 'Kostenlos testen' },
   *   },
   * },
   */
  affiliates: [] as AffiliateOffer[],

  /** 📈 Cloudflare Web Analytics: cookie-free visitor statistics. */
  analytics: {
    /** Set to true after turning on Web Analytics in Cloudflare (adds it to the privacy policy). */
    cloudflare: false,
    /** Only needed if Cloudflare can't add the script automatically (see docs/LAUNCH-CHECKLIST.md, step 5). */
    cloudflareToken: '',
  },
};

/** Small helpers so the rest of the code can ask "is X switched on?" */
export const features = {
  ads: config.ads.adsenseClient.trim() !== '',
  support: config.supportUrl.trim() !== '',
  affiliates: config.affiliates.some((offer) => offer.url.trim() !== ''),
  analytics: config.analytics.cloudflare || config.analytics.cloudflareToken.trim() !== '',
};
