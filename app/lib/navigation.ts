// Owner-approved navigation, 2026-10-03. Visibility never grants API authority.
import {localeCatalogs,translate,type TranslationKey} from '../i18n/catalog';
import catalogue from './navigation-catalog.json' with {type:'json'};
const icons = [
  ['overview','⌂'],['sites','◇'],['assets','▦'],['battery','▣'],['inverter','☀'],['evse','ϟ'],['loads','⌁'],
  ['devices','⊞'],['services','◇'],['market','↗'],['visualisations','▥'],['reports','▤'],['weather','☁'],['forecast','↝'],
  ['modes','⌘'],['automation','⌘'],['schedule','▤'],['alarms','△'],
  ['settings','⚙'],['members','♙'],['plans','★'],['market-settings','¤'],['settlement','¤'],['balance','≋'],
  ['profile','○'],['help','?'],['about','○'],
] as const;
// Public presentation snapshot of navigation_catalog, not user permissions.
export const navigationCatalogue=[...catalogue].sort((a,b)=>a.sort_order-b.sort_order);
export const navItems=navigationCatalogue.map(row=>[row.id,icons.find(([id])=>id===row.id)?.[1]??'◇'] as const);
export const parentSection:Record<string,string>=Object.fromEntries(navigationCatalogue.filter(row=>row.parent_id).map(row=>[row.id,row.parent_id!]));
export function navigationLabel(view:string,lang:string){
  const key = 'nav.'+view;
  return Object.hasOwn(localeCatalogs.bg,key)?translate(lang,key as TranslationKey):view;
}
export function ancestors(view:string):string[]{const result:string[]=[];let current=parentSection[view];
  while(current&&!result.includes(current)){result.unshift(current);current=parentSection[current];}return result;}
