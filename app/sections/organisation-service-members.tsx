"use client";
import { useEffect, useState } from 'react';
import type { GridexApiClient, OrganisationMembersPage, ServiceGrant, ServiceRequest } from '../lib/gridex-api';
import type { UiLanguage } from '../i18n/messages';
import { serviceLabel } from '../lib/service-labels';
import { adminServiceRows, organisationServiceReady } from '../lib/admin-service-catalog';
import { documentationLink } from '../lib/documentation';

export function OrganisationServiceMembers({api,lang,organisationId,subject,onMembers,catalogueOnly=false}: {
  api:GridexApiClient;lang:UiLanguage;organisationId:string;subject:string;onMembers?:()=>void;catalogueOnly?:boolean
}) {
  const en=lang==='en';
  const [services,setServices]=useState<ServiceGrant[]|null>(null);
  const [requests,setRequests]=useState<ServiceRequest[]|null>(null);
  const [page,setPage]=useState<OrganisationMembersPage|null>(null);
  const [offset,setOffset]=useState(0);
  const [search,setSearch]=useState('');
  const [query,setQuery]=useState('');
  const [busy,setBusy]=useState('');
  const [error,setError]=useState('');
  const [membersError,setMembersError]=useState(false);
  const [notice,setNotice]=useState('');
  const [refreshKey,setRefreshKey]=useState(0);
  useEffect(()=>{const timer=setTimeout(()=>{setOffset(0);setSearch(query.trim());},250);return()=>clearTimeout(timer);},[query]);
  useEffect(()=>{
    const abort=new AbortController();queueMicrotask(()=>{if(!abort.signal.aborted){setError('');setServices(null);setRequests(null);}});
    void api.organisationServices(organisationId,abort.signal).then(result=>{if(!abort.signal.aborted)setServices(result.services);})
      .catch(()=>{if(!abort.signal.aborted)setError(en?'Organisation service permissions could not be checked.':'Правата за услуги на организацията не можаха да се проверят.');});
    void api.organisationServiceRequests(organisationId,abort.signal).then(result=>{if(!abort.signal.aborted)setRequests(result.requests);})
      .catch(()=>{if(!abort.signal.aborted)setError(en?'Service requests could not be checked. Retry before sending another request.':'Заявките не можаха да се проверят. Опитайте отново преди изпращане на друга заявка.');});
    return()=>abort.abort();
  },[api,organisationId,en,refreshKey]);
  useEffect(()=>{
    if(catalogueOnly)return;
    const abort=new AbortController();queueMicrotask(()=>{if(!abort.signal.aborted)setMembersError(false);});
    void api.organisationMembers(organisationId,offset,false,abort.signal,search).then(result=>{if(!abort.signal.aborted)setPage(result);})
      .catch(()=>{if(!abort.signal.aborted)setMembersError(true);});
    return()=>abort.abort();
  },[api,organisationId,offset,search,refreshKey,catalogueOnly]);
  async function request(service:ServiceGrant,pending?:ServiceRequest){
    if(busy||services===null||requests===null)return;
    setBusy(service.code);setError('');setNotice('');
    try{
      if(pending){const result=await api.cancelOrganisationServiceRequest(organisationId,pending.id);if(result.stage!=='cancelled')throw Error('Unconfirmed cancellation');}
      else await api.requestOrganisationService(organisationId,service.code);
      const result=await api.organisationServiceRequests(organisationId);setRequests(result.requests);
      setNotice(pending?(en?'The organisation request was cancelled. The platform administrator will be notified.':'Заявката за организацията е отменена. Супер администраторът ще бъде уведомен.')
        :(en?'The organisation request was saved. The platform administrator will be notified.':'Заявката за организацията е записана. Супер администраторът ще бъде уведомен.'));
    }catch{setError(en?'The action was not confirmed. Refresh the status before retrying.':'Действието не е потвърдено. Опреснете статуса преди нов опит.');}
    finally{setBusy('');}
  }
  return <section className="organisation-service-workspace" aria-label={en?'Organisation services':'Услуги за организацията'}>
    {!catalogueOnly&&<div className="admin-section-heading"><div><h2>{en?'Services for the organisation':'Услуги за организацията'}</h2>
      <p>{en?'Only an organisation administrator requests services from the platform administrator. Each member needs a separate grant.':'Само администраторът на организацията заявява услуги към супер администратора. Всеки потребител получава отделно разрешение.'}</p></div>
      <a className="profile-inline-help" href={documentationLink('members',lang).href+'#additional-services'} target="_blank" rel="noopener noreferrer">{en?'Help':'Помощ'} ↗</a></div>}
    {error&&<div className="admin-feedback error" role="alert">{error} <button type="button" className="secondary-btn" onClick={()=>setRefreshKey(key=>key+1)}>{en?'Refresh status':'Опресни статуса'}</button></div>}
    {notice&&<p className="admin-feedback" role="status">{notice}</p>}
    <section className="admin-panel"><div className="admin-section-heading"><h3>{en?'Services for the organisation':'Услуги за организацията'}</h3><button className="secondary-btn" type="button" disabled={Boolean(busy)} onClick={()=>setRefreshKey(key=>key+1)}>{en?'Refresh':'Опресни'}</button></div>
      {adminServiceRows(services).map(service=>{
        const ready=organisationServiceReady(service),verified=services!==null&&requests!==null;
        const pending=requests?.find(item=>item.serviceCode===service.code&&item.requestScope==='organisation'&&item.state==='open'&&item.stage==='awaiting_platform');
        const ownPending=pending?.subject===subject;
        return <div className="admin-service-row" key={service.code} data-service-code={service.code}><div><strong>{serviceLabel(service.code,lang)}{service.code==='day_ahead'?(en?' · Bulgaria / BG':' · България / BG'):''}</strong>
          <small>{!service.requestable?(en?'Visible in the catalogue; requests will be available later.':'Видима в каталога; заявяването предстои.'):!verified?(error?(en?'Status could not be checked':'Статусът не е проверен'):(en?'Checking status…':'Проверяваме статуса…')):ready?(en?'Approved for the organisation. Grant access to selected members.':'Одобрена за организацията. Разрешете я за избраните хора.'):pending?(en?'Request sent to the platform administrator.':'Заявката е изпратена към супер администратора.'):(en?'Not approved for the organisation.':'Не е одобрена за организацията.')}</small></div>
          <div className="admin-service-actions"><span className={`admin-status ${pending?'waiting':''}`}>{!service.requestable?(en?'Coming soon':'Предстои'):ready?(en?'Approved for the organisation':'Одобрена за организацията'):pending?(en?'Awaiting decision':'Чака решение'):(en?'Not approved for the organisation':'Не е одобрена за организацията')}</span>
            {!ready&&<button type="button" className={pending?'secondary-btn':'primary-btn'} disabled={!service.requestable||!verified||Boolean(busy)||Boolean(pending&&!ownPending)}
              onClick={()=>void request(service,ownPending?pending:undefined)}>{busy===service.code?(en?'Working…':'Обработка…'):!service.requestable?(en?'Coming soon':'Предстои'):pending?(en?'Cancel request':'Отмени заявката'):(en?'Request from super administrator':'Заяви към супер админа')}</button>}
            {ready&&onMembers&&<button type="button" className="secondary-btn" onClick={onMembers}>{en?'Manage members':'Управлявай хората'}</button>}</div>
        </div>;
      })}
    </section>
    {!catalogueOnly&&<section className="admin-panel"><div className="admin-section-heading"><div><h3>{en?'Approved members and services':'Одобрени потребители и услуги'}</h3><p>{en?'All approved members remain listed even when no services have been granted.':'Всички одобрени хора са в списъка, включително когато още нямат разрешени услуги.'}</p></div>
      {onMembers&&<button type="button" className="secondary-btn" onClick={onMembers}>{en?'Manage access':'Управлявай достъпа'}</button>}</div>
      <label className="admin-search">{en?'Find a person or email':'Намери човек или имейл'}<input type="search" value={query} maxLength={120} onChange={event=>setQuery(event.target.value)}/></label>
      {membersError&&<p role="alert">{en?'Members could not be checked.':'Потребителите не можаха да се проверят.'}</p>}
      {!page&&!membersError&&<p role="status">{en?'Loading members…':'Зареждаме потребителите…'}</p>}
      {page&&!page.members.length&&<p>{en?'No members match this search.':'Няма потребители за този избор.'}</p>}
      {page?.members.map(member=><article className="admin-service-row" key={member.subject}><div><strong>{member.firstName&&member.lastName?`${member.firstName} ${member.lastName}`:member.email}</strong><small>{member.email}</small><small>{member.services.length?member.services.map(code=>serviceLabel(code,lang)).join(' · '):(en?'No services enabled for this person.':'Няма разрешени услуги за този човек.')}</small></div><span className="admin-status">{en?'Approved':'Одобрен'}</span></article>)}
      {page&&<div className="admin-pagination"><span>{page.members.length?`${offset+1}–${offset+page.members.length}${page.total?` / ${page.total}`:''}`:'0'}</span><div><button type="button" className="secondary-btn" disabled={offset===0} onClick={()=>setOffset(value=>Math.max(0,value-25))}>{en?'Previous':'Назад'}</button><button type="button" className="secondary-btn" disabled={page.nextOffset===null} onClick={()=>setOffset(page.nextOffset||0)}>{en?'Next':'Напред'}</button></div></div>}
    </section>}
  </section>;
}
