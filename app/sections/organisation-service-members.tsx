"use client";
import { useEffect, useState } from 'react';
import type { GridexApiClient, ServiceGrant, ServiceMember } from '../lib/gridex-api';
import type { UiLanguage } from '../i18n/messages';

export function OrganisationServiceMembers({api,lang,organisationId}: {api:GridexApiClient;lang:UiLanguage;organisationId:string}) {
  const en=lang==='en';
  const [services,setServices]=useState<ServiceGrant[]|null>(null);
  const [members,setMembers]=useState<Record<string,ServiceMember[]>>({});
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  useEffect(()=>{
    const abort=new AbortController();
    api.organisationServices(organisationId,abort.signal)
      .then(result=>{if(!abort.signal.aborted)setServices(result.services);})
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
    setBusy(true);setError('');
    try{
      await api.setMemberService(organisationId,code,member.subject,!member.enabled);
      setMembers(previous=>({...previous,[code]:previous[code].map(item=>item.subject===member.subject
        ? {...item,enabled:!item.enabled}:item)}));
    }catch{setError(en?'Change not confirmed. Reload before retrying.':'Промяната не е потвърдена. Обновете преди нов опит.');}
    finally{setBusy(false);}
  }
  return <section className="card config-card invitation-panel service-grants">
    <span className="profile-kicker">GRIDEX · {en?'SERVICES':'УСЛУГИ'}</span>
    <h2>{en?'Services for approved users':'Услуги за одобрени потребители'}</h2>
    <p>{en?'Only services approved for this organisation appear here. No user is enabled automatically.':
      'Тук се показват само услугите, разрешени за организацията. Никой потребител не се включва автоматично.'}</p>
    {error&&<p role="alert">{error}</p>}
    {services?.filter(service=>service.enabled).map(service=><div key={service.code}>
      <h3>{service.code==='day_ahead'?(en?'Day-ahead market':'Пазар „ден напред“'):service.description}</h3>
      {service.code==='day_ahead'&&<p>{en?'The raw archive stays platform-only. BG charts require this grant, Visualisations and the organisation’s BG zone.':
        'Суровият архив остава само за супер администратора. BG графиките изискват това право, Графики и BG зона за организацията.'}</p>}
      {(members[service.code]||[]).map(member=><label key={member.subject} className="service-grant-row">
        <input type="checkbox" checked={member.enabled} disabled={busy} onChange={()=>void toggle(service.code,member)}/>
        <span>{member.email||member.subject} · {member.role}</span>
      </label>)}
    </div>)}
  </section>;
}
