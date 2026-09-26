"use client";
import { useEffect, useState } from 'react';
import { GridexApiError, type GridexApiClient, type GridexUser, type GridexSite, type GridexInvitation } from '../lib/gridex-api';
import type { UiLanguage } from '../i18n/messages';
import { OrganisationInvitationAdmin, OrganisationInvitationAcceptance } from './organisation-invitations';

const copy = {
  en: { title: 'Organisation access', manageTitle: 'Users & invitations', loading: 'Loading access…', unavailable: 'Email invitations are not enabled yet. Mailgun and identity setup must be completed.',
    failed: 'The request failed. Refresh and try again; do not assume an email was sent.', empty: 'No pending invitations. Registration alone does not grant access to sites.',
    invite: 'Invite by email', email: 'Work email', org: 'Organisation', role: 'Role', sites: 'Permitted sites', send: 'Send invitation', accept: 'Accept invitation',
    accepted: 'Invitation accepted. Reload to load your sites.', reload: 'Reload portal', sent: 'Email dispatch confirmed. Membership starts only after acceptance.',
    revoke: 'Revoke invitation', revoked: 'Invitation revoked.', pending: 'Your invitations', expiry: 'Expires', busy: 'Working…',
    noadmin: 'Only an organisation administrator can invite members.', noSites: 'No sites yet. You may invite a member without site access; grant access explicitly when sites are created.',
    viewer: 'Viewer — read only', operator: 'Operator — operational actions', energy_manager: 'Energy manager — strategies and configuration', integrator: 'Integrator — device configuration' },
  bg: { title: 'Достъп до организации', manageTitle: 'Потребители и покани', loading: 'Зареждане на правата…', unavailable: 'Поканите по имейл още не са включени. Нужни са Mailgun и настройки за идентификация.',
    failed: 'Заявката е неуспешна. Обновете и опитайте пак; не приемайте, че имейлът е изпратен.', empty: 'Няма чакащи покани. Самата регистрация не дава достъп до обекти.',
    invite: 'Покана по имейл', email: 'Служебен имейл', org: 'Организация', role: 'Роля', sites: 'Разрешени обекти', send: 'Изпрати покана', accept: 'Приеми покана',
    accepted: 'Поканата е приета. Презаредете, за да заредите обектите.', reload: 'Презареди портала', sent: 'Изпращането е потвърдено. Членството започва само след приемане.',
    revoke: 'Отмени поканата', revoked: 'Поканата е отменена.', pending: 'Вашите покани', expiry: 'Валидна до', busy: 'Обработка…',
    noadmin: 'Само администратор на организация може да кани членове.', noSites: 'Още няма обекти. Може да поканите човек без достъп до обекти; дайте му права изрично, когато създадете обект.',
    viewer: 'Наблюдател — само четене', operator: 'Оператор — оперативни действия', energy_manager: 'Енергиен мениджър — стратегии и конфигурация', integrator: 'Интегратор — настройки на устройства' },
};
const roles = ['viewer', 'operator', 'energy_manager', 'integrator'] as const;

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
  const [role, setRole] = useState<string>('viewer');
  const [selected, setSelected] = useState<string[]>([]);
  const [sent, setSent] = useState<{ id: string; org: string } | null>(null);
  const [accepted, setAccepted] = useState(false);
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
  async function action(work: () => Promise<void>) {
    if (busy) return;
    setBusy(true); setNotice(null);
    try { await work(); } catch (error) {
      setNotice(error instanceof GridexApiError && error.status === 503 ? 'unavailable' : 'failed');
    } finally { setBusy(false); }
  }
  const admins = me?.memberships?.filter(m => m.role === 'administrator') ?? [];
  const visibleSites = sites.filter(s => s.organisationId === org);
  return <><section className="card config-card" data-no-translate aria-label={mode==='manage'?t.manageTitle:t.title}>
    <h2>{mode==='manage'?t.manageTitle:t.title}</h2>
    {loading && <p role="status">{t.loading}</p>}
    {notice && <p role="status">{t[notice]}</p>}
    {!loading && <>
      {mode==='accept'&&<><h3>{t.pending}</h3>
      {!invites.length && <p>{t.empty}</p>}
      {invites.map(invite => <article key={invite.id}>
        <p>{t.org}: {invite.organisationId} · {roles.includes(invite.role as typeof roles[number]) ? t[invite.role as typeof roles[number]] : invite.role}</p>
        <p>{t.expiry}: {new Date(invite.expiresAt).toLocaleString(lang === 'bg' ? 'bg-BG' : 'en-GB')}</p>
        <button type="button" className="primary-btn" disabled={busy || !available} onClick={() => void action(async () => {
          const result = await api.acceptInvitation(invite.id);
          if (!result.accepted) throw new Error('Acceptance not confirmed');
          setInvites(items => items.filter(i => i.id !== invite.id)); setNotice('accepted'); setAccepted(true);
        })}>{busy ? t.busy : t.accept}</button>
      </article>)}
      {accepted && <button type="button" className="secondary-btn" onClick={() => window.location.reload()}>{t.reload}</button>}</>}
      {mode==='manage'&&(!admins.length ? !me?.permissions.includes('platform:manage') && <p>{t.noadmin}</p> : <form onSubmit={event => {
        event.preventDefault();
        if (!available || !org) return;
        void action(async () => {
          const result = await api.invite(org, { email, role, siteIds: selected });
          if (result.state !== 'sent') throw new Error('Dispatch not confirmed');
          setSent({ id: result.id, org }); setNotice('sent'); setEmail(''); setSelected([]);
        });
      }}>
        <h3>{t.invite}</h3>
        <fieldset disabled={busy || !available} className="config-form">
          <label>{t.org}<select value={org} onChange={event => { setOrg(event.target.value); setSelected([]); }}>
            {admins.map(m => <option key={m.organisationId} value={m.organisationId}>{m.organisationId}</option>)}
          </select></label>
          <label>{t.email}<input type="email" autoComplete="email" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)}/></label>
          <label>{t.role}<select value={role} onChange={event => setRole(event.target.value)}>{roles.map(r => <option key={r} value={r}>{t[r]}</option>)}</select></label>
          <fieldset><legend>{t.sites}</legend>
            {!visibleSites.length && <p>{t.noSites}</p>}
            {visibleSites.map(site => <label key={site.id}><input type="checkbox" checked={selected.includes(site.id)} onChange={event => setSelected(ids => event.target.checked ? [...ids, site.id] : ids.filter(id => id !== site.id))}/>{site.name}</label>)}
          </fieldset>
          <button className="primary-btn" type="submit" disabled={!org}>{busy ? t.busy : t.send}</button>
        </fieldset>
      </form>)}
      {sent && <button className="secondary-btn" type="button" disabled={busy} onClick={() => void action(async () => {
        const result = await api.revokeInvitation(sent.org, sent.id);
        if (!result.revoked) throw new Error('Revocation not confirmed');
        setSent(null); setNotice('revoked');
      })}>{t.revoke}</button>}
    </>}
  </section>
    {mode==='manage'&&me?.permissions.includes('platform:manage')&&<OrganisationInvitationAdmin api={api} lang={lang}/>}
    {mode==='accept'&&<OrganisationInvitationAcceptance api={api} lang={lang}/>}
  </>;
}
