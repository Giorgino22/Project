/**
 * Structured data ("JSON-LD") that tells search engines what a page is: a free web app,
 * questions and answers, a website. Vocabulary: https://schema.org
 */
type JsonLd = Record<string, unknown>;

/** `lang`: language of the page, e.g. 'de' (search engines read it as "inLanguage"). */
export function webApplicationSchema(name: string, description: string, url: string, lang = 'en'): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    description,
    url,
    inLanguage: lang,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };
}

export function faqSchema(faq: { q: string; a: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  };
}

export function websiteSchema(name: string, url: string, description: string): JsonLd {
  return { '@context': 'https://schema.org', '@type': 'WebSite', name, url, description };
}
