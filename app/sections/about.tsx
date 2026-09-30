"use client";

import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { UiLanguage } from "../i18n/messages";
import { GridexApiError, type ContactChallenge, type GridexApiClient } from '../lib/gridex-api';

type FormIssue = 'name'|'email'|'topic'|'message'|'answer'|'challenge'|'auth'|'rate'|'delivery'|'network';

export function About({lang,notify,api,live,email}:{lang:UiLanguage;notify:(v:string)=>void;api:GridexApiClient;live:boolean;email?:string}) {
  const t=(bg:string,en:string)=>lang==="en"?en:bg;
  const [challenge,setChallenge]=useState<ContactChallenge|null>(null);
  const [challengeError,setChallengeError]=useState(false);
  const [name,setName]=useState('');
  const [editedReply,setEditedReply]=useState<{account:string;value:string}|null>(null);
  const accountEmail=live?(email||''):'';
  const senderEmail=editedReply?.account===accountEmail?editedReply.value:accountEmail;
  const [slide,setSlide]=useState(0);
  const gallery=useRef<HTMLDivElement>(null);
  const [topic,setTopic]=useState('');
  const [message,setMessage]=useState('');
  const [answer,setAnswer]=useState('');
  const [website,setWebsite]=useState('');
  const [busy,setBusy]=useState(false);
  const [result,setResult]=useState<'queued'|'error'|null>(null);
  const [issue,setIssue]=useState<FormIssue|null>(null);
  const issueCopy:Record<FormIssue,string>={
    name:t('Въведете име с поне 2 знака.','Enter a name of at least 2 characters.'),
    email:t('Въведете валиден имейл за отговор.','Enter a valid reply email address.'),
    topic:t('Въведете тема с поне 3 знака.','Enter a topic of at least 3 characters.'),
    message:t('Опишете запитването с поне 20 знака.','Describe your enquiry in at least 20 characters.'),
    answer:t('Проверете отговора на задачата за човек.','Check the answer to the human-check question.'),
    challenge:t('Проверката още не е готова. Ако не се появи, натиснете „Опитай отново“.','The human check is not ready. If it does not appear, choose Retry.'),
    auth:t('Не можахме да потвърдим сесията. Влезте отново през портала.','We could not verify your session. Sign in again through the portal.'),
    rate:t('Заявката е ограничена временно. Изчакайте няколко минути, без да изпращате повторно.','This request is temporarily rate-limited. Wait a few minutes without resubmitting.'),
    delivery:t('Резултатът от изпращането е неясен. Проверете пощата за поддръжка, преди да опитате отново.','Delivery status is uncertain. Check with support before trying again.'),
    network:t('Не успяхме да се свържем с API. Запазете текста и опитайте отново по-късно.','We could not reach the API. Keep your text and try again later.'),
  };
  useEffect(()=>{let current=true;api.contactChallenge().then(value=>{if(current){setChallenge(value);setChallengeError(false);}}).catch(()=>{if(current)setChallengeError(true);});return()=>{current=false;};},[api]);
  const refreshChallenge=async()=>{
    setChallenge(null);setAnswer('');setChallengeError(false);setIssue(null);
    try{setChallenge(await api.contactChallenge());}catch{setChallengeError(true);}
  };
  const send=async(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();
    if(busy)return;
    setResult(null);setIssue(null);
    let invalid:FormIssue|null=null;
    if(name.trim().length<2)invalid='name';
    else if(!/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(senderEmail.trim()))invalid='email';
    else if(topic.trim().length<3)invalid='topic';
    else if(message.trim().length<20)invalid='message';
    else if(!challenge)invalid='challenge';
    else if(!answer.trim()||Number(answer)!==challenge.left+challenge.right)invalid='answer';
    if(invalid){setIssue(invalid);setResult('error');return;}
    setBusy(true);
    try{
      await api.submitContactEnquiry({name,email:live?(email||''):senderEmail,replyEmail:senderEmail,topic,message,
        challengeId:challenge!.id,answer:Number(answer),website},live);
      setResult('queued');setMessage('');setTopic('');
    }catch(error){
      setIssue(error instanceof GridexApiError?
        error.status===401||error.code==='email_unverified'?'auth':
        error.status===429?'rate':
        error.code==='contact_delivery_unknown'?'delivery':
        error.code==='contact_challenge_invalid'?'challenge':'network':'network');
      setResult('error');
    }
    finally{setBusy(false);void refreshChallenge();}
  };
  const showForm=(subject:string)=>{setTopic(subject);document.getElementById('contact-enquiry')?.scrollIntoView({behavior:'smooth',block:'start'});};
  const chooseSlide=(index:number)=>{
    const target=(index+2)%2;
    gallery.current?.scrollTo({left:target*gallery.current.clientWidth,behavior:'smooth'});
    setSlide(target);
  };
  return <div className="about-page about-clean" data-no-translate>
    <section className="card suntech-advert">
      <img className="suntech-banner" src="/suntech-banner.jpg" alt="Suntech — Stand the Test of Time"/>
      <div className="suntech-advert-body">
        <div className="suntech-advert-copy">
          <img className="suntech-logo" src="/suntech-logo.jpg" alt="Suntech"/>
          <p>SUNSTORAGE PRO SERIES</p>
          <h2>SunStorage Pro 261</h2>
          <span>{t("Индустриална BESS система от 261 kWh клас с готова интеграция към GrideX Energy OS.","A 261 kWh-class industrial BESS with ready integration to GrideX Energy OS.")}</span>
          <div className="suntech-offer-points">
            <strong><i>261</i><small>kWh BESS</small></strong>
            <strong><i>∞</i><small>{t("GrideX лиценз","GrideX licence")}</small></strong>
            <strong><i>✓</i><small>{t("Безплатен електропроект","Complimentary electrical design")}</small></strong>
          </div>
          <div className="suntech-advert-actions"><button onClick={()=>showForm(t('Оферта за SunStorage Pro 261','Offer for SunStorage Pro 261'))}>{t("Поискай оферта","Request an offer")}</button><button onClick={()=>notify(t("Техническата конфигурация е отворена","The technical configuration is open"))}>{t("Техническа конфигурация","Technical configuration")}</button></div>
        </div>
        <div className="suntech-gallery" role="region" aria-roledescription="carousel" aria-label={t('Снимки на SunStorage PRO STE-261L-125P','SunStorage PRO STE-261L-125P images')}>
          <div className="suntech-gallery-track" ref={gallery} onScroll={event=>setSlide(Math.round(event.currentTarget.scrollLeft/event.currentTarget.clientWidth))}>
            <figure className="suntech-gallery-slide"><img src="/suntech-ste261-official.webp" alt={t('Официално изображение на батерийния шкаф Suntech STE-261L-125P','Official image of the Suntech STE-261L-125P battery cabinet')}/><figcaption>{t('Общ изглед на шкафа','Cabinet overview')}</figcaption></figure>
            <figure className="suntech-gallery-slide suntech-gallery-detail"><img src="/suntech-ste261-detail.webp" alt={t('Детайл от предния панел на Suntech STE-261L-125P','Front-panel detail of the Suntech STE-261L-125P')}/><figcaption>{t('Детайл на предния панел','Front-panel detail')}</figcaption></figure>
          </div>
          <div className="suntech-gallery-controls"><button type="button" onClick={()=>chooseSlide(slide-1)} aria-label={t('Предишна снимка','Previous image')}>‹</button><span aria-live="polite">{slide+1} / 2</span><button type="button" onClick={()=>chooseSlide(slide+1)} aria-label={t('Следваща снимка','Next image')}>›</button></div>
          <a className="suntech-gallery-source" href="https://www.suntech-power.com/products/storage/sunstorage-pro-ste-261l-125p/" target="_blank" rel="noreferrer">{t('Официална продуктова страница на Suntech ↗','Official Suntech product page ↗')}</a>
        </div>
      </div>
    </section>

    <section id="contact-enquiry" className="card config-card" aria-labelledby="contact-heading">
      <p className="eyebrow">{t('ВРЪЗКА С ЕКИПА','CONTACT THE TEAM')}</p>
      <h2 id="contact-heading">{live?t('Изпрати запитване','Send an enquiry'):t('Запитване от демото','Enquiry from the demo')}</h2>
      <p>{t('Опишете темата и въпроса си. Ще изпратим съобщението до екипа за поддръжка след проверката срещу автоматични заявки.','Describe your topic and question. We will send the message to support after the anti-bot check.')}</p>
      <form className="config-form" onSubmit={send} noValidate>
        <label><span>{t('Име','Name')}</span><input required minLength={2} maxLength={100} autoComplete="name" value={name} onChange={event=>setName(event.target.value)}/></label>
        <label><span>{t('Имейл за отговор','Reply email')}</span><input required type="email" maxLength={254} autoComplete="email" value={senderEmail} onChange={event=>setEditedReply({account:accountEmail,value:event.target.value})}/>{live&&<small>{t('Предварително е попълнен имейлът от профила. Можете да зададете друг адрес за отговор; профилната Ви самоличност остава записана отделно.','Your account email is filled in. You can enter a different reply address; your verified account identity is recorded separately.')}</small>}</label>
        <label><span>{t('Тема','Topic')}</span><input required minLength={3} maxLength={120} value={topic} onChange={event=>setTopic(event.target.value)}/></label>
        <label><span>{challenge?t(`Проверка: колко е ${challenge.left} + ${challenge.right}?`,`Human check: what is ${challenge.left} + ${challenge.right}?`):challengeError?t('Проверката не се зареди.','The human check could not load.'):t('Зареждане на проверката…','Loading human check…')}</span><input required type="number" inputMode="numeric" value={answer} onChange={event=>setAnswer(event.target.value)} disabled={!challenge}/>{challengeError&&<button className="secondary-btn" type="button" onClick={()=>void refreshChallenge()}>{t('Опитай проверката отново','Retry human check')}</button>}</label>
        <label style={{gridColumn:'1/-1'}}><span>{t('Вашето запитване','Your enquiry')}</span><textarea required minLength={20} maxLength={5000} rows={5} value={message} onChange={event=>setMessage(event.target.value)} style={{width:'100%',border:'1px solid #d5e0d8',borderRadius:9,padding:12,font:'inherit',resize:'vertical'}}/></label>
        <label aria-hidden="true" style={{position:'absolute',left:'-10000px'}}><span>Website</span><input tabIndex={-1} autoComplete="off" value={website} onChange={event=>setWebsite(event.target.value)}/></label>
        <div style={{gridColumn:'1/-1'}}><button className="primary-btn" type="submit" disabled={busy}>{busy?t('Изпращане…','Sending…'):t('Изпрати запитване','Send enquiry')}</button></div>
      </form>
      {result==='queued'&&<p role="status">{t('Запитването е прието за изпращане. Това не е потвърждение за доставка в пощата.','Your enquiry was accepted for sending. This is not confirmation of mailbox delivery.')}</p>}
      {result==='error'&&<p role="alert">{issue?issueCopy[issue]:issueCopy.network}</p>}
    </section>

    <section className="card github-project-card">
      <div className="github-project-mark">&lt;/&gt;</div>
      <div className="github-project-copy"><p>OPEN SOURCE · MIT LICENSE</p><h2>GrideX Energy OS</h2><span>{t("Публичен open-source EMS проект, създаден от Antouan. Кодът и техническата архитектура са достъпни в GitHub за преглед, развитие и нови интеграции.","A public open-source EMS project created by Antouan. The code and technical architecture are available on GitHub for review, development and new integrations.")}</span></div>
      <div className="github-project-points"><span>✓ {t("Публичен изходен код","Public source code")}</span><span>✓ OpenRemote + GrideX Edge</span><span>✓ {t("Един ценови модел по публикация и GitHub код на Антуан Ангелов","One price-forecast model based on Antuan Angelov’s publication and GitHub code")}</span></div>
      <div className="github-project-actions"><a href="https://github.com/antouanbg/gridex-energy-os" target="_blank" rel="noreferrer">GitHub repository ↗</a><a href="https://github.com/antouanbg/Compiled-IBEX-Day-Ahead-Price-Dataset" target="_blank" rel="noreferrer">{t("Модел и код за IBEX прогноза ↗","IBEX forecast model & code ↗")}</a><a href="https://github.com/antouanbg/gridex-energy-os/blob/main/LICENSE" target="_blank" rel="noreferrer">MIT License ↗</a></div>
    </section>
  </div>;
}
