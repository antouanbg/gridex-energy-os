"use client";
import { useEffect, useState, type FormEvent } from 'react';
import { GridexApiError, type CreatedOrganisationInvitation, type GridexApiClient } from '../lib/gridex-api';
import type { UiLanguage } from '../i18n/messages';

import { OrganisationAccessAdmin } from './organisation-access';

const copy = {
  bg: {
    heading: 'Нова организация', description: 'Всяка организация получава собствен OpenRemote realm. Поканата е за първия ѝ администратор.',
    name: 'Име на организацията', realm: 'Кратък код (realm)', email: 'Имейл на първия администратор',
    send: 'Изпрати покана', sending: 'Изпращане…', disabled: 'Поканите за нови организации още не са активирани на сървъра.',
    recent: 'За тази промяна е нужен нов вход. Влезте отново и опитайте пак.',
    failed: 'Не е потвърдено успешно изпращане. Не повтаряйте с друг код; проверете състоянието.',
    sent: 'Заявката за имейл е приета. Организацията и правата ще се активират след потвърждаване на имейла, задаване на парола, вход и проверка от сървъра.',
    existing: 'Последни покани', revoke: 'Отмени', revoked: 'Поканата е отменена.', empty: 'Няма изпратени покани.',
    resend: 'Изпрати поканата наново', resent: 'Изпратен е нов линк към същия администратор. Срокът е подновен за 24 часа.',
    resendUnconfirmed: 'Изпращането не е потвърдено. Проверете състоянието, преди нов опит.',
    expires: 'Валидна до', state: 'Състояние',
  },
  en: {
    heading: 'New organisation', description: 'Each organisation receives its own OpenRemote realm. This invitation is for its first administrator.',
    name: 'Organisation name', realm: 'Short code (realm)', email: 'First administrator email',
    send: 'Send invitation', sending: 'Sending…', disabled: 'New-organisation invitations are not enabled on the server yet.',
    recent: 'This change requires a fresh sign-in. Sign in again and retry.',
    failed: 'Email delivery was not confirmed. Do not retry with another code; inspect the state.',
    sent: 'The email request was accepted. Organisation access activates after email verification, password setup, sign-in and server checks.',
    existing: 'Recent invitations', revoke: 'Revoke', revoked: 'Invitation revoked.', empty: 'No invitations sent.',
    resend: 'Resend invitation', resent: 'A new link was sent to the same administrator. The invitation is valid for another 24 hours.',
    resendUnconfirmed: 'Sending was not confirmed. Check the invitation status before retrying.',
    expires: 'Expires', state: 'State',
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
  return <section className="card config-card invitation-panel invitation-platform" data-no-translate aria-label={t.heading}>
    <div className="invitation-panel-head"><div><span className="profile-kicker">{lang==='en'?'PLATFORM ADMINISTRATION':'АДМИНИСТРАЦИЯ НА ПЛАТФОРМАТА'}</span><h2>{t.heading}</h2><p>{t.description}</p></div><span className="invitation-panel-mark" aria-hidden="true">↗</span></div>
    <div className="invitation-steps" aria-label={lang==='en'?'Invitation steps':'Стъпки на поканата'}><span><b>01</b>{lang==='en'?'Enter organisation':'Въведете организация'}</span><span><b>02</b>{lang==='en'?'Send invitation':'Изпратете покана'}</span><span><b>03</b>{lang==='en'?'Administrator signs in':'Администраторът влиза'}</span></div>
    {!enabled && <p className="invitation-status" role="status">{t.disabled}</p>}
    {notice && <p className="invitation-status" role="status">{notice}</p>}
    <form onSubmit={submit} className="invitation-form">
      <fieldset disabled={!enabled || busy}>
        <label>{t.name}<input required minLength={3} maxLength={120} autoComplete="organization" value={name} onChange={event => setName(event.target.value)}/></label>
        <label>{t.realm}<input required minLength={3} maxLength={31} pattern="[a-z][a-z0-9-]{2,30}" value={realm} onChange={event => setRealm(event.target.value.toLowerCase())}/><small>{lang==='en'?'Lowercase letters, numbers and hyphens; cannot be changed after invitation.':'Малки латински букви, цифри и тирета; не се променя след поканата.'}</small></label>
        <label>{t.email}<input required type="email" autoComplete="email" maxLength={254} value={email} onChange={event => setEmail(event.target.value)}/></label>
        <button type="submit" className="primary-btn">{busy ? t.sending : t.send}</button>
      </fieldset>
    </form>
    <OrganisationAccessAdmin api={api} lang={lang}/>
    <div className="invitation-history"><h3>{t.existing}</h3><span>{lang==='en'?'No access is granted before verified sign-in and backend confirmation.':'Няма достъп преди потвърден вход и проверка от сървъра.'}</span></div>
    {enabled && !items.length && <p>{t.empty}</p>}
    {items.map(item => <article className="invitation-record" key={item.id}>
      <strong>{item.name}</strong> · {item.realm} · {item.email}
      <p>{t.state}: {item.state} · {t.expires}: {new Date(item.expiresAt).toLocaleString(lang === 'bg' ? 'bg-BG' : 'en-GB')}</p>
      <div className="invitation-record-actions">
      {['reserved','realm_ready','identity_ready','sent','delivery_failed','provisioning_failed'].includes(item.state)
        && <button type="button" className="secondary-btn" disabled={busy} onClick={() => {
          setBusy(true); setNotice('');
          void api.revokeOrganisationInvitation(item.id).then(() => {
            setItems(current => current.map(row => row.id === item.id ? { ...row, state: 'revoked' } : row));
            setNotice(t.revoked);
          }).catch(() => setNotice(t.failed)).finally(() => setBusy(false));
        }}>{t.revoke}</button>}
      {item.state === 'sent' && <button type="button" className="secondary-btn" disabled={busy} onClick={() => {
        setBusy(true); setNotice('');
        void api.resendOrganisationInvitation(item.id).then(result => {
          setItems(current => current.map(row => row.id === item.id ? { ...row, state: result.state, expiresAt: result.expiresAt } : row));
          setNotice(t.resent);
        }).catch(async error => {
          setNotice(error instanceof GridexApiError && error.status === 401 ? t.recent : t.resendUnconfirmed);
          try { setItems((await api.organisationInvitations()).invitations); } catch { /* Keep the last known state. */ }
        }).finally(() => setBusy(false));
      }}>{t.resend}</button>}
      </div>
    </article>)}
  </section>;
}
