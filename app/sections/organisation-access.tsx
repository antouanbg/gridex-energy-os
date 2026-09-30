"use client";
import { useEffect, useState } from 'react';
import { GridexApiError, type GridexApiClient, type PlatformOrganisation, type ServiceGrant, type OrganisationMarketZone } from '../lib/gridex-api';
import type { UiLanguage } from '../i18n/messages';
import { serviceLabel } from '../lib/service-labels';

export function OrganisationAccessAdmin({ api, lang }: { api: GridexApiClient; lang: UiLanguage }) {
  const en = lang === 'en';
  const [items, setItems] = useState<PlatformOrganisation[]>([]);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [notice, setNotice] = useState('');
  const [confirm, setConfirm] = useState<PlatformOrganisation | null>(null);
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
  return <div className="invitation-history" data-no-translate>
    <h3>{en ? 'Approved organisations' : 'Одобрени организации'}</h3>
    <p>{en ? 'Suspension blocks access and ends sessions. Accounts and inventory are preserved. Restoration requires a fresh sign-in.' : 'Спирането блокира достъпа и прекратява сесиите. Акаунтите и инвентарът се запазват. След възстановяване е нужен нов вход.'}</p>
    {notice && <p role="status">{notice}</p>}
    <button className="secondary-btn" type="button" disabled={busy} onClick={() => { void reload().catch(() => setNotice(en ? 'Reload failed.' : 'Обновяването не успя.')); }}>{en ? 'Reload status' : 'Обнови състоянието'}</button>
    {!loaded && !notice && <p>{en ? 'Loading organisations…' : 'Зареждане на организациите…'}</p>}
    {loaded && !items.length && <p>{en ? 'No approved customer organisations.' : 'Няма одобрени клиентски организации.'}</p>}
    {items.map(item => <article className="invitation-record" key={item.id}>
      <strong>{item.name}</strong><p>{labels[item.status]}{item.operationState ? ` · ${labels[item.operationState]}` : ''}</p>
      {item.status === 'active' && <PlatformServiceGrants api={api} lang={lang} organisationId={item.id}/>}
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
  </div>;
}

function PlatformServiceGrants({api,lang,organisationId}: {api:GridexApiClient;lang:UiLanguage;organisationId:string}) {
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
      setNotice(service.enabled
        ?en?'Organisation access removed. Previous member grants will not return automatically.':'Достъпът за организацията е отнет. Предишните права на потребителите няма да се върнат автоматично.'
        :en?'Organisation service enabled. Its administrator must grant each member separately.':'Услугата е разрешена за организацията. Нейният администратор трябва отделно да разреши всеки потребител.');
    }catch{setError(en?'Change not confirmed. Reload before retrying.':'Промяната не е потвърдена. Обновете преди нов опит.');}
    finally{setBusy(false);}
  }
  const approved=services?.filter(service=>service.enabled)||[];
  const available=services?.filter(service=>!service.enabled&&service.requestable)||[];
  const future=services?.filter(service=>!service.enabled&&!service.requestable)||[];
  return <div className="service-grants">
    <h4>{en?'Services for this organisation':'Услуги за тази организация'}</h4>
    <p>{en?'No user receives access automatically. The organisation administrator grants it separately.':
      'Никой потребител не получава достъп автоматично. Администраторът на организацията го разрешава отделно.'}</p>
    {error&&<p role="alert">{error}</p>}
    {notice&&<p role="status">{notice}</p>}
    {!services&&!error&&<p role="status">{en?'Loading services…':'Зареждане на услугите…'}</p>}
    <h5>{en?'Approved for the organisation':'Разрешени за организацията'}</h5>
    {services&&!approved.length&&<p>{en?'No services approved yet.':'Все още няма разрешени услуги.'}</p>}
    {approved.map(service=><div key={service.code} className="service-grant-row">
      <span><strong>{serviceLabel(service.code,lang,service.description)}</strong><small>{en?'Organisation approved · members require separate permission':'Одобрена за организацията · потребителите се разрешават отделно'}</small></span>
      <button type="button" className="secondary-btn" disabled={busy} onClick={()=>setConfirmCode(service.code)}>{en?'Remove':'Отнеми'}</button>
      {confirmCode===service.code&&<div role="group" aria-label={en?'Confirm service removal':'Потвърди отнемането на услугата'}>
        <p>{en?'Remove this service for the whole organisation? All member grants are deleted and will not return automatically.':'Да се отнеме ли услугата за цялата организация? Всички лични права се изтриват и няма да се върнат автоматично.'}</p>
        <button type="button" className="primary-btn" disabled={busy} onClick={()=>void toggle(service)}>{en?'Confirm removal':'Потвърди отнемането'}</button>
        <button type="button" className="secondary-btn" disabled={busy} onClick={()=>setConfirmCode('')}>{en?'Cancel':'Откажи'}</button>
      </div>}
    </div>)}
    {approved.some(service=>service.code==='day_ahead')&&
      <OrganisationMarketZones api={api} lang={lang} organisationId={organisationId}/>}
    <h5>{en?'Available, not approved for this organisation':'Налични, но неразрешени за организацията'}</h5>
    {services&&!available.length&&<p>{en?'No other requestable services.':'Няма други заявяеми услуги.'}</p>}
    {available.map(service=><div key={service.code} className="service-grant-row">
      <span><strong>{serviceLabel(service.code,lang,service.description)}</strong><small>{en?'Not approved for this organisation':'Не е разрешена за тази организация'}</small></span>
      <button type="button" className="secondary-btn" disabled={busy} onClick={()=>void toggle(service)}>{en?'Enable for organisation':'Разреши за организацията'}</button>
    </div>)}
    <h5>{en?'Coming soon':'Предстои'}</h5>
    {future.map(service=><div key={service.code} className="service-grant-row"><span><strong>{serviceLabel(service.code,lang,service.description)}</strong><small>{en?'Not yet requestable or available to grant':'Още не се заявява и не може да се разреши'}</small></span></div>)}
  </div>;
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
  return <div className="service-grants">
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
