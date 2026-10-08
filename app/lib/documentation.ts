import type { UiLanguage } from '../i18n/messages';

const DOCS_ORIGIN = 'https://doc.gridex.tech';
const readyGuides: Record<string, string> = {
  help: '/',
  demo: '/demo-navigation/',
  overview: '/navigation-and-permissions/#overview',
  profile: '/navigation-and-permissions/#profile',
  plans: '/navigation-and-permissions/#plans',
  login: '/organisations-and-access/',
  members: '/organisations-and-access/',
  visualisations: '/organisations-and-access/#site-visualisations',
  market: '/market-prices/',
  about: '/contact-inquiries/',
  services: '/navigation-and-permissions/#services',
  settings: '/navigation-and-permissions/',
  devices: '/navigation-and-permissions/#inventory',
  assets: '/navigation-and-permissions/#inventory',
  battery: '/navigation-and-permissions/#inventory',
  inverter: '/navigation-and-permissions/#inventory',
  evse: '/navigation-and-permissions/#inventory',
  loads: '/navigation-and-permissions/#inventory',
  sites: '/navigation-and-permissions/#inventory',
  'market-settings': '/navigation-and-permissions/#administration',
  settlement: '/navigation-and-permissions/#administration',
};

export function documentationLink(view: string, lang: UiLanguage): { href: string; ready: boolean } {
  const locale = lang === 'en' ? '/en' : '';
  const path = readyGuides[view];
  if (path) return { href: `${DOCS_ORIGIN}${locale}${path}`, ready: true };
  return { href: `${DOCS_ORIGIN}${locale}/coming-soon/?section=${encodeURIComponent(view)}`, ready: false };
}
