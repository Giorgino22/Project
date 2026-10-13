/**
 * KeepLocal settings.
 *
 * Settings that ALL sites share – your domain, your name and address, the AdSense
 * publisher ID, the tip link, statistics – live in ONE place:
 *   packages/shared/src/network.ts
 * This file only holds what is special about KeepLocal (its ad places and affiliate offers).
 * Where to get each value: docs/LAUNCH-CHECKLIST.md (in the repository root).
 */
import { features as networkFeatures, network, siteUrl } from '@tools/shared/network';
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

  /** https://keeplocal.<your domain> – the domain is set in packages/shared/src/network.ts */
  siteUrl: siteUrl('keeplocal'),

  owner: network.owner,
  legalUpdated: network.legalUpdated,
  hosting: network.hosting,

  /** Money: Google AdSense. The publisher ID comes from the network settings. */
  ads: {
    adsenseClient: network.adsenseClient,
    /** Ad unit IDs (only digits) for the two ad places on every tool page. Empty = no ad there. */
    slots: {
      afterTool: '',
      beforeFaq: '',
    },
  },

  supportUrl: network.supportUrl,

  /**
   * Money: affiliate recommendations, shown on matching tool pages and marked as ads.
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

  /** Statistics: Cloudflare Web Analytics: cookie-free visitor statistics. */
  analytics: {
    cloudflare: network.analytics,
    /** Only needed if Cloudflare can't add the script automatically (see docs/LAUNCH-CHECKLIST.md). */
    cloudflareToken: '',
  },
};

/** Small helpers so the rest of the code can ask "is X switched on?" */
export const features = {
  ads: networkFeatures.ads,
  support: networkFeatures.support,
  affiliates: config.affiliates.some((offer) => offer.url.trim() !== ''),
  analytics: config.analytics.cloudflare || config.analytics.cloudflareToken.trim() !== '',
};
