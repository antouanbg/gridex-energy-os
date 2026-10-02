"use client";
import { useEffect, useState } from 'react';
import type { GridexApiClient, OrganisationMember, OrganisationMembersPage, ServiceGrant } from '../lib/gridex-api';
import type { UiLanguage } from '../i18n/messages';
import { serviceLabel } from '../lib/service-labels';
import { adminServiceRows, organisationServiceReady } from '../lib/admin-service-catalog';
import { documentationLink } from '../lib/documentation';

const editableRoles = ['viewer','operator','energy_manager','integrator'] as const;
const roleNames:Record<string,{bg:string;en:string}> = {
  administrator:{bg:'Администратор на организация',en:'Organisation administrator'},
  viewer:{bg:'Наблюдател',en:'Viewer'}, operator:{bg:'Оператор',en:'Operator'},
  energy_manager:{bg:'Енергиен мениджър',en:'Energy manager'}, integrator:{bg:'Интегратор',en:'Integrator'},
};
const roleRights:Record<string,{bg:string;en:string}> = {
  administrator:{bg:'Управлява организацията, потребителите, Обектите и commissioning.',en:'Manages the organisation, members, Sites and commissioning.'},
  viewer:{bg:'Чете данните от разрешените Обекти; не управлява устройства.',en:'Reads assigned Sites; cannot control devices.'},
  operator:{bg:'Чете данни, подава оперативни команди, подготвя и симулира стратегии.',en:'Reads data, sends operational commands, drafts and simulates strategies.'},
  energy_manager:{bg:'Оперативни права, конфигурация и активиране на стратегии.',en:'Operational rights, configuration and strategy activation.'},
  integrator:{bg:'Настройва активи и хардуер в разрешените Обекти; не създава Обекти.',en:'Configures assets and hardware in assigned Sites; cannot create Sites.'},
};
function memberName(member:OrganisationMember,en:boolean) {
  return member.firstName && member.lastName ? `${member.firstName} ${member.lastName}`
    : member.email || (en?'Name and email unavailable':'Име и имейл липсват');
}

