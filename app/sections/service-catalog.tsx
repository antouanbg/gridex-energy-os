"use client";
import { useEffect, useState } from 'react';
import type { GridexApiClient, GridexUser, ServiceCatalogItem, ServiceRequest } from '../lib/gridex-api';
import type { UiLanguage } from '../i18n/messages';
import { documentationLink } from '../lib/documentation';
import { serviceLabel } from '../lib/service-labels';

const stages: Record<string,{bg:string;en:string}> = {
  awaiting_platform:{bg:'Чака разрешение от администратора на платформата',en:'Awaiting platform administrator'},
  awaiting_organisation:{bg:'Чака разрешение от администратора на организацията',en:'Awaiting organisation administrator'},
  active:{bg:'Разрешена',en:'Enabled'},
  rejected:{bg:'Отказана',en:'Declined'},
};
const eventLabels: Record<string,{bg:string;en:string}> = {
  requested:{bg:'Подадена заявка',en:'Request submitted'},
  platform_approved:{bg:'Организацията е одобрена',en:'Organisation approved'},
  organisation_approved:{bg:'Потребителят е одобрен',en:'Member approved'},
  rejected:{bg:'Заявката е отказана',en:'Request declined'},
};

export function ServiceCatalog({api,lang}:{api:GridexApiClient;lang:UiLanguage}) {
  const en=lang==='en';
  const [user,setUser]=useState<GridexUser|null>(null);
  const [services,setServices]=useState<ServiceCatalogItem[]>([]);
  const [requests,setRequests]=useState<ServiceRequest[]>([]);
  const [granted,setGranted]=useState<{code:string;organisationId:string}[]>([]);
  const [organisationId,setOrganisationId]=useState('');
  const [busy,setBusy]=useState('');
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const [loading,setLoading]=useState(true);
  async function refresh(){
    const [identity,catalog,pending,enabled]=await Promise.all([
      api.me(),api.serviceCatalog(),api.myServiceRequests(),api.myServices(),
    ]);
    setUser(identity);setServices(catalog.services);setRequests(pending.requests);
    setGranted(enabled.services);
    setOrganisationId(current=>identity.memberships?.some(m=>m.organisationId===current)
      ?current:identity.memberships?.[0]?.organisationId||'');
  }
  useEffect(()=>{
    let active=true;
    void Promise.all([api.me(),api.serviceCatalog(),api.myServiceRequests(),api.myServices()])
      .then(([identity,catalog,pending,enabled])=>{
        if(!active)return;
        setUser(identity);setServices(catalog.services);setRequests(pending.requests);
        setGranted(enabled.services);
        setOrganisationId(identity.memberships?.[0]?.organisationId||'');
      }).catch(()=>{if(active)setError(en?'Services could not be loaded.':'Услугите не могат да се заредят.');})
      .finally(()=>{if(active)setLoading(false);});
    return()=>{active=false;};
  },[api,en]);
  async function request(code:string){
    if(!organisationId||busy)return;
    setBusy(code);setError('');setNotice('');
    try{
      const result=await api.requestService(organisationId,code,
        code==='day_ahead'?'BG':undefined,code==='day_ahead'?'BG':undefined);
      await refresh();
      setNotice(result.created
        ?en?'Request sent. Access is not enabled until both administrators approve it.':'Заявката е изпратена. Достъпът не се включва преди двете одобрения.'
        :en?'This request is already pending.':'Тази заявка вече чака решение.');
    }catch{setError(en?'The request was not confirmed. Reload before retrying.':'Заявката не е потвърдена. Обновете преди нов опит.');}
    finally{setBusy('');}
  }
  return <article className="card profile-panel service-catalog" aria-label={en?'Services':'Услуги'}>
    <div className="profile-panel-heading"><div><span className="profile-kicker">03 / {en?'SERVICES':'УСЛУГИ'}</span>
      <h3>{en?'Service catalogue':'Каталог на услуги'}</h3></div>
      <a href={documentationLink('members',lang).href+'#additional-services'} target="_blank" rel="noopener noreferrer" aria-label={en?'Service access guide':'Помощ за услугите'}>?</a></div>
    <p className="profile-panel-intro">{en?'A request grants no access. The platform administrator enables your organisation; its administrator then enables you.':
      'Заявката не дава достъп. Супер администраторът разрешава организацията, а нейният администратор — Вас.'}</p>
    {loading&&<p role="status">{en?'Loading services…':'Зареждане на услугите…'}</p>}
    {error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
    {user&&user.memberships&&user.memberships.length>1&&<label>{en?'Organisation':'Организация'}
      <select value={organisationId} onChange={event=>setOrganisationId(event.target.value)}>
        {user.memberships.map(m=><option key={m.organisationId} value={m.organisationId}>{m.organisationId}</option>)}
      </select></label>}
    {!loading&&!organisationId&&<p>{en?'An active organisation is required.':'Нужна е активна организация.'}</p>}
    {services.map(service=>{
      const item=requests.find(row=>row.organisationId===organisationId&&row.serviceCode===service.code&&row.state==='open')
        ||requests.find(row=>row.organisationId===organisationId&&row.serviceCode===service.code);
      const enabled=granted.some(item=>item.code===service.code&&item.organisationId===organisationId);
      const pending=item?.state==='open'&&item.stage!=='active';
      return <div className="service-grant-row" key={service.code}>
        <span><strong>{serviceLabel(service.code,lang,service.description)}</strong>
          {service.code==='day_ahead'&&<small>{en?'Country: Bulgaria (BG) · one bidding zone':'Държава: България (BG) · една ценова зона'}</small>}
          <small>{enabled?en?'Enabled':'Разрешена':item?stages[item.stage]?.[lang]:service.requestable?en?'May be requested':'Може да се заяви':en?'Coming soon':'Предстои'}</small>
          {item&&<small>{en?'Requested':'Заявена'}: {new Date(item.createdAt).toLocaleString(en?'en-GB':'bg-BG')}</small>}
          {item?.events.length&&<details><summary>{en?'Request history':'История на заявката'}</summary>
            <ul>{item.events.map((event,index)=><li key={`${event.at}-${index}`}>
              {eventLabels[event.action]?.[lang]||event.action} · {new Date(event.at).toLocaleString(en?'en-GB':'bg-BG')}{event.note?` · ${event.note}`:''}
            </li>)}</ul></details>}
        </span>
        {service.requestable&&!enabled&&!pending&&organisationId&&<button type="button" className="secondary-btn" disabled={Boolean(busy)}
          onClick={()=>void request(service.code)}>{busy===service.code?en?'Sending…':'Изпращане…':en?'Request':'Заяви'}</button>}
      </div>;
    })}
  </article>;
}
