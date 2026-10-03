// Every section has a stable URL. Site identifiers are context, never authority.
export const legacyPaths: Record<string, string> = {
  overview: '/', customers: '/customers/', members: '/customers/users/', sites: '/sites/', assets: '/assets/',
  visualisations: '/visualisations/',
  battery: '/battery/', schedule: '/automation/schedules/', market: '/market/',
  settlement: '/market/settlement/', automation: '/automation/', loads: '/loads/',
  balance: '/market/balancing/', supported: '/devices/supported/', devices: '/devices/',
  alarms: '/alarms/', reports: '/reports/', settings: '/settings/',
  plans: '/settings/subscription/', about: '/about/', profile: '/profile/', login: '/login/', help: '/help/',
};
export const sectionPaths: Record<string,string>={...legacyPaths,
  members:'/settings/users/',customers:'/settings/users/',profile:'/settings/profile/',help:'/settings/profile/documentation/',
  services:'/services/',market:'/services/day-ahead/',visualisations:'/services/visualisations/',reports:'/services/analysis/',
  weather:'/services/weather/',forecast:'/services/forecast/',devices:'/infrastructure/',supported:'/infrastructure/catalogue/',
  battery:'/assets/battery/',inverter:'/assets/inverter/',evse:'/assets/charging-station/',loads:'/assets/loads/',
  modes:'/mode/',automation:'/mode/logic/',schedule:'/mode/schedule/',alarms:'/mode/alarm/',
  'market-settings':'/settings/market/',settlement:'/settings/market/tariff/',balance:'/settings/market/balancing/'};
const siteViews = new Set(['assets', 'battery','inverter','evse', 'schedule', 'automation', 'loads', 'devices', 'visualisations']);
export function sectionHref(view: string, siteId = '', demo = false): string {
  const path = sectionPaths[view === 'gateway' ? 'devices' : view] || '/';
  if(demo)return '/demo'+path;
  return siteId && siteViews.has(view) ? `/sites/${encodeURIComponent(siteId)}${path}` : path;
}
export function readRoute(pathname: string): { view: string; siteId: string } {
  let path = pathname.replace(/^\/en(?=\/|$)/, '') || '/';
  path = path.replace(/^\/demo(?=\/|$)/, '') || '/';
  let siteId = '';
  const scoped = path.match(/^\/sites\/([^/]+)(\/.*)$/);
  if (scoped) {
    try { siteId = decodeURIComponent(scoped[1]); } catch { return { view: 'not-found', siteId: '' }; }
    path = scoped[2];
  }
  if (!path.endsWith('/')) path += '/';
  const found = path === '/overview/' ? 'overview' : Object.keys(sectionPaths).find(key => sectionPaths[key] === path)
    || Object.keys(legacyPaths).find(key=>legacyPaths[key]===path);
  const view=found==='customers'?'members':found;
  if (!view || (siteId && !siteViews.has(view))) return { view: 'not-found', siteId: '' };
  return { view, siteId };
}