export function OrganisationMembers({api,lang,organisationId,platform=false,onOrganisationServices}: {
  api:GridexApiClient;lang:UiLanguage;organisationId:string;platform?:boolean;onOrganisationServices?:()=>void
}) {
  const en=lang==='en';
  const [page,setPage]=useState<OrganisationMembersPage|null>(null);
  const [members,setMembers]=useState<OrganisationMember[]>([]);
  const [services,setServices]=useState<ServiceGrant[]|null>(null);
  const [serviceError,setServiceError]=useState(false);
  const [refreshKey,setRefreshKey]=useState(0);
  const [selected,setSelected]=useState<string|null>(null);
  const [role,setRole]=useState('viewer');
  const [siteIds,setSiteIds]=useState<string[]>([]);
  const [busy,setBusy]=useState(false);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const [query,setQuery]=useState('');
  const [search,setSearch]=useState('');
  const [offset,setOffset]=useState(0);
  const [reviewing,setReviewing]=useState(false);
  useEffect(()=>{const timer=setTimeout(()=>{setOffset(0);setSearch(query.trim());},250);return()=>clearTimeout(timer);},[query]);
  useEffect(()=>{
    const abort=new AbortController();queueMicrotask(()=>{if(!abort.signal.aborted){setLoading(true);setError('');setReviewing(false);}});
    void api.organisationMembers(organisationId,offset,platform,abort.signal,search).then(result=>{
      if(abort.signal.aborted)return;
      setPage(result);setMembers(result.members);
      const first=result.members[0];setSelected(first?.subject||null);setRole(first?.role||'viewer');setSiteIds(first?.siteIds||[]);
    }).catch(()=>{if(!abort.signal.aborted)setError(en?'Members could not be verified. Retry to load the organisation.':'Потребителите не можаха да се проверят. Опитайте отново.');})
      .finally(()=>{if(!abort.signal.aborted)setLoading(false);});
    return()=>abort.abort();
  },[api,organisationId,platform,en,refreshKey,offset,search]);
  useEffect(()=>{
    const abort=new AbortController();queueMicrotask(()=>{if(!abort.signal.aborted){setServices(null);setServiceError(false);}});
    const work=platform?api.platformOrganisationServices(organisationId,abort.signal):api.organisationServices(organisationId,abort.signal);
    void work.then(result=>{if(!abort.signal.aborted)setServices(result.services);})
      .catch(()=>{if(!abort.signal.aborted)setServiceError(true);});
    return()=>abort.abort();
  },[api,organisationId,platform,refreshKey]);
  const current=members.find(member=>member.subject===selected)||null;
  const changed=current&&(role!==current.role||siteIds.length!==current.siteIds.length
    ||siteIds.some(id=>!current.siteIds.includes(id))||current.siteIds.some(id=>!current.verifiedSiteIds.includes(id)));
  const siteName=(id:string)=>page?.sites.find(site=>site.id===id)?.name||id;
  async function save(){
    if(!current||platform||current.role==='administrator'||busy)return;
    setBusy(true);setError('');setNotice('');
    try{
      const result=await api.updateOrganisationMember(organisationId,current.subject,role,siteIds);
      setMembers(items=>items.map(member=>member.subject===current.subject
        ? {...member,role:result.role,siteIds:result.siteIds,verifiedSiteIds:result.siteIds,allSites:false}:member));
      setReviewing(false);setNotice(en?'Role and Site access were verified and saved.':'Ролята и достъпът до Обектите са проверени и записани.');
    }catch{setError(en?'The change was not confirmed. Your previous access remains shown.':'Промяната не е потвърдена. Показани са предишните права.');}
    finally{setBusy(false);}
  }
  async function toggleService(service:ServiceGrant){
    if(!current||platform||busy||!organisationServiceReady(service))return;
    const enabled=!current.services.includes(service.code);setBusy(true);setError('');setNotice('');
    try{
      const result=await api.setMemberService(organisationId,service.code,current.subject,enabled);
      if(result.enabled!==enabled)throw Error('Unconfirmed grant');
      setMembers(items=>items.map(member=>member.subject===current.subject?{...member,
        services:enabled?[...new Set([...member.services,service.code])]:member.services.filter(item=>item!==service.code)}:member));
      setNotice(enabled?(en?'Service access is enabled. The notification is scheduled.':'Услугата е разрешена. Уведомлението е подготвено за изпращане.')
        :(en?'Service access was removed. The notification is scheduled.':'Достъпът до услугата е отнет. Уведомлението е подготвено за изпращане.'));
    }catch{setError(en?'Service access was not changed successfully. Retry after checking the current status.':'Промяната на услугата не е потвърдена. Проверете текущия статус преди нов опит.');}
    finally{setBusy(false);}
  }
  return <section className="organisation-members" aria-label={en?'Organisation members':'Потребители на организацията'}>
    <div className="admin-section-heading"><div><h2>{en?'Approved members and services':'Одобрени потребители и услуги'}</h2>
      <p>{platform?en?'Read-only overview for the selected organisation.':'Преглед на избраната организация без редакция.':en?'Select a person to manage their role, Sites and separate services.':'Изберете човек, за да управлявате ролята, Обектите и отделните му услуги.'}</p></div>
      <a className="profile-inline-help" href={`${documentationLink('members',lang).href}#approved-members`} target="_blank" rel="noopener noreferrer">{en?'Help':'Помощ'} ↗</a></div>
    {error&&<div className="admin-feedback error" role="alert">{error} <button type="button" className="secondary-btn" onClick={()=>setRefreshKey(key=>key+1)}>{en?'Retry':'Опитай отново'}</button></div>}
    {notice&&<p className="admin-feedback" role="status">{notice}</p>}
    <div className="organisation-members-layout">
      <section className="organisation-members-list admin-panel" aria-label={en?'Approved member list':'Списък с одобрени потребители'}>
        <h3>{en?'Organisation members':'Потребители на организацията'}</h3>
        <label className="admin-search">{en?'Find a person or email':'Намери човек или имейл'}<input type="search" value={query} maxLength={120} onChange={event=>setQuery(event.target.value)} placeholder={en?'Name or email':'Име или имейл'}/></label>
        {loading&&<p role="status">{en?'Loading members…':'Зареждаме потребителите…'}</p>}
        {!loading&&page&&!members.length&&<p>{en?'No members match this search.':'Няма потребители за този избор.'}</p>}
        {members.map(member=><button key={member.subject} type="button" className="organisation-member-row" disabled={busy||loading}
          aria-pressed={selected===member.subject} onClick={()=>{setSelected(member.subject);setRole(member.role);setSiteIds(member.siteIds);setReviewing(false);setNotice('');}}>
          <span><strong>{memberName(member,en)}</strong><small>{member.email||member.subject} · {roleNames[member.role]?.[lang]||member.role}</small>
            <small>{member.siteIds.length} {en?'Sites':'Обекта'} · {member.services.length} {en?'services':'услуги'}</small>
            {(!member.firstName||!member.lastName)&&<small>{en?'Complete the names in Profile':'Допълнете имената в Профил'}</small>}</span>
          <span className="admin-status">{en?'Approved':'Одобрен'}</span>
        </button>)}
        {page&&<div className="admin-pagination"><span>{members.length?`${offset+1}–${offset+members.length}${page.total?` / ${page.total}`:''}`:'0'}</span>
          <div><button type="button" className="secondary-btn" disabled={loading||busy||offset===0} onClick={()=>setOffset(value=>Math.max(0,value-25))}>{en?'Previous':'Назад'}</button>
            <button type="button" className="secondary-btn" disabled={loading||busy||page.nextOffset===null} onClick={()=>setOffset(page.nextOffset||0)}>{en?'Next':'Напред'}</button></div></div>}
      </section>
      <section className="organisation-member-detail admin-panel" aria-label={en?'Selected member permissions':'Права на избрания потребител'}>
        {!current&&<p>{en?'Select an approved member to view access.':'Изберете одобрен потребител, за да видите достъпа му.'}</p>}
        {current&&<><h3>{memberName(current,en)}</h3>
          <div className="admin-member-meta"><div><span>{en?'Email':'Имейл'}</span><strong>{current.email||current.subject}</strong></div>
            <div><span>{en?'Last sign-in':'Последен вход'}</span><strong>{current.lastLoginAt?new Date(current.lastLoginAt).toLocaleString(en?'en-GB':'bg-BG'):(en?'Not recorded':'Няма запис')}</strong></div></div>
          <label>{en?'Role in organisation':'Роля в организацията'}<select value={role} disabled={platform||current.role==='administrator'||busy||loading}
            onChange={event=>{setRole(event.target.value);setReviewing(false);}}>
            {current.role==='administrator'&&<option value="administrator">{roleNames.administrator[lang]}</option>}
            {editableRoles.map(item=><option key={item} value={item}>{roleNames[item][lang]}</option>)}</select></label>
          <fieldset disabled={platform||current.role==='administrator'||busy||loading}><legend>{en?'Assigned Sites':'Разрешени Обекти'}</legend>
            {!page?.sites.length&&<p>{en?'No Sites have been created.':'Още няма създадени Обекти.'}</p>}
            <div className="admin-site-options">{page?.sites.map(site=><label key={site.id}><input type="checkbox" checked={siteIds.includes(site.id)}
              onChange={event=>{setSiteIds(ids=>event.target.checked?[...ids,site.id]:ids.filter(id=>id!==site.id));setReviewing(false);}}/>{site.name}</label>)}</div>
          </fieldset>
          {current.siteIds.some(id=>!current.verifiedSiteIds.includes(id))&&<p role="alert" className="organisation-member-warning">{en?'Some assigned Sites have no verified access link.':'За част от Обектите няма потвърдена връзка за достъп.'}</p>}
          <div className="admin-effective-rights"><strong>{en?'Effective role permissions':'Права според ролята'}</strong><p>{roleRights[role]?.[lang]} {siteIds.length?`${en?'Sites':'Обекти'}: ${siteIds.map(siteName).join(', ')}.`:(en?'No Site access.':'Без достъп до Обекти.')}</p>
            <a href={`${documentationLink('members',lang).href}#rights-matrix`} target="_blank" rel="noopener noreferrer">{en?'Permission matrix':'Матрица на правата'} ↗</a></div>
          {!platform&&current.role!=='administrator'&&<div className="admin-member-actions">
            {reviewing?<div className="admin-change-review" role="status"><strong>{en?'Review changes':'Преглед на промените'}</strong><p>{roleNames[current.role]?.[lang]} → {roleNames[role]?.[lang]}<br/>{en?'Sites':'Обекти'}: {siteIds.map(siteName).join(', ')||(en?'None':'Няма')}</p>
              <button type="button" className="primary-btn" disabled={busy||loading} onClick={()=>void save()}>{busy?(en?'Saving…':'Записване…'):(en?'Save role and Sites':'Запази роля и Обекти')}</button></div>
              :<button type="button" className="secondary-btn" disabled={!changed||busy||loading} onClick={()=>setReviewing(true)}>{en?'Review changes':'Преглед на промените'}</button>}
          </div>}
          <div className="admin-member-services"><h4>{en?'Additional services':'Допълнителни услуги'}</h4><p>{en?'Services are granted separately from the role and Sites.':'Услугите се разрешават отделно от ролята и Обектите.'}</p>
            {serviceError&&<div className="admin-feedback error" role="alert">{en?'Service permissions could not be checked. The member list remains available.':'Правата за услуги не можаха да се проверят. Списъкът с хора остава достъпен.'} <button type="button" className="secondary-btn" onClick={()=>setRefreshKey(key=>key+1)}>{en?'Retry':'Опитай отново'}</button></div>}
            {adminServiceRows(services).map(service=>{
              const ready=organisationServiceReady(service),enabled=current.services.includes(service.code),verified=services!==null&&!serviceError;
              return <div className="admin-service-row" key={service.code} data-service-code={service.code}><div><strong>{serviceLabel(service.code,lang)}{service.code==='day_ahead'?' · BG':''}</strong>
                <small>{!service.requestable?(en?'Coming soon':'Предстои'):!verified?(serviceError?(en?'Permissions unavailable':'Правата не са проверени'):(en?'Checking permissions…':'Проверяваме правата…')):!ready?(en?'Not approved for the organisation':'Не е одобрена за организацията'):enabled?(en?'Enabled for this person':'Разрешена за този човек'):(en?'Approved for the organisation; not enabled for this person':'Одобрена за организацията; не е разрешена за този човек')}</small></div>
                <div className="admin-service-actions"><button type="button" className={enabled?'secondary-btn':'primary-btn'} disabled={platform||busy||loading||!verified||!service.requestable||!ready}
                  onClick={()=>void toggleService(service)}>{!service.requestable?(en?'Coming soon':'Предстои'):enabled?(en?'Remove access':'Отнеми достъпа'):(en?'Grant and notify':'Разреши и уведоми')}</button>
                  {!platform&&verified&&service.requestable&&!ready&&onOrganisationServices&&<button type="button" className="secondary-btn" onClick={onOrganisationServices}>{en?'Organisation request':'Заяви за организацията'}</button>}</div>
              </div>;
            })}
          </div></>}
      </section>
    </div>
  </section>;
}

export function PlatformOrganisationMembers({api,lang}: {api:GridexApiClient;lang:UiLanguage}) {
  const en=lang==='en';const [organisations,setOrganisations]=useState<{id:string;name:string;status:string}[]>([]);const [id,setId]=useState('');const [error,setError]=useState(false);
  useEffect(()=>{const abort=new AbortController();api.platformOrganisations(abort.signal).then(result=>{if(!abort.signal.aborted){const active=result.organisations.filter(item=>item.status==='active');setOrganisations(active);setId(active[0]?.id||'');}}).catch(()=>{if(!abort.signal.aborted)setError(true);});return()=>abort.abort();},[api]);
  return <section className="card invitation-panel"><label className="admin-search">{en?'Select organisation — member overview':'Изберете организация — преглед на потребители'}<select value={id} onChange={event=>setId(event.target.value)}><option value="" disabled>{en?'Choose organisation':'Изберете организация'}</option>{organisations.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
    {error&&<p role="alert">{en?'Organisations could not be loaded.':'Организациите не можаха да се заредят.'}</p>}
    {id&&<OrganisationMembers key={id} api={api} lang={lang} organisationId={id} platform/>}</section>;
}
