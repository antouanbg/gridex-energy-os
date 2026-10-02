"use client";
import { useEffect, useState } from 'react';
import { GridexApiError, type GridexApiClient, type GridexUser, type GridexSite, type GridexInvitation, type SentGridexInvitation } from '../lib/gridex-api';
import type { UiLanguage } from '../i18n/messages';
import { OrganisationInvitationAdmin } from './organisation-invitations';
import { OrganisationServiceMembers } from './organisation-service-members';
import { ServiceRequestsAdmin } from './service-requests-admin';
import { OrganisationMembers, PlatformOrganisationMembers } from './organisation-members';
import { documentationLink } from '../lib/documentation';

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

export function Invitations({ api, lang, mode = 'accept' }: { api: GridexApiClient; lang: UiLanguage; mode?: 'accept' | 'manage' }) {
  const t = copy[lang];
  const [me, setMe] = useState<GridexUser | null>(null);
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
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const user = await api.me(controller.signal);
        if (controller.signal.aborted) return;
        setMe(user);
        const admin = user.memberships?.find(m => m.role === 'administrator');
        setOrg(admin?.organisationId ?? '');
        if (user.permissions.includes('site:read')) setSites(await api.sites(controller.signal));
        const response = await api.invitations(controller.signal);
        if (!controller.signal.aborted) { setInvites(response.invitations); setAvailable(true); }
      } catch (error) {
        if (!controller.signal.aborted) setNotice(error instanceof GridexApiError && error.status === 503 ? 'unavailable' : 'failed');
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load();
    return () => controller.abort();
  }, [api]);
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
  const visibleSites = sites.filter(s => s.organisationId === org);
  return <div className="invitation-page" data-no-translate>
    {mode==='manage'&&<header className="invitation-hero card">
      <div><span className="profile-kicker">GRIDEX · {lang==='en'?'ACCESS CONTROL':'УПРАВЛЕНИЕ НА ДОСТЪПА'}</span>
        <h2>{t.manageTitle}</h2><p>{lang==='en'?'Invite the first administrator of a new organisation or manage access within yours. Rights are activated after verified sign-in.':'Поканете първия администратор на нова организация или управлявайте достъпа във Вашата. Правата се активират след потвърден вход.'}</p></div>
      <a className="profile-action" href={documentationLink('members',lang).href} target="_blank" rel="noopener noreferrer">{lang==='en'?'How invitations work':'Как работят поканите'} <span aria-hidden="true">↗</span></a>
    </header>}
    {mode==='manage'&&(me?.permissions.includes('platform:manage')||me?.memberships?.some(m=>m.role==='administrator'))&&
      <section className="card config-card invitation-panel" aria-label={lang==='en'?'OpenRemote administration':'Администрация в OpenRemote'}>
        <span className="profile-kicker">OPENREMOTE</span>
        <h2>{lang==='en'?'Organisation administration':'Администрация на организацията'}</h2>
        <p>{lang==='en'?'Open Manager for the organisation in your current signed-in session. The one-time link expires in one minute. Manager is read-only for people; changes are made through GrideX.':'Отворете Manager само за организацията от текущата Ви сесия. Еднократният линк изтича след една минута. За хората Manager е само за четене; промените се правят през GrideX.'}</p>
        {managerError&&<p role="alert">{lang==='en'?'Manager access could not be verified. Refresh your session and try again.':'Достъпът до Manager не можа да се потвърди. Обновете сесията и опитайте пак.'}</p>}
        <a className="profile-inline-help" href={`${documentationLink('members',lang).href}#openremote-manager`} target="_blank" rel="noopener noreferrer">{lang==='en'?'Manager access and read-only rights':'Достъп и права само за четене в Manager'} ↗</a>
        <button type="button" className="primary-btn" disabled={busy} onClick={()=>void action(async()=>{
          setManagerError(false);
          try {
            const launch=await api.managerLaunch();
            window.location.assign(launch.url);
          } catch(error) {setManagerError(true);throw error;}
        })}>{busy?t.busy:(lang==='en'?'Open OpenRemote Manager':'Отвори OpenRemote Manager')}</button>
      </section>}
    {mode==='manage'&&me?.permissions.includes('platform:manage')&&<OrganisationInvitationAdmin api={api} lang={lang}/>}
    {mode==='manage'&&me?.permissions.includes('platform:manage')&&<PlatformOrganisationMembers api={api} lang={lang}/>}
    {mode==='manage'&&admins.map(admin=><OrganisationMembers key={`members-${admin.organisationId}`} api={api} lang={lang} organisationId={admin.organisationId}/>)}
    {mode==='manage'&&me?.permissions.includes('platform:manage')&&<ServiceRequestsAdmin api={api} lang={lang}/>}
    {mode==='manage'&&admins.map(admin=><OrganisationServiceMembers key={admin.organisationId} api={api} lang={lang} organisationId={admin.organisationId}/>)}
    {mode==='manage'&&admins.map(admin=><ServiceRequestsAdmin key={`requests-${admin.organisationId}`} api={api} lang={lang} organisationId={admin.organisationId}/>)}
    {(mode==='accept'||admins.length>0||!me?.permissions.includes('platform:manage'))&&<section className="card config-card invitation-panel" aria-label={mode==='manage'?t.manageTitle:t.title}>
    <span className="profile-kicker">{mode==='manage'?(lang==='en'?'YOUR ORGANISATION':'ВАШАТА ОРГАНИЗАЦИЯ'):(lang==='en'?'PENDING ACCESS':'ЧАКАЩ ДОСТЪП')}</span>
    <h2>{mode==='manage'?t.invite:t.title}</h2>
    {loading && <p role="status">{t.loading}</p>}
    {notice && <p role={notice==='failed'||notice==='unavailable'||notice==='resendUnconfirmed'?'alert':'status'} aria-live="polite">{t[notice]}</p>}
    {!loading && <>
      {mode==='accept'&&<><h3>{t.pending}</h3>
      {!invites.length && <p>{t.empty}</p>}
      {invites.map(invite => <article key={invite.id}>
        <p>{t.org}: {invite.organisationId} · {roles.includes(invite.role as typeof roles[number]) ? t[invite.role as typeof roles[number]] : invite.role}</p>
        <p>{t.expiry}: {new Date(invite.expiresAt).toLocaleString(lang === 'bg' ? 'bg-BG' : 'en-GB')}</p>
        <p>{lang==='en'?'The portal completes a valid invitation after verified sign-in; no second acceptance is required. If access remains pending, contact your administrator.':'Порталът завършва валидната покана след потвърден вход; не е нужно второ приемане. Ако достъпът остава чакащ, свържете се с администратора.'}</p>
      </article>)}
      </>}
      {mode==='manage'&&(!admins.length ? !me?.permissions.includes('platform:manage') && <p>{t.noadmin}</p> : <form onSubmit={event => {
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
        <fieldset disabled={busy || !available} className="config-form">
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
      </form>)}
      {mode==='manage'&&admins.length>0&&<div className="invitation-history" aria-label={t.sentHistory}>
        <h3>{t.sentHistory}</h3>
        {outgoingError&&<p role="alert">{t.failed}</p>}
        {!outgoingError&&!outgoing.length&&<p>{t.noSent}</p>}
        {outgoing.map(item=><article className="invitation-record" key={item.id}>
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
      </div>}
    </>}
  </section>}
  </div>;
}
