import type { GridexSite } from '../lib/gridex-api';
import type { UiLanguage } from '../i18n/messages';

export function LiveSites({sites,status,onSelect,lang}:{sites:GridexSite[];status:'loading'|'ready'|'error';onSelect:(site:GridexSite)=>void;lang:UiLanguage}) {
  const t=(bg:string,en:string)=>lang==='en'?en:bg;
  if(status==='loading')return <section className="card" role="status">{t('Зареждане на твоите обекти…','Loading your sites…')}</section>;
  if(status==='error')return <section className="card" role="alert">{t('Не успяхме да заредим обектите. Презареди страницата, за да опиташ отново.','Could not load sites. Reload the page to try again.')}</section>;
  if(!sites.length)return <section className="card">{t('Към акаунта няма достъпни обекти. Администраторът трябва да ти даде достъп.','No sites are available to this account. Ask an administrator to grant access.')}</section>;
  return <section className="sites-grid" data-no-translate>{sites.map(site=><article className="site-card card" key={site.id}>
    <h2>{site.name}</h2>
    <p>{t('Обект от твоя акаунт. Свързаността на устройствата се проверява отделно.','Site from your account. Device connectivity is verified separately.')}</p>
    <button type="button" className="primary-btn" onClick={()=>onSelect(site)}>{t('Устройства','Devices')} →</button>
  </article>)}</section>;
}
