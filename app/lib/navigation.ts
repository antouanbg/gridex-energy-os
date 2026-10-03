// Owner-approved navigation, 2026-10-03. Visibility never grants API authority.
import {localeCatalogs,translate,type TranslationKey} from '../i18n/catalog';
export const navItems = [
  ['overview','⌂'],['sites','◇'],['assets','▦'],['battery','▣'],['inverter','☀'],['evse','ϟ'],['loads','⌁'],
  ['devices','⊞'],['services','◇'],['market','↗'],['visualisations','▥'],['reports','▤'],['weather','☁'],['forecast','↝'],
  ['modes','⌘'],['automation','⌘'],['schedule','▤'],['alarms','△'],
  ['settings','⚙'],['members','♙'],['plans','★'],['market-settings','¤'],['settlement','¤'],['balance','≋'],
  ['profile','○'],['help','?'],['about','○'],
] as const;
export const parentSection:Record<string,string>={battery:'assets',inverter:'assets',evse:'assets',loads:'assets',
  market:'services',visualisations:'services',reports:'services',weather:'services',forecast:'services',
  automation:'modes',schedule:'modes',alarms:'modes',members:'settings',plans:'settings',
  'market-settings':'settings',settlement:'market-settings',balance:'market-settings',profile:'settings',help:'profile'};
export function navigationLabel(view:string,lang:string){
  const key = 'nav.'+view;
  return Object.hasOwn(localeCatalogs.bg,key)?translate(lang,key as TranslationKey):view;
}
export function ancestors(view:string):string[]{const result:string[]=[];let current=parentSection[view];
  while(current&&!result.includes(current)){result.unshift(current);current=parentSection[current];}return result;}
