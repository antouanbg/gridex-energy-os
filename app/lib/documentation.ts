import type { UiLanguage } from '../i18n/messages';

const DOCS_ORIGIN = 'https://doc.gridex.tech';
const readyGuides: Record<string, string> = {
  help: '/',
  login: '/organisations-and-access/',
  members: '/organisations-and-access/',
};

export function documentationLink(view: string, lang: UiLanguage): { href: string; ready: boolean } {
  const locale = lang === 'en' ? '/en' : '';
  const path = readyGuides[view];
  if (path) return { href: `${DOCS_ORIGIN}${locale}${path}`, ready: true };
  return { href: `${DOCS_ORIGIN}${locale}/coming-soon/?section=${encodeURIComponent(view)}`, ready: false };
}
