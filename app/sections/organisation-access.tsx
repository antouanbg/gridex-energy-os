"use client";
import { useEffect, useState, type ReactNode } from 'react';
import { GridexApiError, type GridexApiClient, type PlatformOrganisation, type ServiceGrant, type OrganisationMarketZone } from '../lib/gridex-api';
import type { UiLanguage } from '../i18n/messages';
import { serviceLabel } from '../lib/service-labels';
import { adminServiceRows } from '../lib/admin-service-catalog';
import { OrganisationMembers } from './organisation-members';
import { ServiceRequestsAdmin } from './service-requests-admin';

export function OrganisationAccessAdmin({ api, lang, children }: { api: GridexApiClient; lang: UiLanguage; children?:ReactNode }) {
  const en = lang === 'en';
  const [items, setItems] = useState<PlatformOrganisation[]>([]);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [notice, setNotice] = useState('');
  const [confirm, setConfirm] = useState<PlatformOrganisation | null>(null);
  const [selectedId,setSelectedId]=useState('');
  const [query,setQuery]=useState('');
  const [page,setPage]=useState(0);
  const [serviceRevision,setServiceRevision]=useState(0);
  const labels: Record<string, string> = en ? {
    active: 'Active', suspended: 'Suspended', pending: 'Pending', applied: 'Verified', sending: 'Delivery unknown — do not resend',
    unknown: 'Delivery unknown — do not resend', queued: 'Queued; delivery unconfirmed', delivered: 'Delivered', failed: 'Delivery failed', not_required: 'No email required',
  } : {
    active: 'Активна', suspended: 'Временно спряна', pending: 'Предстои', applied: 'Потвърдено', sending: 'Неясна доставка — без повторно изпращане',
    unknown: 'Неясна доставка — без повторно изпращане', queued: 'В опашка; доставката не е потвърдена', delivered: 'Доставено', failed: 'Неуспешна доставка', not_required: 'Не се изисква имейл',
  };
  async function reload() { setItems((await api.platformOrganisations()).organisations); setLoaded(true); }
  useEffect(() => {
    const controller = new AbortController();
    void api.platformOrganisations(controller.signal).then(result => {
      if (!controller.signal.aborted) { setItems(result.organisations); setLoaded(true); }
    }).catch(() => { if (!controller.signal.aborted) setNotice(en ? 'Organisation access management is unavailable.' : 'Управлението на достъпа е недостъпно.'); });
    return () => controller.abort();
  }, [api, en]);
  async function change(item: PlatformOrganisation, retry = false) {
    setBusy(true); setConfirm(null); setNotice('');
    try {
      const result = await api.changeOrganisationAccess(item.id, {
        operationId: retry && item.operationId ? item.operationId : crypto.randomUUID(),
        revision: retry ? item.revision - 1 : item.revision,
        status: retry && item.target ? item.target : item.status === 'active' ? 'suspended' : 'active',
      });
      setNotice(`${labels[result.status]} · ${labels[result.mailState] || result.mailState}`);
    } catch (error) {
      setNotice(error instanceof GridexApiError && error.status === 401
        ? en ? 'Sign in again before changing access.' : 'Влезте отново преди промяна на достъпа.'
        : en ? 'The change was not confirmed. Reload and reconcile the existing operation; do not create another request.' : 'Промяната не е потвърдена. Обновете и довършете съществуващата операция; не създавайте нова заявка.');
    } finally { try { await reload(); } catch { /* Keep the failure visible. */ } setBusy(false); }
  }
  const active=items.filter(item=>item.status==='active');
  const selected=active.find(item=>item.id===selectedId)||active[0];
  const filtered=items.filter(item=>`${item.name} ${item.realm}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  const pages=Math.max(1,Math.ceil(filtered.length/10));
  const currentPage=Math.min(page,pages-1);
  return <div className="platform-service-workspace" data-no-translate>
    <section className="admin-panel"><h3>{en?'Approved organisation':'Одобрена организация'}</h3>
      <div className="admin-selection-grid">
      <div className="admin-organisation-choice"><label className="admin-search">{en?'Organisation':'Организация'}<select value={selected?.id||''} onChange={event=>setSelectedId(event.target.value)}><option value="" disabled>{en?'Choose an active organisation':'Изберете активна организация'}</option>{active.map(item=><option value={item.id} key={item.id}>{item.name} · {labels.active}</option>)}</select></label>{selected&&<span className="admin-status">{labels.active}</span>}</div>
      {selected&&<OrganisationAdministrators key={'administrators-'+selected.id} api={api} lang={lang} organisationId={selected.id}/>}
      </div>
      {!loaded&&!notice&&<p role="status">{en?'Loading organisations…':'Зареждане на организациите…'}</p>}
      {loaded&&!active.length&&<p>{en?'No approved customer organisations.':'Няма одобрени клиентски организации.'}</p>}
      {notice&&<p role="status">{notice}</p>}
    </section>
    {selected&&<PlatformServiceGrants key={selected.id} api={api} lang={lang} organisationId={selected.id} onChanged={()=>setServiceRevision(value=>value+1)}/>}
    <ServiceRequestsAdmin api={api} lang={lang}/>
    {selected&&<OrganisationMembers key={'members-'+selected.id} api={api} lang={lang} organisationId={selected.id} platform/>}
    {children}
    <section className="admin-panel invitation-history">
    <h3>{en ? 'Approved organisations and services' : 'Одобрени организации и услуги'}</h3>
    <p>{en ? 'Suspension blocks access and ends sessions. Accounts and inventory are preserved. Restoration requires a fresh sign-in.' : 'Спирането блокира достъпа и прекратява сесиите. Акаунтите и инвентарът се запазват. След възстановяване е нужен нов вход.'}</p>
    <label className="admin-search">{en?'Find an organisation':'Намери организация'}<input type="search" value={query} maxLength={120} onChange={event=>{setQuery(event.target.value);setPage(0);}}/></label>
    <button className="secondary-btn" type="button" disabled={busy} onClick={() => { void reload().catch(() => setNotice(en ? 'Reload failed.' : 'Обновяването не успя.')); }}>{en ? 'Reload status' : 'Обнови състоянието'}</button>
    {loaded&&!filtered.length&&<p>{en?'No organisations match this filter.':'Няма организации за този филтър.'}</p>}
    {filtered.slice(currentPage*10,currentPage*10+10).map(item => <article className="invitation-record" key={item.id}>
      <strong>{item.name}</strong><p>{labels[item.status]}{item.operationState ? ` · ${labels[item.operationState]}` : ''}</p>
      {item.status==='active'&&<OrganisationServiceSummary api={api} lang={lang} organisationId={item.id} revision={serviceRevision}/>}
      {item.status === 'active' && <button type="button" className="secondary-btn" onClick={()=>{setSelectedId(item.id);document.querySelector('.platform-service-workspace')?.scrollIntoView({behavior:'smooth',block:'start'});}}>{en?'View service permissions':'Виж правата за услуги'}</button>}
      {item.mailState && <p>{en ? 'Suspension email' : 'Имейл за спиране'}: {labels[item.mailState]}</p>}
      {item.operationState === 'pending'
        ? <button type="button" className="secondary-btn" disabled={busy} onClick={() => void change(item, true)}>{en ? 'Complete existing operation' : 'Довърши съществуващата операция'}</button>
        : <button type="button" className="secondary-btn" disabled={busy} onClick={() => setConfirm(item)}>{item.status === 'active' ? en ? 'Suspend organisation' : 'Спри организацията' : en ? 'Restore access' : 'Възстанови достъпа'}</button>}
      {item.operationState === 'applied' && item.mailState === 'pending' && <button type="button" className="secondary-btn" disabled={busy} onClick={() => void change(item, true)}>{en ? 'Complete notification' : 'Довърши уведомяването'}</button>}
      {item.mailState === 'queued' && <button type="button" className="secondary-btn" disabled={busy} onClick={() => {
        setBusy(true); void api.checkOrganisationDelivery(item.id).then(result => { setNotice(labels[result.mailState]); return reload(); }).catch(() => setNotice(en ? 'Delivery check unavailable; no email was resent.' : 'Проверката на доставката е недостъпна; имейлът не е изпратен повторно.')).finally(() => setBusy(false));
      }}>{en ? 'Check delivery' : 'Провери доставката'}</button>}
      {confirm?.id === item.id && <div role="group" aria-label={en ? 'Confirm access change' : 'Потвърди промяната'}>
        <p>{item.status === 'active'
          ? en ? `Suspend ${item.name}? All members lose access; its verified first administrator receives one notification email.` : `Да се спре ли ${item.name}? Всички членове губят достъп; провереният първи администратор получава един уведомителен имейл.`
          : en ? `Restore ${item.name}? Existing roles are preserved; members must sign in again.` : `Да се възстанови ли ${item.name}? Съществуващите роли се запазват; членовете трябва да влязат отново.`}</p>
        <button type="button" className="primary-btn" disabled={busy} onClick={() => void change(item)}>{en ? 'Confirm' : 'Потвърди'}</button>
        <button type="button" className="secondary-btn" onClick={() => setConfirm(null)}>{en ? 'Cancel' : 'Откажи'}</button>
      </div>}
    </article>)}
    <div className="admin-pagination"><span>{filtered.length} {en?'records':'записа'} · {currentPage+1} / {pages}</span><div><button type="button" className="secondary-btn" disabled={currentPage===0} onClick={()=>setPage(value=>Math.max(0,value-1))}>{en?'Previous':'Назад'}</button><button type="button" className="secondary-btn" disabled={currentPage>=pages-1} onClick={()=>setPage(value=>value+1)}>{en?'Next':'Напред'}</button></div></div>
    </section>
  </div>;
}

function OrganisationAdministrators({api,lang,organisationId}:{api:GridexApiClient;lang:UiLanguage;organisationId:string}) {
  const [emails,setEmails]=useState<string[]|null>(null);
  const [failed,setFailed]=useState(false);
  useEffect(()=>{
    const abort=new AbortController();
    void (async()=>{
      let offset=0;
      const found=new Set<string>();
      for(;;){
        const result=await api.organisationMembers(organisationId,offset,true,abort.signal);
        if(abort.signal.aborted)return;
        for(const member of result.members)if(member.role==='administrator'&&member.email)found.add(member.email);
        if(result.nextOffset===null||result.nextOffset===undefined)break;
        if(result.nextOffset<=offset)throw new Error('Invalid member pagination');
        offset=result.nextOffset;
      }
      if(!abort.signal.aborted)setEmails([...found]);
    })().catch(()=>{if(!abort.signal.aborted)setFailed(true);});
    return()=>abort.abort();
  },[api,organisationId]);
  return <div className="admin-selected-administrators"><small>{lang==='en'?'Organisation administrator':'Администратор на организация'}</small><p>{emails?.length?emails.join(' · '):lang==='en'?(failed?'Administrator could not be verified':emails?'No verified administrator email':'Checking administrator…'):(failed?'Администраторът не можа да се провери':emails?'Няма проверен имейл на администратор':'Проверяваме администратора…')}</p></div>;
}

function OrganisationServiceSummary({api,lang,organisationId,revision}:{api:GridexApiClient;lang:UiLanguage;organisationId:string;revision:number}) {
  const [services,setServices]=useState<ServiceGrant[]|null>(null);
  const [failed,setFailed]=useState(false);
  useEffect(()=>{
    const abort=new AbortController();
    void api.platformOrganisationServices(organisationId,abort.signal).then(result=>{
      if(!abort.signal.aborted){setServices(result.services);setFailed(false);}
    }).catch(()=>{if(!abort.signal.aborted){setServices(null);setFailed(true);}});
    return()=>abort.abort();
  },[api,organisationId,revision]);
  if(!services)return <p role="status">{lang==='en'?(failed?'Service permissions unavailable':'Checking services…'):(failed?'Правата за услуги са недостъпни':'Проверяваме услугите…')}</p>;
  return <div className="admin-service-summary">{adminServiceRows(services).filter(service=>service.requestable).map(service=><span className="admin-status" key={service.code}>{serviceLabel(service.code,lang)} · {service.enabled?(lang==='en'?'Approved':'Разрешена'):(lang==='en'?'Not approved':'Не е разрешена')}</span>)}</div>;
}

function PlatformServiceGrants({api,lang,organisationId,onChanged}: {api:GridexApiClient;lang:UiLanguage;organisationId:string;onChanged:()=>void}) {
  const en=lang==='en';
  const [services,setServices]=useState<ServiceGrant[]|null>(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const [confirmCode,setConfirmCode]=useState('');
  useEffect(()=>{
    const abort=new AbortController();
    api.platformOrganisationServices(organisationId,abort.signal)
      .then(result=>{if(!abort.signal.aborted)setServices(result.services);})
      .catch(()=>{if(!abort.signal.aborted)setError(en?'Service permissions unavailable.':'Правата за услуги са недостъпни.');});
    return()=>abort.abort();
  },[api,organisationId,en]);
  async function toggle(service:ServiceGrant){
    setBusy(true);setError('');setNotice('');setConfirmCode('');
    try{
      await api.setPlatformOrganisationService(organisationId,service.code,!service.enabled);
      setServices((await api.platformOrganisationServices(organisationId)).services);
      onChanged();
      setNotice(service.enabled
        ?en?'Organisation access removed. Previous member grants will not return automatically.':'Достъпът за организацията е отнет. Предишните права на потребителите няма да се върнат автоматично.'
        :en?'Organisation service enabled. Its administrator must grant each member separately.':'Услугата е разрешена за организацията. Нейният администратор трябва отделно да разреши всеки потребител.');
    }catch{setError(en?'Change not confirmed. Reload before retrying.':'Промяната не е потвърдена. Обновете преди нов опит.');}
    finally{setBusy(false);}
  }
  return <section className="admin-panel service-grants" aria-label={en?'Organisation service permissions':'Права за услуги на организацията'}>
    <div className="admin-section-heading"><h3>{en?'Services for the organisation':'Услуги за организацията'}</h3><span className="admin-status">{en?'2 requestable':'2 заявяеми'}</span></div>
    {error&&<p role="alert">{error}</p>}
    {notice&&<p role="status">{notice}</p>}
    {adminServiceRows(services).map(service=><div key={service.code} className="admin-service-row" data-service-code={service.code}>
      <div><strong>{serviceLabel(service.code,lang)}{service.code==='day_ahead'?(en?' · Bulgaria / BG':' · България / BG'):''}</strong>
        <small>{!service.requestable?(en?'Shown in the catalogue; not yet requestable':'Показана в каталога; още не е заявяема'):!services?(error?(en?'Permissions unavailable':'Правата не са проверени'):(en?'Checking permissions…':'Проверяваме правата…')):service.enabled?(en?'Approved; members require separate permission':'Разрешена; потребителите се разрешават отделно'):(en?'Not approved for the organisation':'Не е разрешена за организацията')}</small></div>
      <div className="admin-service-actions"><span className="admin-status">{!service.requestable?(en?'Coming soon':'Предстои'):!services?(error?(en?'Unavailable':'Недостъпна'):(en?'Checking':'Проверяваме')):service.enabled?(en?'Approved':'Разрешена'):(en?'Not approved':'Не е разрешена')}</span>
        {!service.requestable&&<button type="button" className="secondary-btn" disabled>{en?'Not active':'Не е активна'}</button>}{service.requestable&&<button type="button" className={!service.enabled&&service.code==='day_ahead'?'primary-btn':'secondary-btn'} disabled={busy||!services} onClick={()=>service.enabled?setConfirmCode(service.code):void toggle(service)}>{service.enabled?(en?'Remove':'Отнеми'):(en?'Grant and notify':'Разреши и уведоми')}</button>}</div>
      {confirmCode===service.code&&<div role="group" aria-label={en?'Confirm service removal':'Потвърди отнемането на услугата'}>
        <p>{en?'Remove this service for the organisation and all its members? Previous member permissions will not return automatically.':'Да се отнеме ли услугата за организацията и всички нейни потребители? Старите лични разрешения няма да се върнат автоматично.'}</p>
        <button type="button" className="primary-btn" disabled={busy} onClick={()=>void toggle(service)}>{en?'Confirm removal':'Потвърди отнемането'}</button>
        <button type="button" className="secondary-btn" onClick={()=>setConfirmCode('')}>{en?'Cancel':'Откажи'}</button>
      </div>}
    </div>)}
    {services?.some(service=>service.code==='day_ahead'&&service.enabled)&&<OrganisationMarketZones api={api} lang={lang} organisationId={organisationId}/>}
  </section>;
}

function OrganisationMarketZones({api,lang,organisationId}:{api:GridexApiClient;lang:UiLanguage;organisationId:string}) {
  const en=lang==='en';
  const [zones,setZones]=useState<OrganisationMarketZone[]|null>(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  useEffect(()=>{
    const abort=new AbortController();
    api.organisationMarketZones(organisationId,abort.signal)
      .then(result=>{if(!abort.signal.aborted)setZones(result.zones);})
      .catch(()=>{if(!abort.signal.aborted)setError(en?'Country permissions unavailable.':'Правата по държави са недостъпни.');});
    return()=>abort.abort();
  },[api,organisationId,en]);
  async function toggle(zone:OrganisationMarketZone) {
    setBusy(true);setError('');
    try {
      await api.setOrganisationMarketZone(organisationId,zone.country,zone.zone,!zone.enabled);
      setZones((await api.organisationMarketZones(organisationId)).zones);
    } catch {setError(en?'Country permission not confirmed. Reload before retrying.':'Правото за държавата не е потвърдено. Обновете преди нов опит.');}
    finally {setBusy(false);}
  }
  return <div className="organisation-market-zones">
    <h4>{en?'Day-ahead countries for this organisation':'Държави „ден напред“ за организацията'}</h4>
    <p>{en?'Grant a collected zone explicitly. This does not enable any user; BG charts also require individual grants for Prices and Visualisations.':
      'Разрешете изрично събирана зона. Това не включва потребител; BG графиките изискват и лични права за Цени и Графики.'}</p>
    {error&&<p role="alert">{error}</p>}
    {zones?.map(zone=><label key={zone.zone} className="service-grant-row">
      <input type="checkbox" checked={zone.enabled} disabled={busy||(!zone.collected&&!zone.enabled)} onChange={()=>void toggle(zone)}/>
      <span>{zone.country==='BG'?(en?'Bulgaria':'България'):zone.country} · {zone.zone}{!zone.collected?(en?' · collection off':' · събирането е изключено'):''}</span>
    </label>)}
  </div>;
}
