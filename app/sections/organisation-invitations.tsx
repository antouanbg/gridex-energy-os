"use client";
import { useEffect, useState, type FormEvent } from 'react';
import { GridexApiError, type CreatedOrganisationInvitation, type GridexApiClient,
  type OrganisationOnboardingInvitation } from '../lib/gridex-api';
import type { UiLanguage } from '../i18n/messages';

const copy = {
  bg: {
    heading: 'Нова организация', description: 'Всяка организация получава собствен OpenRemote realm. Поканата е за първия ѝ администратор.',
    name: 'Име на организацията', realm: 'Кратък код (realm)', email: 'Имейл на първия администратор',
    send: 'Изпрати покана', sending: 'Изпращане…', disabled: 'Поканите за нови организации още не са активирани на сървъра.',
    recent: 'За тази промяна е нужен нов вход. Влезте отново и опитайте пак.',
    failed: 'Не е потвърдено успешно изпращане. Не повтаряйте с друг код; проверете състоянието.',
    sent: 'Заявката за имейл е приета. Организацията и правата ще се активират едва след приемане и проверки.',
    existing: 'Последни покани', revoke: 'Отмени', revoked: 'Поканата е отменена.', empty: 'Няма изпратени покани.',
    acceptance: 'Покана за администратор на организация', accept: 'Приеми поканата',
    accepted: 'Организацията е активирана. Обновете екрана за новите права.',
    expires: 'Валидна до', state: 'Състояние', reload: 'Обнови',
  },
  en: {
    heading: 'New organisation', description: 'Each organisation receives its own OpenRemote realm. This invitation is for its first administrator.',
    name: 'Organisation name', realm: 'Short code (realm)', email: 'First administrator email',
    send: 'Send invitation', sending: 'Sending…', disabled: 'New-organisation invitations are not enabled on the server yet.',
    recent: 'This change requires a fresh sign-in. Sign in again and retry.',
    failed: 'Email delivery was not confirmed. Do not retry with another code; inspect the state.',
    sent: 'The email request was accepted. The organisation and rights activate only after acceptance and verification.',
    existing: 'Recent invitations', revoke: 'Revoke', revoked: 'Invitation revoked.', empty: 'No invitations sent.',
    acceptance: 'Organisation administrator invitation', accept: 'Accept invitation',
    accepted: 'The organisation is active. Reload to see the new access.',
    expires: 'Expires', state: 'State', reload: 'Reload',
  },
};

export function OrganisationInvitationAdmin({ api, lang }: { api: GridexApiClient; lang: UiLanguage }) {
  const t = copy[lang];
  const [enabled, setEnabled] = useState(false);
  const [items, setItems] = useState<CreatedOrganisationInvitation[]>([]);
  const [name, setName] = useState('');
  const [realm, setRealm] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    void api.organisationInvitations(controller.signal).then(result => {
      if (!controller.signal.aborted) { setEnabled(result.enabled); setItems(result.invitations); }
    }).catch(() => { if (!controller.signal.aborted) setNotice(t.failed); });
    return () => controller.abort();
  }, [api, t.failed]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !enabled) return;
    setBusy(true); setNotice('');
    try {
      const result = await api.inviteOrganisation({ name, realm, email });
      if (result.state !== 'sent') throw new Error('Delivery not confirmed');
      setNotice(t.sent); setName(''); setRealm(''); setEmail('');
      const updated = await api.organisationInvitations(); setItems(updated.invitations);
    } catch (error) {
      setNotice(error instanceof GridexApiError && error.status === 401 ? t.recent : t.failed);
      try { setItems((await api.organisationInvitations()).invitations); } catch { /* The previous state remains visible. */ }
    } finally { setBusy(false); }
  }
  return <section className="card config-card" data-no-translate aria-label={t.heading}>
    <h3>{t.heading}</h3><p>{t.description}</p>
    {!enabled && <p role="status">{t.disabled}</p>}
    {notice && <p role="status">{notice}</p>}
    <form onSubmit={submit} className="config-form">
      <fieldset disabled={!enabled || busy}>
        <label>{t.name}<input required minLength={3} maxLength={120} value={name} onChange={event => setName(event.target.value)}/></label>
        <label>{t.realm}<input required minLength={3} maxLength={31} pattern="[a-z][a-z0-9-]{2,30}" value={realm} onChange={event => setRealm(event.target.value.toLowerCase())}/></label>
        <label>{t.email}<input required type="email" maxLength={254} value={email} onChange={event => setEmail(event.target.value)}/></label>
        <button type="submit" className="primary-btn">{busy ? t.sending : t.send}</button>
      </fieldset>
    </form>
    <h4>{t.existing}</h4>
    {enabled && !items.length && <p>{t.empty}</p>}
    {items.map(item => <article key={item.id}>
      <strong>{item.name}</strong> · {item.realm} · {item.email}
      <p>{t.state}: {item.state} · {t.expires}: {new Date(item.expiresAt).toLocaleString(lang === 'bg' ? 'bg-BG' : 'en-GB')}</p>
      {['reserved','realm_ready','identity_ready','sent','delivery_failed','provisioning_failed'].includes(item.state)
        && <button type="button" className="secondary-btn" disabled={busy} onClick={() => {
          setBusy(true); setNotice('');
          void api.revokeOrganisationInvitation(item.id).then(() => {
            setItems(current => current.map(row => row.id === item.id ? { ...row, state: 'revoked' } : row));
            setNotice(t.revoked);
          }).catch(() => setNotice(t.failed)).finally(() => setBusy(false));
        }}>{t.revoke}</button>}
    </article>)}
  </section>;
}

export function OrganisationInvitationAcceptance({ api, lang }: { api: GridexApiClient; lang: UiLanguage }) {
  const t = copy[lang];
  const [items, setItems] = useState<OrganisationOnboardingInvitation[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    void api.myOrganisationOnboarding(controller.signal).then(result => {
      if (!controller.signal.aborted) setItems(result.invitations);
    }).catch(error => {
      if (!controller.signal.aborted && !(error instanceof GridexApiError && [404,503].includes(error.status)))
        setNotice(t.failed);
    });
    return () => controller.abort();
  }, [api, t.failed]);
  if (!items.length && !notice) return null;
  return <section className="card config-card" data-no-translate aria-label={t.acceptance}>
    <h3>{t.acceptance}</h3>{notice && <p role="status">{notice}</p>}
    {items.map(item => <article key={item.id}>
      <strong>{item.name}</strong> · {item.realm}
      <p>{t.expires}: {new Date(item.expiresAt).toLocaleString(lang === 'bg' ? 'bg-BG' : 'en-GB')}</p>
      <button type="button" className="primary-btn" disabled={busy} onClick={() => {
        setBusy(true); setNotice('');
        void api.acceptOrganisationOnboarding(item.id).then(result => {
          if (!result.accepted) throw new Error('Acceptance unconfirmed');
          setItems(current => current.filter(row => row.id !== item.id)); setNotice(t.accepted);
        }).catch(() => setNotice(t.failed)).finally(() => setBusy(false));
      }}>{t.accept}</button>
    </article>)}
    {notice === t.accepted && <button type="button" className="secondary-btn" onClick={() => window.location.reload()}>{t.reload}</button>}
  </section>;
}
