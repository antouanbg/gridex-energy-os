// Every section has a stable URL. Site identifiers are context, never authority.
export const sectionPaths: Record<string, string> = {
  overview: '/', customers: '/customers/', sites: '/sites/', assets: '/assets/',
  battery: '/battery/', schedule: '/automation/schedules/', market: '/market/',
  settlement: '/market/settlement/', automation: '/automation/', loads: '/loads/',
  balance: '/market/balancing/', supported: '/devices/supported/', devices: '/devices/',
  alarms: '/alarms/', reports: '/reports/', settings: '/settings/',
  plans: '/settings/subscription/', about: '/about/', profile: '/profile/', login: '/login/',
};
const siteViews = new Set(['assets', 'battery', 'schedule', 'automation', 'loads', 'devices']);
export function sectionHref(view: string, siteId = ''): string {
  const path = sectionPaths[view === 'gateway' ? 'devices' : view] || '/';
  return siteId && siteViews.has(view) ? `/sites/${encodeURIComponent(siteId)}${path}` : path;
}
export function readRoute(pathname: string): { view: string; siteId: string } {
  let path = pathname.replace(/^\/en(?=\/|$)/, '') || '/';
  let siteId = '';
  const scoped = path.match(/^\/sites\/([^/]+)(\/.*)$/);
  if (scoped) {
    try { siteId = decodeURIComponent(scoped[1]); } catch { return { view: 'not-found', siteId: '' }; }
    path = scoped[2];
  }
  if (!path.endsWith('/')) path += '/';
  const view = path === '/overview/' ? 'overview' : Object.keys(sectionPaths).find(key => sectionPaths[key] === path);
  if (!view || (siteId && !siteViews.has(view))) return { view: 'not-found', siteId: '' };
  return { view, siteId };
}
