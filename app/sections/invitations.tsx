"use client";
import { useEffect, useState } from 'react';
import { GridexApiError, type GridexApiClient, type GridexUser, type GridexSite, type GridexInvitation, type SentGridexInvitation } from '../lib/gridex-api';
import type { UiLanguage } from '../i18n/messages';
import { OrganisationInvitationAdmin } from './organisation-invitations';
import { OrganisationServiceMembers } from './organisation-service-members';
import { ServiceRequestsAdmin } from './service-requests-admin';
import { OrganisationMembers } from './organisation-members';
import { documentationLink } from '../lib/documentation';
import { translate } from '../i18n/catalog';

const copy = {
  en: { title: 'Organisation access', manageTitle: 'Users & invitations', loading: 'Loading access…', unavailable: 'Email invitations are not enabled yet. Mailgun and identity setup must be completed.',
    failed: 'The request failed. Refresh and try again; do not assume an email was sent.', empty: 'No pending invitations. Registration alone does not grant access to sites.',
    invite: 'Invite by email', email: 'Work email', firstName: 'First name', lastName: 'Last name', org: 'Organisation', role: 'Role', sites: 'Permitted sites', send: 'Send invitation', accept: 'Accept invitation',
    accepted: 'Invitation accepted. Reload to load your sites.', reload: 'Reload portal', sent: 'Email dispatch confirmed. Access starts after verified sign-in.',
    revoke: 'Revoke invitation', revoked: 'Invitation revoked.', pending: 'Your invitations', expiry: 'Expires', busy: 'Working…',
    sentHistory: 'Invitations sent by you', noSent: 'No invitations sent yet.', resend: 'Resend invitation', resent: 'A new invitation link was sent to the same email.', resendUnconfirmed: 'Sending was not confirmed. Check the status before trying again.', state: 'Status', lastLogin: 'Last sign-in',
    noadmin: 'Only an organisation administrator can invite members.', noSites: 'No sites yet. You may invite a member without site access; grant access explicitly when sites are created.',
    viewer: 'Viewer — read only', operator: 'Operator — operational actions', energy_manager: 'Energy manager — strategies and configuration', integrator: 'Integrator — device configuration' },
  bg: { title: 'Достъп до организации', manageTitle: 'Потребители и покани', loading: 'Зареждане на правата…', unavailable: 'Поканите по имейл още не са включени. Нужни са Mailgun и настройки за идентификация.',
    failed: 'Заявката е неуспешна. Обновете и опитайте пак; не приемайте, че имейлът е изпратен.', empty: 'Няма чакащи покани. Самата регистрация не дава достъп до обекти.',
    invite: 'Покана по имейл', email: 'Служебен имейл', firstName: 'Собствено име', lastName: 'Фамилно име', org: 'Организация', role: 'Роля', sites: 'Разрешени обекти', send: 'Изпрати покана', accept: 'Приеми покана',
    accepted: 'Поканата е приета. Презаредете, за да заредите обектите.', reload: 'Презареди портала', sent: 'Изпращането е потвърдено. Достъпът започва след потвърден вход.',
    revoke: 'Отмени поканата', revoked: 'Поканата е отменена.', pending: 'Вашите покани', expiry: 'Валидна до', busy: 'Обработка…',
    sentHistory: 'Изпратени от Вас покани', noSent: 'Още няма изпратени покани.', resend: 'Изпрати поканата наново', resent: 'Нов линк за покана е изпратен на същия имейл.', resendUnconfirmed: 'Изпращането не е потвърдено. Проверете статуса преди нов опит.', state: 'Статус', lastLogin: 'Последен вход',
    noadmin: 'Само администратор на организация може да кани членове.', noSites: 'Още няма обекти. Може да поканите човек без достъп до обекти; дайте му права изрично, когато създадете обект.',
    viewer: 'Наблюдател — само четене', operator: 'Оператор — оперативни действия', energy_manager: 'Енергиен мениджър — стратегии и конфигурация', integrator: 'Интегратор — настройки на устройства' },
};
const roles = ['viewer', 'operator', 'energy_manager', 'integrator'] as const;
const invitationStates: Record<string, { bg: string; en: string }> = {
  sent: { bg: 'Изпратена', en: 'Sent' },
  accepted: { bg: 'Приета', en: 'Accepted' },
  revoked: { bg: 'Отменена', en: 'Revoked' },
  delivery_failed: { bg: 'Изпращането не е потвърдено', en: 'Delivery not confirmed' },
  pending_delivery: { bg: 'Изпраща се', en: 'Sending' },
};

