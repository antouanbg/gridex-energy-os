"use client";

import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { UiLanguage } from "../i18n/messages";
import type { ContactChallenge, GridexApiClient } from '../lib/gridex-api';

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
  useEffect(()=>{let current=true;api.contactChallenge().then(value=>{if(current){setChallenge(value);setChallengeError(false);}}).catch(()=>{if(current)setChallengeError(true);});return()=>{current=false;};},[api]);
  const refreshChallenge=async()=>{
    setChallenge(null);setAnswer('');
    try{setChallenge(await api.contactChallenge());setChallengeError(false);}catch{setChallengeError(true);}
  };
  const send=async(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();
    if(!challenge||busy)return;
    setBusy(true);setResult(null);
    try{
      await api.submitContactEnquiry({name,email:live?(email||''):senderEmail,replyEmail:senderEmail,topic,message,
        challengeId:challenge.id,answer:Number(answer),website},live);
      setResult('queued');setMessage('');setTopic('');
    }catch{setResult('error');}
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
      <form className="config-form" onSubmit={send}>
        <label><span>{t('Име','Name')}</span><input required minLength={2} maxLength={100} autoComplete="name" value={name} onChange={event=>setName(event.target.value)}/></label>
        <label><span>{t('Имейл за отговор','Reply email')}</span><input required type="email" maxLength={254} autoComplete="email" value={senderEmail} onChange={event=>setEditedReply({account:accountEmail,value:event.target.value})}/>{live&&<small>{t('Предварително е попълнен имейлът от профила. Можете да зададете друг адрес за отговор; профилната Ви самоличност остава записана отделно.','Your account email is filled in. You can enter a different reply address; your verified account identity is recorded separately.')}</small>}</label>
        <label><span>{t('Тема','Topic')}</span><input required minLength={3} maxLength={120} value={topic} onChange={event=>setTopic(event.target.value)}/></label>
        <label><span>{challenge?t(`Проверка: колко е ${challenge.left} + ${challenge.right}?`,`Human check: what is ${challenge.left} + ${challenge.right}?`):t('Зареждане на проверката…','Loading human check…')}</span><input required type="number" inputMode="numeric" value={answer} onChange={event=>setAnswer(event.target.value)} disabled={!challenge}/></label>
        <label style={{gridColumn:'1/-1'}}><span>{t('Вашето запитване','Your enquiry')}</span><textarea required minLength={20} maxLength={5000} rows={5} value={message} onChange={event=>setMessage(event.target.value)} style={{width:'100%',border:'1px solid #d5e0d8',borderRadius:9,padding:12,font:'inherit',resize:'vertical'}}/></label>
        <label aria-hidden="true" style={{position:'absolute',left:'-10000px'}}><span>Website</span><input tabIndex={-1} autoComplete="off" value={website} onChange={event=>setWebsite(event.target.value)}/></label>
        <div style={{gridColumn:'1/-1'}}><button className="primary-btn" type="submit" disabled={busy||!challenge||live&&!email}>{busy?t('Изпращане…','Sending…'):t('Изпрати запитване','Send enquiry')}</button>{challengeError&&<button className="secondary-btn" type="button" onClick={()=>void refreshChallenge()}>{t('Опитай проверката отново','Retry human check')}</button>}</div>
      </form>
      {result==='queued'&&<p role="status">{t('Запитването е прието за изпращане. Това не е потвърждение за доставка в пощата.','Your enquiry was accepted for sending. This is not confirmation of mailbox delivery.')}</p>}
      {result==='error'&&<p role="alert">{t('Запитването не е потвърдено. Не натискайте повторно веднага; при нужда се свържете с поддръжката.','The enquiry was not confirmed. Do not retry immediately; contact support if needed.')}</p>}
    </section>

    <section className="card github-project-card">
      <div className="github-project-mark">&lt;/&gt;</div>
      <div className="github-project-copy"><p>OPEN SOURCE · MIT LICENSE</p><h2>GrideX Energy OS</h2><span>{t("Публичен open-source EMS проект, създаден от д-р инж. Антуан Ангелов. Кодът и техническата архитектура са достъпни в GitHub за преглед, развитие и нови интеграции.","A public open-source EMS project created by Dr. Eng. Antuan Angelov. The code and technical architecture are available on GitHub for review, development and new integrations.")}</span></div>
      <div className="github-project-points"><span>✓ {t("Публичен изходен код","Public source code")}</span><span>✓ OpenRemote + GrideX Edge</span><span>✓ {t("Един ценови модел по публикация и GitHub код на Антуан Ангелов","One price-forecast model based on Antuan Angelov’s publication and GitHub code")}</span></div>
      <div className="github-project-actions"><a href="https://github.com/antouanbg/gridex-energy-os" target="_blank" rel="noreferrer">GitHub repository ↗</a><a href="https://github.com/antouanbg/Compiled-IBEX-Day-Ahead-Price-Dataset" target="_blank" rel="noreferrer">{t("Модел и код за IBEX прогноза ↗","IBEX forecast model & code ↗")}</a><a href="https://github.com/antouanbg/gridex-energy-os/blob/main/LICENSE" target="_blank" rel="noreferrer">MIT License ↗</a></div>
    </section>
  </div>;
}
