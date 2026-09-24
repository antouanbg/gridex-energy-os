import { useEffect } from 'react';
import type { UiLanguage } from '../i18n/messages';
import { sectionHref } from '../lib/routes';

export function ProfileHelp({lang,live}:{lang:UiLanguage;live:boolean}) {
  const t=(bg:string,en:string)=>lang==='en'?en:bg;
  useEffect(()=>{
    const id=decodeURIComponent(window.location.hash.slice(1));
    if(!id)return;
    const frame=requestAnimationFrame(()=>document.getElementById(id)?.scrollIntoView({block:'start'}));
    return()=>cancelAnimationFrame(frame);
  },[]);
  return <div className="profile-help-page" data-no-translate>
    <section className="card profile-help-intro">
      <div><span className="profile-kicker">GRIDEX · {t('ПОМОЩ','HELP')}</span><h2>{t('Ръководство за профила','Profile guide')}</h2><p>{t('Тук е обяснено какво виждате в профила и как работят настройките му. Това е първата част от документацията; описанията на останалите менюта предстоят.','This explains the fields and settings in your profile. It is the first part of the documentation; guides for the other menu sections are planned.')}</p></div>
      <a className="profile-action primary" href={sectionHref('profile','',!live)}>{t('Към моя профил','Open my profile')} <span aria-hidden="true">↗</span></a>
    </section>
    <nav className="profile-help-index card" aria-label={t('Раздели на документацията','Guide sections')}>
      <a href="#identity">{t('Идентичност','Identity')}</a><a href="#access">{t('Роля и достъп','Role and access')}</a><a href="#email-notifications">{t('Имейл известия','Email notifications')}</a><a href="#session">{t('Сесия и изход','Session and sign-out')}</a>
    </nav>
    <div className="profile-help-grid">
      <article id="identity" className="card profile-help-topic"><span>01 / {t('ПРОФИЛ','PROFILE')}</span><h3>{t('Име и имейл','Name and email')}</h3><p>{t('Показват се данните от удостоверения Ви GrideX/Keycloak профил. Не въвеждате парола на тази страница. Имейлът за известия се взема само от потвърдената идентичност.','These values come from your authenticated GrideX/Keycloak account. You do not enter a password here. Notification email is taken only from a verified identity.')}</p></article>
      <article id="access" className="card profile-help-topic"><span>02 / {t('ДОСТЪП','ACCESS')}</span><h3>{t('Роля и обекти','Role and Sites')}</h3><p>{t('Ролята описва предоставените Ви права. „Моите обекти“ показва обектите, до които имате достъп; тя не е настройка за получаване на известия. Правата за конкретен обект се проверяват от backend и OpenRemote преди изпращане на имейл.','Your role describes your permissions. “My Sites” shows the Sites you can access; it is not a notification setting. Site access is checked by the backend and OpenRemote before an email is sent.')}</p></article>
      <article id="email-notifications" className="card profile-help-topic"><span>03 / {t('ИЗВЕСТИЯ','NOTIFICATIONS')}</span><h3>{t('Какво прави отметката','What the checkbox does')}</h3><p>{t('„Получавай имейл за всички бъдещи събития“ е Ваш постоянен избор, изключен по подразбиране. Включването не изпраща писма за минали събития и не изисква одобрение за всяко следващо. Засега е свързано единствено прекъсването на heartbeat: един имейл за прекъсване, нов само след възстановяване и ново прекъсване. Следващите видове събития ще използват същия избор, след като бъдат внедрени.','“Email me about all future events” is your persistent preference, off by default. Enabling it does not send messages for past events or require approval for each future event. Currently only missed heartbeat is connected: one email per outage, and another only after recovery and a new outage. Future event types will use the same choice once implemented.')}</p></article>
      <article id="session" className="card profile-help-topic"><span>04 / {t('СИГУРНОСТ','SECURITY')}</span><h3>{t('Сесия и изход','Session and sign-out')}</h3><p>{t('Докато сте влезли, порталът използва активната Ви сесия. „Изход“ я прекратява в този браузър. Ако достъпът изтече или бъде отнет, ще е нужен нов вход; това не променя съхраненото Ви предпочитание за имейл.','While signed in, the portal uses your active session. “Sign out” ends it in this browser. If access expires or is revoked, you must sign in again; this does not change your saved email preference.')}</p></article>
    </div>
    <section className="card profile-help-roadmap"><strong>{t('Какво следва в документацията','Documentation roadmap')}</strong><p>{t('За всяко меню ще добавим предназначение, източник на данните, нужни права, значение на настройките и състоянията при липса на данни или връзка. Неподготвените раздели няма да се представят като готово ръководство.','Each menu section will get its purpose, data source, required permissions, setting definitions, and empty/offline states. Unwritten sections will not be presented as completed guidance.')}</p></section>
  </div>;
}
