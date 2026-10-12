/**
 * The "map" of the website: which pages exist, in which languages, at which URLs.
 * Everything that needs URLs (page generation, sitemap, language switcher,
 * links between pages) asks this file, so URLs are defined in one place only.
 */
import { config } from '../config';
import type { ToolText } from '../i18n/en';
import { defaultLang, languages, t, type Lang } from '../i18n';
import { getTool, isConverterPage, tools, type MainToolId, type ToolId } from '../tools/registry';

export type LegalKind = 'privacy' | 'imprint';
export type PageKind = 'home' | 'tool' | LegalKind;

export interface SitePage {
  /** The same for all language versions of a page, e.g. "tool:merge-pdf" */
  key: string;
  kind: PageKind;
  lang: Lang;
  /** URL path, always with slashes at both ends, e.g. "/de/pdf-zusammenfuegen/" */
  path: string;
  toolId?: ToolId;
}

/** URL prefix of a language: "" for the default language, "/de" for German. */
export function langPrefix(lang: Lang): string {
  return lang === defaultLang ? '' : `/${lang}`;
}

/** The texts of a tool page. Converter pages ("PNG to JPG") are built from a template. */
export function toolText(toolId: ToolId, lang: Lang): ToolText {
  const tool = getTool(toolId);
  const dict = t(lang);
  if (isConverterPage(tool)) return dict.converter(tool.convert.from, tool.convert.to);
  return dict.tools[toolId as MainToolId];
}

export const homePath = (lang: Lang) => `${langPrefix(lang)}/`;
export const toolPath = (toolId: ToolId, lang: Lang) => `${langPrefix(lang)}/${toolText(toolId, lang).slug}/`;
export const legalPath = (kind: LegalKind, lang: Lang) => `${langPrefix(lang)}/${t(lang).legal[kind].slug}/`;

/** Every page of the site in every language. */
export function getAllPages(): SitePage[] {
  const pages: SitePage[] = [];
  for (const lang of languages) {
    pages.push({ key: 'home', kind: 'home', lang, path: homePath(lang) });
    for (const tool of tools) {
      pages.push({ key: `tool:${tool.id}`, kind: 'tool', lang, path: toolPath(tool.id, lang), toolId: tool.id });
    }
    for (const kind of ['privacy', 'imprint'] as const) {
      pages.push({ key: kind, kind, lang, path: legalPath(kind, lang) });
    }
  }
  return pages;
}

/** All language versions of a page (used for the language menu and hreflang tags). */
export function alternatesOf(key: string): SitePage[] {
  return getAllPages().filter((page) => page.key === key);
}

/** "/de/" → "https://your-domain.com/de/" */
export function absoluteUrl(path: string): string {
  return new URL(path, config.siteUrl).href;
}
