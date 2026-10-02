"use client";
import { useEffect, useState } from 'react';
import type { GridexApiClient, ServiceRequest } from '../lib/gridex-api';
import type { UiLanguage } from '../i18n/messages';
import { documentationLink } from '../lib/documentation';
import { serviceLabel } from '../lib/service-labels';

const label:Record<string,{bg:string;en:string}>={
  awaiting_platform:{bg:'Чака супер администратор',en:'Awaiting platform administrator'},
  awaiting_organisation:{bg:'Чака администратор на организация',en:'Awaiting organisation administrator'},
  active:{bg:'Разрешена',en:'Enabled'},
  rejected:{bg:'Отказана',en:'Declined'},
  cancelled:{bg:'Отменена',en:'Cancelled'},
  organisation_enabled:{bg:'Одобрена за организацията',en:'Organisation enabled'},
  revoked:{bg:'Достъпът е отнет',en:'Access revoked'},
  requested:{bg:'Подадена заявка',en:'Request submitted'},
  platform_approved:{bg:'Организацията е одобрена',en:'Organisation approved'},
  organisation_approved:{bg:'Потребителят е одобрен',en:'Member approved'},
};

export function ServiceRequestsAdmin({api,lang,organisationId}: {api:GridexApiClient;lang:UiLanguage;organisationId?:string}){
  const en=lang==='en';
  const [requests,setRequests]=useState<ServiceRequest[]>([]);
  const [busy,setBusy]=useState('');
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const [loaded,setLoaded]=useState(false);
  async function reload(){
    const result=organisationId?await api.organisationServiceRequests(organisationId):await api.platformServiceRequests();
    setRequests(result.requests);setLoaded(true);
  }
  useEffect(()=>{
    let active=true;
    const work=organisationId?api.organisationServiceRequests(organisationId):api.platformServiceRequests();
    void work.then(result=>{if(active){setRequests(result.requests);setLoaded(true);}})
      .catch(()=>{if(active)setError(en?'Service requests could not be loaded.':'Заявките за услуги не могат да се заредят.');});
    return()=>{active=false;};
  },[api,organisationId,en]);
  async function decide(item:ServiceRequest,action:'approve'|'reject'){
    if(busy)return;
    setBusy(item.id);setError('');setNotice('');
    try{
      if(action==='approve'){
        if(organisationId)await api.approveOrganisationServiceRequest(organisationId,item.id);
        else await api.approvePlatformServiceRequest(item.id);
      }else await api.rejectServiceRequest(item.id,organisationId);
      await reload();
      setNotice(action==='approve'
        ?organisationId?(en?'Member access enabled.':'Достъпът на потребителя е разрешен.')
          :(en?'Organisation enabled; its administrator must still approve the member.':'Организацията е разрешена; нейният администратор трябва отделно да одобри потребителя.')
        :en?'Request declined. No access was granted.':'Заявката е отказана. Не е предоставен достъп.');
    }catch{setError(en?'The decision was not confirmed. Reload before retrying.':'Решението не е потвърдено. Обновете преди нов опит.');}
    finally{setBusy('');}
  }
  return <section className="card config-card invitation-panel" aria-label={en?'Service requests':'Заявки за услуги'}>
    <span className="profile-kicker">GRIDEX · {en?'SERVICE REQUESTS':'ЗАЯВКИ ЗА УСЛУГИ'}</span>
    <h2>{en?'Service requests':'Заявки за услуги'}</h2>
    <button className="secondary-btn" type="button" disabled={Boolean(busy)} onClick={()=>void reload().then(()=>setError('')).catch(()=>setError(en?'Service requests could not be loaded.':'Заявките за услуги не могат да се заредят.'))}>{en?'Refresh requests':'Опресни заявките'}</button>
    <p>{organisationId
      ?en?'Only requests from your organisation appear here. Approving a member never enables a service for the whole organisation.':'Тук са само заявките на Вашата организация. Одобрението на член не включва услуга за цялата организация.'
      :en?'Your decision enables an organisation (and BG for day-ahead). Its administrator must approve each member separately.':'Вашето решение разрешава организацията (и BG за цените). Нейният администратор одобрява всеки член отделно.'}</p>
    <a className="profile-inline-help" href={documentationLink('members',lang).href+'#additional-services'} target="_blank" rel="noopener noreferrer">{en?'How service approvals work':'Как работят одобренията'} ↗</a>
    {error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
    {!loaded&&!error&&<p role="status">{en?'Loading…':'Зареждане…'}</p>}
    {loaded&&!requests.length&&<p>{en?'No service requests yet.':'Още няма заявки за услуги.'}</p>}
    {requests.map(item=>{
      const actionable=item.state==='open'&&item.requestScope===(organisationId?'member':'organisation')&&item.stage===(organisationId?'awaiting_organisation':'awaiting_platform');
      return <article className="invitation-record" key={item.id}>
        <strong>{serviceLabel(item.serviceCode,lang)}{item.serviceCode==='day_ahead'?(en?' · Bulgaria':' · България'):''}</strong>
        <p>{item.organisationName} · {item.email} · {label[item.stage]?.[lang]||item.stage}</p>
        <small>{new Date(item.createdAt).toLocaleString(en?'en-GB':'bg-BG')}</small>
        {item.events.length>0&&<details><summary>{en?'Decision history':'История на решенията'}</summary>
          <ul>{item.events.map((event,index)=><li key={`${event.at}-${index}`}>
            {label[event.action]?.[lang]||event.action} · {new Date(event.at).toLocaleString(en?'en-GB':'bg-BG')}{event.note?` · ${event.note}`:''}
          </li>)}</ul></details>}
        {actionable&&<div className="invitation-record-actions">
          <button className="primary-btn" type="button" disabled={Boolean(busy)} onClick={()=>void decide(item,'approve')}>
            {busy===item.id?en?'Working…':'Обработка…':en?'Approve':'Одобри'}</button>
          <button className="secondary-btn" type="button" disabled={Boolean(busy)} onClick={()=>void decide(item,'reject')}>
            {en?'Decline':'Откажи'}</button>
        </div>}
      </article>;
    })}
  </section>;
}