export function Invitations({ api, lang, mode = 'accept', identity }: { api: GridexApiClient; lang: UiLanguage; mode?: 'accept' | 'manage'; identity?:GridexUser|null }) {
  const t = copy[lang];
  const [me, setMe] = useState<GridexUser | null>(identity||null);
  const [sites, setSites] = useState<GridexSite[]>([]);
  const [invites, setInvites] = useState<GridexInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [available, setAvailable] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<keyof typeof copy.en | null>(null);
  const [org, setOrg] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<string>('viewer');
  const [selected, setSelected] = useState<string[]>([]);
  const [outgoing, setOutgoing] = useState<SentGridexInvitation[]>([]);
  const [outgoingError, setOutgoingError] = useState(false);
  const [managerError, setManagerError] = useState(false);
  const [sitesError,setSitesError]=useState(false);
  const [refreshKey,setRefreshKey]=useState(0);
  const [invitationQuery,setInvitationQuery]=useState('');
  const [invitationStatus,setInvitationStatus]=useState('all');
  const [invitationPage,setInvitationPage]=useState(0);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const user = identity || await api.me(controller.signal);
        if (controller.signal.aborted) return;
        setMe(user);
        const admin = user.memberships?.find(m => m.role === 'administrator');
        setOrg(admin?.organisationId ?? '');
        const results=await Promise.allSettled([user.permissions.includes('site:read')?api.sites(controller.signal):Promise.resolve([]),api.invitations(controller.signal)]);
        if(controller.signal.aborted)return;
        if(results[0].status==='fulfilled'){setSites(results[0].value);setSitesError(false);}else setSitesError(true);
        if(results[1].status==='fulfilled'){setInvites(results[1].value.invitations);setAvailable(true);}else {setAvailable(false);setNotice('failed');}
      } catch (error) {
        if (!controller.signal.aborted) setNotice(error instanceof GridexApiError && error.status === 503 ? 'unavailable' : 'failed');
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load();
    return () => controller.abort();
  // The portal's verified identity determines the role. A separate invitation
  // or Site failure must never erase that identity or hide the member roster.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api,identity?.subject,identity?.realm,refreshKey]);
  useEffect(() => {
    if (mode !== 'manage' || !org || !me?.memberships?.some(m => m.organisationId === org && m.role === 'administrator')) return;
    const controller = new AbortController();
    void api.sentInvitations(org, controller.signal).then(result => {
      if (!controller.signal.aborted) { setOutgoing(result.invitations); setOutgoingError(false); }
    }).catch(() => { if (!controller.signal.aborted) setOutgoingError(true); });
    return () => controller.abort();
  }, [api, me, mode, org]);
  async function action(work: () => Promise<void>, failure?: keyof typeof copy.en) {
    if (busy) return;
    setBusy(true); setNotice(null);
    try { await work(); } catch (error) {
      setNotice(failure ?? (error instanceof GridexApiError && error.status === 503 ? 'unavailable' : 'failed'));
    } finally { setBusy(false); }
  }
  const admins = me?.memberships?.filter(m => m.role === 'administrator') ?? [];
  const platform=me?.permissions.includes('platform:manage')===true;
  const organisationAdmin=mode==='manage'&&!platform&&admins.length>0;
  const visibleSites = sites.filter(s => s.organisationId === org);
  const filteredInvitations=outgoing.filter(item=>(invitationStatus==='all'||item.state===invitationStatus)
    &&`${item.firstName||''} ${item.lastName||''} ${item.email}`.toLocaleLowerCase().includes(invitationQuery.toLocaleLowerCase()));
  const invitationPages=Math.max(1,Math.ceil(filteredInvitations.length/10));
  const currentInvitationPage=Math.min(invitationPage,invitationPages-1);
  return <div className="invitation-page" data-no-translate>
    {mode==='manage'&&<header className="invitation-hero card">
      <div><span className="profile-kicker">GRIDEX · {lang==='en'?'ACCESS CONTROL':'УПРАВЛЕНИЕ НА ДОСТЪПА'}</span>
        <h2>{organisationAdmin?(lang==='en'?'Services for the organisation':'Услуги за организацията'):(lang==='en'?'Services for organisations':'Услуги за организации')}</h2>
        <p>{platform?(lang==='en'?'Manage approved organisations and their separate service permissions.':'Управлявайте одобрените организации и отделните им услуги.'):(lang==='en'?'Manage the people, roles, Sites and services in your organisation.':'Управлявайте хората, ролите, Обектите и услугите във Вашата организация.')}</p>
        <div className="admin-identity"><span className="admin-status">{platform?(lang==='en'?'Platform administrator':'Супер администратор'):(lang==='en'?'Organisation administrator':'Администратор на организация')}</span><span>{me?.email}</span><small>{me?.name||translate(lang,'users.namesMissing')}</small></div></div>
      <div className="admin-header-actions">{organisationAdmin&&<a className="secondary-btn" href="#new-member-invitation">{lang==='en'?'+ Invite member':'+ Покани потребител'}</a>}
        <a className="profile-action" href={documentationLink('members',lang).href} target="_blank" rel="noopener noreferrer">{lang==='en'?'Help':'Помощ'} <span aria-hidden="true">↗</span></a></div>
    </header>}
    {mode==='manage'&&me?.permissions.includes('platform:manage')&&<OrganisationInvitationAdmin api={api} lang={lang}/>}
    {organisationAdmin&&<div id="organisation-services" className="admin-services-panel">
      {admins.map(admin=><OrganisationServiceMembers key={admin.organisationId} api={api} lang={lang} organisationId={admin.organisationId} subject={me!.subject} catalogueOnly onMembers={()=>document.getElementById('approved-organisation-members')?.scrollIntoView({behavior:'smooth',block:'start'})}/>)}</div>}
    {(mode==='accept'||organisationAdmin||!platform)&&<section className="card config-card invitation-panel" aria-label={mode==='manage'?t.manageTitle:t.title}
      id={organisationAdmin?'new-member-invitation':undefined}>
    <span className="profile-kicker">{mode==='manage'?(lang==='en'?'YOUR ORGANISATION':'ВАШАТА ОРГАНИЗАЦИЯ'):(lang==='en'?'PENDING ACCESS':'ЧАКАЩ ДОСТЪП')}</span>
    <h2>{mode==='manage'?(lang==='en'?'New member invitation':'Нова покана за потребител'):t.title}</h2>
    {loading && <p role="status">{t.loading}</p>}
    {notice && <p role={notice==='failed'||notice==='unavailable'||notice==='resendUnconfirmed'?'alert':'status'} aria-live="polite">{t[notice]}</p>}
    {!loading && <>
      {sitesError&&mode==='manage'&&<p className="admin-feedback error" role="alert">{lang==='en'?'Sites could not be loaded. Retry before choosing access.':'Обектите не можаха да се заредят. Опитайте отново преди избор на достъп.'} <button type="button" className="secondary-btn" onClick={()=>setRefreshKey(key=>key+1)}>{lang==='en'?'Retry':'Опитай отново'}</button></p>}
      {mode==='accept'&&<><h3>{t.pending}</h3>
      {!invites.length && <p>{t.empty}</p>}
      {invites.map(invite => <article key={invite.id}>
        <p>{t.org}: {invite.organisationId} · {roles.includes(invite.role as typeof roles[number]) ? t[invite.role as typeof roles[number]] : invite.role}</p>
        <p>{t.expiry}: {new Date(invite.expiresAt).toLocaleString(lang === 'bg' ? 'bg-BG' : 'en-GB')}</p>
        <p>{lang==='en'?'The portal completes a valid invitation after verified sign-in; no second acceptance is required. If access remains pending, contact your administrator.':'Порталът завършва валидната покана след потвърден вход; не е нужно второ приемане. Ако достъпът остава чакащ, свържете се с администратора.'}</p>
      </article>)}
      </>}
      {mode==='manage'&&(!admins.length ? !me?.permissions.includes('platform:manage') && <p>{t.noadmin}</p> : <details className="admin-invite-form"><summary>{translate(lang,'users.inviteMember')}</summary><form onSubmit={event => {
        event.preventDefault();
        if (!available || !org) return;
        void action(async () => {
          const result = await api.invite(org, { firstName, lastName, email, role, siteIds: selected });
          if (result.state !== 'sent') throw new Error('Dispatch not confirmed');
          setOutgoing(current => [{ id: result.id, firstName, lastName, email, role, siteIds: selected, state: 'sent',
            createdAt: new Date().toISOString(), expiresAt: new Date(Date.now()+86400000).toISOString() }, ...current]);
          setOutgoingError(false);
          setNotice('sent'); setEmail(''); setFirstName(''); setLastName(''); setSelected([]);
        });
      }}>
        <p className="invitation-panel-intro">{lang==='en'?'Choose a role and grant access only to the Sites this person needs.':'Изберете роля и дайте достъп само до Обектите, които са нужни на този човек.'}</p>
        <fieldset disabled={busy || !available || sitesError} className="config-form">
          <label>{t.org}<select value={org} onChange={event => { setOrg(event.target.value); setSelected([]); }}>
            {admins.map(m => <option key={m.organisationId} value={m.organisationId}>{me?.realm || m.organisationId}</option>)}
          </select></label>
          <label>{t.email}<input type="email" autoComplete="email" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)}/></label>
          <label>{t.firstName}<input type="text" autoComplete="given-name" required maxLength={80} value={firstName} onChange={event => setFirstName(event.target.value)}/></label>
          <label>{t.lastName}<input type="text" autoComplete="family-name" required maxLength={80} value={lastName} onChange={event => setLastName(event.target.value)}/></label>
          <label>{t.role}<select value={role} onChange={event => setRole(event.target.value)}>{roles.map(r => <option key={r} value={r}>{t[r]}</option>)}</select></label>
          <fieldset><legend>{t.sites}</legend>
            {!visibleSites.length && <p>{t.noSites}</p>}
            {visibleSites.map(site => <label key={site.id}><input type="checkbox" checked={selected.includes(site.id)} onChange={event => setSelected(ids => event.target.checked ? [...ids, site.id] : ids.filter(id => id !== site.id))}/>{site.name}</label>)}
          </fieldset>
          <button className="primary-btn" type="submit" disabled={!org}>{busy ? t.busy : t.send}</button>
        </fieldset>
      </form></details>)}
    </>}
  </section>}
{!loading&&organisationAdmin&&<section className="admin-panel member-invitation-history" aria-label={t.sentHistory}>
        <h3>{lang==='en'?'Member invitations':'Покани за потребители'}</h3>
        <div className="admin-ledger-tools"><label className="admin-search">{lang==='en'?'Find a person or email':'Намери човек или имейл'}<input type="search" value={invitationQuery} onChange={event=>{setInvitationQuery(event.target.value);setInvitationPage(0);}}/></label>
          <label className="admin-search">{t.state}<select value={invitationStatus} onChange={event=>{setInvitationStatus(event.target.value);setInvitationPage(0);}}><option value="all">{lang==='en'?'All':'Всички'}</option>{['sent','accepted','revoked'].map(state=><option key={state} value={state}>{invitationStates[state]?.[lang]||state}</option>)}</select></label></div>
        {outgoingError&&<p role="alert">{t.failed}</p>}
        {!outgoingError&&!outgoing.length&&<p>{t.noSent}</p>}
        {!outgoingError&&outgoing.length>0&&!filteredInvitations.length&&<p>{lang==='en'?'No invitations match this filter.':'Няма покани за този филтър.'}</p>}
        {filteredInvitations.slice(currentInvitationPage*10,currentInvitationPage*10+10).map(item=><article className="invitation-record" key={item.id}>
          <strong>{item.firstName&&item.lastName?`${item.firstName} ${item.lastName} · `:''}{item.email}</strong> · {roles.includes(item.role as typeof roles[number])?t[item.role as typeof roles[number]]:item.role}
          <p>{t.state}: {invitationStates[item.state]?.[lang] ?? item.state} · {item.state==='accepted'?`${t.lastLogin}: ${item.lastLoginAt?new Date(item.lastLoginAt).toLocaleString(lang==='bg'?'bg-BG':'en-GB'):lang==='bg'?'Очаква се запис':'Not recorded yet'}`:`${t.expiry}: ${new Date(item.expiresAt).toLocaleString(lang==='bg'?'bg-BG':'en-GB')}`}</p>
          {item.state==='sent'&&<div className="invitation-record-actions">
            <button className="secondary-btn" type="button" disabled={busy} onClick={() => void action(async () => {
              const result=await api.revokeInvitation(org,item.id);
              if(!result.revoked)throw new Error('Revocation not confirmed');
              setOutgoing(current=>current.map(row=>row.id===item.id?{...row,state:'revoked'}:row));setNotice('revoked');
            })}>{t.revoke}</button>
            <button className="secondary-btn" type="button" disabled={busy} onClick={() => void action(async () => {
              try {
                const result=await api.resendInvitation(org,item.id);
                if(result.state!=='sent')throw new Error('Resend not confirmed');
                setOutgoing(current=>current.map(row=>row.id===item.id?{...row,state:result.state,expiresAt:result.expiresAt}:row));
                setNotice('resent');
              } catch(error) {
                try {setOutgoing((await api.sentInvitations(org)).invitations);}catch{/* Keep the last known state. */}
                throw error;
              }
            },'resendUnconfirmed')}>{t.resend}</button>
          </div>}
        </article>)}
        <div className="admin-pagination"><span>{currentInvitationPage+1} / {invitationPages}</span><div><button type="button" className="secondary-btn" disabled={currentInvitationPage===0} onClick={()=>setInvitationPage(value=>Math.max(0,value-1))}>{lang==='en'?'Previous':'Назад'}</button><button type="button" className="secondary-btn" disabled={currentInvitationPage>=invitationPages-1} onClick={()=>setInvitationPage(value=>value+1)}>{lang==='en'?'Next':'Напред'}</button></div></div>
      </section>}
    {organisationAdmin&&<div id="approved-organisation-members">
      {admins.map(admin=><OrganisationMembers key={`members-${admin.organisationId}`} api={api} lang={lang} organisationId={admin.organisationId} onOrganisationServices={()=>document.getElementById('organisation-services')?.scrollIntoView({behavior:'smooth',block:'start'})}/>)}</div>}
    {organisationAdmin&&<div className="admin-service-decisions">{admins.map(admin=><ServiceRequestsAdmin key={`requests-${admin.organisationId}`} api={api} lang={lang} organisationId={admin.organisationId}/>)}</div>}
    {mode==='manage'&&(platform||organisationAdmin)&&<section className="card invitation-panel admin-manager-footer" aria-label={lang==='en'?'OpenRemote administration':'Администрация в OpenRemote'}>
      <div><span className="profile-kicker">OPENREMOTE · {lang==='en'?'READ ONLY':'САМО ЧЕТЕНЕ'}</span><h2>{lang==='en'?'OpenRemote Manager':'OpenRemote Manager'}</h2>
        <p>{lang==='en'?'View the Assets of your current organisation. Manage access through GrideX.':'Преглед на Assets в текущата организация. Управлението на достъпа е през GrideX.'}</p>
        <a className="profile-inline-help" href={`${documentationLink('members',lang).href}#openremote-manager`} target="_blank" rel="noopener noreferrer">{lang==='en'?'Manager access and read-only rights':'Достъп и права само за четене в Manager'} ↗</a>
        {managerError&&<p role="alert">{lang==='en'?'Manager access could not be verified. Retry after checking your session.':'Достъпът до Manager не можа да се потвърди. Проверете сесията и опитайте пак.'}</p>}</div>
      <button type="button" className="secondary-btn" disabled={busy} onClick={()=>void action(async()=>{setManagerError(false);try{const launch=await api.managerLaunch();window.location.assign(launch.url);}catch(error){setManagerError(true);throw error;}})}>{busy?t.busy:(lang==='en'?'Open OpenRemote Manager':'Отвори OpenRemote Manager')}</button>
    </section>}
  </div>;
}
