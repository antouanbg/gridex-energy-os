import {useRef,useState} from 'react';
import type {FormEvent} from 'react';
import type { GridexApiClient,GridexSite } from '../lib/gridex-api';
import type { UiLanguage } from '../i18n/messages';

export function LiveSites({sites,status,onSelect,onCreated,organisations=[],api,lang,allowCreate=true}:{sites:GridexSite[];status:'loading'|'ready'|'error';onSelect:(site:GridexSite)=>void;onCreated:(site:GridexSite)=>void;organisations?:{organisationId:string;role:string;allSites:boolean}[];api:GridexApiClient;lang:UiLanguage;allowCreate?:boolean}) {
  const t=(bg:string,en:string)=>lang==='en'?en:bg;
  const adminOrganisations=organisations.filter(item=>item.role==='administrator'&&item.allSites);
  const [organisationId,setOrganisationId]=useState(adminOrganisations[0]?.organisationId||'');
  const [name,setName]=useState('');
  const [timezone,setTimezone]=useState(()=>Intl.DateTimeFormat().resolvedOptions().timeZone||'Europe/Sofia');
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState('');
  const attempt=useRef<{payload:string;key:string}|null>(null);
  const create=async(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();if(saving)return;
    const payload=JSON.stringify({organisationId,name:name.trim(),timezone:timezone.trim()});
    if(attempt.current?.payload!==payload)attempt.current={payload,key:crypto.randomUUID()};
    setSaving(true);setError('');
    try{
      const result=await api.createSite(JSON.parse(payload),attempt.current.key);
      attempt.current=null;setName('');onCreated(result);
    }catch{
      setError(t('Обектът не беше потвърден в OpenRemote. Проверете връзката и опитайте отново; същата заявка няма да създаде дубликат.','The Site was not verified in OpenRemote. Check the connection and retry; the same request will not create a duplicate.'));
    }finally{setSaving(false);}
  };
  if(status==='loading')return <section className="card" role="status">{t('Зареждане на твоите обекти…','Loading your sites…')}</section>;
  if(status==='error')return <section className="card" role="alert">{t('Не успяхме да заредим обектите. Презареди страницата, за да опиташ отново.','Could not load sites. Reload the page to try again.')}</section>;
  return <div data-no-translate>
    {!sites.length&&<section className="card">{adminOrganisations.length?(allowCreate?t('Организацията още няма Обект. Създайте първия по-долу.','This organisation has no Site yet. Create the first one below.'):t('Още няма Обект. Създайте го от раздел „Обекти“.','No Site yet. Create one under Sites.')):t('Към акаунта няма достъпни обекти. Администраторът трябва да ти даде достъп.','No sites are available to this account. Ask an administrator to grant access.')}</section>}
    {!!sites.length&&<section className="sites-grid">{sites.map(site=><article className="site-card card" key={site.id}>
    <h2>{site.name}</h2>
    <p>{t('Обект от твоя акаунт. Свързаността на устройствата се проверява отделно.','Site from your account. Device connectivity is verified separately.')}</p>
    <button type="button" className="primary-btn" onClick={()=>onSelect(site)}>{t('Устройства','Devices')} →</button>
  </article>)}</section>}
    {allowCreate&&!!adminOrganisations.length&&<section className="card config-card device-provisioning device-access">
      <h2>{t('Нов Обект','New Site')}</h2>
      <p>{t('Само администратор на организация може да създаде Обект. Той се записва първо в OpenRemote; устройствата се добавят отделно.','Only an organisation administrator can create a Site. It is recorded in OpenRemote first; devices are added separately.')}</p>
      <p><a href="https://doc.gridex.tech/organisations-and-access/#sites-and-devices" target="_blank" rel="noopener noreferrer">{t('Помощ за Обекти и права','Help with Sites and access')} ↗</a></p>
      <form onSubmit={create}>
        {adminOrganisations.length>1&&<label>{t('Организация','Organisation')}<select value={organisationId} onChange={event=>setOrganisationId(event.target.value)}>{adminOrganisations.map(item=><option key={item.organisationId} value={item.organisationId}>{item.organisationId}</option>)}</select></label>}
        <label>{t('Име на Обекта','Site name')}<input required maxLength={120} value={name} onChange={event=>setName(event.target.value)}/></label>
        <label>{t('Часова зона','Time zone')}<input required maxLength={80} value={timezone} onChange={event=>setTimezone(event.target.value)}/></label>
        <button className="primary-btn" type="submit" disabled={saving||!organisationId}>{saving?t('Създава се…','Creating…'):t('Създай Обект','Create Site')}</button>
      </form>
      {error&&<p role="alert">{error}</p>}
    </section>}
  </div>;
}
