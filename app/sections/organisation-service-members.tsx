"use client";
import { useEffect, useState } from 'react';
import type { GridexApiClient, ServiceCatalogItem, ServiceGrant, ServiceMember } from '../lib/gridex-api';
import type { UiLanguage } from '../i18n/messages';
import { serviceLabel } from '../lib/service-labels';
import { documentationLink } from '../lib/documentation';

export function OrganisationServiceMembers({api,lang,organisationId}: {api:GridexApiClient;lang:UiLanguage;organisationId:string}) {
  const en=lang==='en';
  const [services,setServices]=useState<ServiceGrant[]|null>(null);
  const [catalog,setCatalog]=useState<ServiceCatalogItem[]|null>(null);
  const [members,setMembers]=useState<Record<string,ServiceMember[]>>({});
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  useEffect(()=>{
    const abort=new AbortController();
    Promise.all([api.organisationServices(organisationId,abort.signal),api.serviceCatalog(abort.signal)])
      .then(([grants,available])=>{if(!abort.signal.aborted){setServices(grants.services);setCatalog(available.services);}})
      .catch(()=>{if(!abort.signal.aborted)setError(en?'Services could not be loaded.':'Услугите не могат да се заредят.');});
    return()=>abort.abort();
  },[api,organisationId,en]);
  useEffect(()=>{
    const enabled=services?.filter(service=>service.enabled)||[];
    if(!enabled.length)return;
    let mounted=true;
    Promise.all(enabled.map(service=>api.serviceMembers(organisationId,service.code)
      .then(result=>[service.code,result.members] as const)))
      .then(rows=>{if(mounted)setMembers(Object.fromEntries(rows));})
      .catch(()=>{if(mounted)setError(en?'Member permissions could not be loaded.':'Правата на потребителите не могат да се заредят.');});
    return()=>{mounted=false;};
  },[api,organisationId,services,en]);
  async function toggle(code:string,member:ServiceMember) {
    setBusy(true);setError('');setNotice('');
    try{
      await api.setMemberService(organisationId,code,member.subject,!member.enabled);
      setMembers(previous=>({...previous,[code]:previous[code].map(item=>item.subject===member.subject
        ? {...item,enabled:!item.enabled}:item)}));
      setNotice(member.enabled
        ?en?'Member access removed.':'Достъпът на потребителя е отнет.'
        :en?'Member access enabled.':'Достъпът на потребителя е разрешен.');
    }catch{setError(en?'Change not confirmed. Reload before retrying.':'Промяната не е потвърдена. Обновете преди нов опит.');}
    finally{setBusy(false);}
  }
  const approved=services?.filter(service=>service.enabled)||[];
  const approvedCodes=new Set(approved.map(service=>service.code));
  const unavailable=catalog?.filter(service=>service.requestable&&!approvedCodes.has(service.code))||[];
  const future=catalog?.filter(service=>!service.requestable)||[];
  return <section className="card config-card invitation-panel service-grants">
    <span className="profile-kicker">GRIDEX · {en?'SERVICES':'УСЛУГИ'}</span>
    <h2>{en?'Services and member access':'Услуги и достъп на потребителите'}</h2>
    <p>{en?'The platform administrator first approves a service for this organisation. You may then grant it to approved members individually.':
      'Супер администраторът първо разрешава услугата за организацията. След това Вие можете да я разрешите поотделно на одобрени потребители.'}</p>
    <a className="profile-inline-help" href={documentationLink('members',lang).href+'#additional-services'} target="_blank" rel="noopener noreferrer">{en?'How service approvals work':'Как работят одобренията'} ↗</a>
    {error&&<p role="alert">{error}</p>}
    {notice&&<p role="status">{notice}</p>}
    {!services&&!error&&<p role="status">{en?'Loading services…':'Зареждане на услугите…'}</p>}
    <h3>{en?'Approved for your organisation':'Разрешени за Вашата организация'}</h3>
    {services&&!approved.length&&<p>{en?'No services approved yet; members cannot be enabled.':'Все още няма разрешени услуги; потребителите не могат да бъдат включени.'}</p>}
    {approved.map(service=><div key={service.code}>
      <h4>{serviceLabel(service.code,lang,service.description)}</h4>
      {service.code==='day_ahead'&&<p>{en?'The raw archive stays platform-only. BG charts require this grant, Visualisations and the organisation’s BG zone.':
        'Суровият архив остава само за супер администратора. BG графиките изискват това право, Графики и BG зона за организацията.'}</p>}
      {!members[service.code]?.length&&<p>{en?'No approved members available for this service yet.':'Още няма одобрени потребители за тази услуга.'}</p>}
      {(members[service.code]||[]).map(member=><div key={member.subject} className="service-grant-row">
        <input type="checkbox" aria-label={`${serviceLabel(service.code,lang,service.description)} · ${member.email||member.subject}`} checked={member.enabled} disabled={busy} onChange={()=>void toggle(service.code,member)}/>
        <span><strong>{member.email||member.subject}</strong><small>{member.role} · {member.enabled?(en?'Enabled for this member':'Разрешена за този потребител'):(en?'Not enabled for this member':'Не е разрешена за този потребител')}</small></span>
      </div>)}
    </div>)}
    <h3>{en?'Available, not approved for your organisation':'Налични, но неразрешени за Вашата организация'}</h3>
    {catalog&&!unavailable.length&&<p>{en?'No other requestable services.':'Няма други заявяеми услуги.'}</p>}
    {unavailable.map(service=><div className="service-grant-row" key={service.code}>
      <span><strong>{serviceLabel(service.code,lang,service.description)}</strong><small>{en?'Awaiting platform permission; no member can be enabled yet.':'Чака разрешение от супер администратора; още не може да се включи потребител.'}</small></span>
    </div>)}
    <h3>{en?'Coming soon':'Предстои'}</h3>
    {future.map(service=><div className="service-grant-row" key={service.code}>
      <span><strong>{serviceLabel(service.code,lang,service.description)}</strong><small>{en?'Not yet requestable.':'Още не може да се заяви.'}</small></span>
    </div>)}
  </section>;
}
