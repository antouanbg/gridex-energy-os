"use client";
import { useEffect, useState } from 'react';
import type { GridexApiClient, OrganisationMember, OrganisationMembersPage, ServiceGrant } from '../lib/gridex-api';
import type { UiLanguage } from '../i18n/messages';
import { serviceLabel } from '../lib/service-labels';
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
function memberName(member:OrganisationMember, en:boolean) {
  return member.firstName && member.lastName ? `${member.firstName} ${member.lastName}`
    : member.email || (en?'Name and email unavailable':'Име и имейл липсват');
}

export function OrganisationMembers({api,lang,organisationId,platform=false}: {
  api:GridexApiClient;lang:UiLanguage;organisationId:string;platform?:boolean
}) {
  const en=lang==='en';
  const [page,setPage]=useState<OrganisationMembersPage|null>(null);
  const [members,setMembers]=useState<OrganisationMember[]>([]);
  const [services,setServices]=useState<ServiceGrant[]>([]);
  const [selected,setSelected]=useState<string|null>(null);
  const [role,setRole]=useState('viewer');
  const [siteIds,setSiteIds]=useState<string[]>([]);
  const [busy,setBusy]=useState(false);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  useEffect(()=>{
    const abort=new AbortController();
    const memberPage=api.organisationMembers(organisationId,0,platform,abort.signal);
    const servicePage=platform?Promise.resolve({services:[] as ServiceGrant[]}):api.organisationServices(organisationId,abort.signal);
    Promise.all([memberPage,servicePage]).then(([result,grants])=>{
      if(!abort.signal.aborted){setPage(result);setMembers(result.members);setServices(grants.services);
        setSelected(result.members[0]?.subject||null);setRole(result.members[0]?.role||'viewer');
        setSiteIds(result.members[0]?.siteIds||[]);setLoading(false);}
    }).catch(()=>{if(!abort.signal.aborted){setError(en?'Member access could not be verified.':'Достъпът на потребителите не можа да се провери.');setLoading(false);}});
    return()=>abort.abort();
  },[api,organisationId,platform,en]);
  const current=members.find(member=>member.subject===selected)||null;
  async function loadMore(){
    if(page?.nextOffset===null||!page||busy)return;
    setBusy(true);setError('');
    try{
      const next=await api.organisationMembers(organisationId,page.nextOffset,platform);
      setMembers(items=>[...items,...next.members]);setPage({...next,sites:page.sites});
    }catch{setError(en?'More members could not be loaded.':'Останалите потребители не можаха да се заредят.');}
    finally{setBusy(false);}
  }
  async function save(){
    if(!current||platform||current.role==='administrator'||busy)return;
    setBusy(true);setError('');setNotice('');
    try{
      const result=await api.updateOrganisationMember(organisationId,current.subject,role,siteIds);
      setMembers(items=>items.map(member=>member.subject===current.subject
        ? {...member,role:result.role,siteIds:result.siteIds,verifiedSiteIds:result.siteIds,allSites:false}:member));
      setNotice(en?'Role and Site scope were verified and saved.':'Ролята и достъпът до Обектите са проверени и записани.');
    }catch{setError(en?'The change was not confirmed. Previous rights remain shown; reload before retrying.':
      'Промяната не е потвърдена. Показани са предишните права; обновете преди нов опит.');}
    finally{setBusy(false);}
  }
  async function toggleService(code:string,enabled:boolean){
    if(!current||platform||busy)return;
    setBusy(true);setError('');setNotice('');
    try{
      const result=await api.setMemberService(organisationId,code,current.subject,enabled);
      if(result.enabled!==enabled)throw Error('Unconfirmed grant');
      setMembers(items=>items.map(member=>member.subject===current.subject?{...member,
        services:enabled?[...new Set([...member.services,code])]:member.services.filter(item=>item!==code)}:member));
      setNotice(enabled?(en?'Service enabled for this member.':'Услугата е разрешена за този потребител.')
        :(en?'Service access removed.':'Достъпът до услугата е отнет.'));
    }catch{setError(en?'Service change was not confirmed.':'Промяната на услугата не е потвърдена.');}
    finally{setBusy(false);}
  }
  const siteName=(id:string)=>page?.sites.find(site=>site.id===id)?.name||id;
  return <section className="card config-card invitation-panel organisation-members" aria-label={en?'Organisation members':'Потребители на организацията'}>
    <span className="profile-kicker">GRIDEX · {en?'MEMBER ACCESS':'ДОСТЪП НА ПОТРЕБИТЕЛИТЕ'}</span>
    <h2>{en?'Organisation members':'Потребители на организацията'}</h2>
    <p className="invitation-panel-intro">{platform
      ?en?'Read-only overview for the selected organisation.':'Преглед на избраната организация без редакция.'
      :en?'Select a member to review the effective role, assigned Sites and separate services.':'Изберете човек, за да видите ролята, Обектите и отделните му услуги.'}</p>
    <a className="profile-inline-help" href={documentationLink('members',lang).href} target="_blank" rel="noopener noreferrer">
      {en?'Roles and Site access':'Роли и достъп до Обекти'} ↗</a>
    {loading&&<p role="status">{en?'Verifying members…':'Проверяваме потребителите…'}</p>}
    {error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
    {!loading&&page&&<div className="organisation-members-layout">
      <div className="organisation-members-list" aria-label={en?'Approved members':'Одобрени потребители'}>
        {!members.length&&<p>{en?'No approved members.':'Няма одобрени потребители.'}</p>}
        {members.map(member=><button key={member.subject} type="button" className="organisation-member-row"
          aria-pressed={selected===member.subject} onClick={()=>{setSelected(member.subject);setRole(member.role);
            setSiteIds(member.siteIds);setError('');setNotice('');}}>
          <span><strong>{memberName(member,en)}</strong><small>{member.email||member.subject}</small>
            {(!member.firstName||!member.lastName)&&<small>{en?'Complete the name in Profile':'Допълнете имената в Профил'}</small>}</span>
          <span><b>{roleNames[member.role]?.[lang]||member.role}</b><small>{member.siteIds.length} {en?'Sites':'Обекта'}</small></span>
        </button>)}
        {page.nextOffset!==null&&<button type="button" className="secondary-btn" disabled={busy} onClick={()=>void loadMore()}>
          {en?'Load more':'Зареди още'}</button>}
      </div>
      {current&&<div className="organisation-member-detail">
        <h3>{memberName(current,en)}</h3><p>{current.email||current.subject}</p>
        <p>{en?'Last sign-in':'Последен вход'}: {current.lastLoginAt?new Date(current.lastLoginAt).toLocaleString(en?'en-GB':'bg-BG'):(en?'Not recorded':'Няма запис')}</p>
        <label>{en?'Role in organisation':'Роля в организацията'}
          <select value={role} disabled={platform||current.role==='administrator'||busy} onChange={event=>setRole(event.target.value)}>
            {current.role==='administrator'&&<option value="administrator">{roleNames.administrator[lang]}</option>}
            {editableRoles.map(item=><option key={item} value={item}>{roleNames[item][lang]}</option>)}
          </select></label>
        <p className="organisation-member-rights">{roleRights[role]?.[lang]}</p>
        <fieldset disabled={platform||current.role==='administrator'||busy}><legend>{en?'Assigned Sites':'Разрешени Обекти'}</legend>
          {!page.sites.length&&<p>{en?'No Sites have been created.':'Още няма създадени Обекти.'}</p>}
          {page.sites.map(site=><label key={site.id}><input type="checkbox" checked={siteIds.includes(site.id)}
            onChange={event=>setSiteIds(ids=>event.target.checked?[...ids,site.id]:ids.filter(id=>id!==site.id))}/>{site.name}</label>)}
        </fieldset>
        {current.siteIds.some(id=>!current.verifiedSiteIds.includes(id))&&<p role="alert" className="organisation-member-warning">
          {en?'Some configured Sites have no verified OpenRemote link. Do not assume access works.':
            'За част от настроените Обекти няма потвърдена връзка в OpenRemote. Не приемайте, че достъпът работи.'}</p>}
        <p className="organisation-member-summary">{en?'Current configured scope':'Текущ настроен достъп'}: {current.siteIds.length
          ?current.siteIds.map(siteName).join(', '):(en?'No Sites':'Няма Обекти')}</p>
        {!platform&&current.role!=='administrator'&&<button type="button" className="primary-btn"
          disabled={busy||(role===current.role&&siteIds.length===current.siteIds.length
            &&siteIds.every(id=>current.siteIds.includes(id))
            &&current.siteIds.every(id=>current.verifiedSiteIds.includes(id)))}
          onClick={()=>void save()}>{busy?(en?'Working…':'Обработка…'):(en?'Save role and Sites':'Запази роля и Обекти')}</button>}
        <fieldset disabled={platform||busy}><legend>{en?'Additional services — separate permissions':'Допълнителни услуги — отделни права'}</legend>
          {!services.filter(service=>service.enabled).length&&<p>{en?'No services enabled for this organisation.':'Няма разрешени услуги за организацията.'}</p>}
          {services.filter(service=>service.enabled).map(service=><label key={service.code}><input type="checkbox"
            checked={current.services.includes(service.code)} onChange={event=>void toggleService(service.code,event.target.checked)}/>
            {serviceLabel(service.code,lang,service.description)}</label>)}
          {platform&&current.services.length>0&&<p>{current.services.join(', ')}</p>}
        </fieldset>
      </div>}
    </div>}
  </section>;
}

export function PlatformOrganisationMembers({api,lang}: {api:GridexApiClient;lang:UiLanguage}) {
  const en=lang==='en';
  const [organisations,setOrganisations]=useState<{id:string;name:string;status:string}[]>([]);
  const [id,setId]=useState('');
  useEffect(()=>{const abort=new AbortController();api.platformOrganisations(abort.signal).then(result=>{
    if(!abort.signal.aborted){const active=result.organisations.filter(item=>item.status==='active');setOrganisations(active);setId(active[0]?.id||'');}
  }).catch(()=>{});return()=>abort.abort();},[api]);
  if(!id)return null;
  return <><div className="card config-card invitation-panel"><label>{en?'Organisation members — select organisation':'Потребители — изберете организация'}
    <select value={id} onChange={event=>setId(event.target.value)}>{organisations.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select>
  </label></div><OrganisationMembers key={id} api={api} lang={lang} organisationId={id} platform/></>;
}
