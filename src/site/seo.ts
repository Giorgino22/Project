/**
 * Structured data ("JSON-LD") for search engines.
 * It tells Google & co. in a machine-readable way what a page is: a free web app,
 * a list of questions and answers, where the page sits in the site (breadcrumbs).
 * See https://schema.org for the vocabulary.
 */
import { config } from '../config';
import type { ToolText } from '../i18n/en';

type JsonLd = Record<string, unknown>;

export function websiteSchema(url: string, description: string, lang: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: config.siteName,
    url,
    description,
    inLanguage: lang,
  };
}

export function webApplicationSchema(text: ToolText, url: string, lang: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: text.name,
    description: text.description,
    url,
    inLanguage: lang,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  };
}

export function faqSchema(faq: { q: string; a: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
