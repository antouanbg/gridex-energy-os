"use client";

import type { UiLanguage } from "../i18n/messages";

export function About({lang,notify}:{lang:UiLanguage;notify:(v:string)=>void}) {
  const t=(bg:string,en:string)=>lang==="en"?en:bg;
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
          <div className="suntech-advert-actions"><button onClick={()=>notify(t("Запитването за SunStorage Pro 261 е подготвено","Your SunStorage Pro 261 enquiry is ready"))}>{t("Поискай оферта","Request an offer")}</button><button onClick={()=>notify(t("Техническата конфигурация е отворена","The technical configuration is open"))}>{t("Техническа конфигурация","Technical configuration")}</button></div>
        </div>
        <div className="storage-product suntech-storage" aria-label="SunStorage Pro 261 battery cabinet"><div className="storage-halo"/><div className="storage-cabinet"><span>SUNTECH</span><strong>SunStorage</strong><small>PRO 261</small><div className="cabinet-screen"><i/><b>READY</b></div><div className="cabinet-vents">••••••••••••</div></div><div className="storage-floor"/></div>
      </div>
    </section>

    <section className="card github-project-card">
      <div className="github-project-mark">&lt;/&gt;</div>
      <div className="github-project-copy"><p>OPEN SOURCE · MIT LICENSE</p><h2>GrideX Energy OS</h2><span>{t("Публичен open-source EMS проект, създаден от д-р инж. Антуан Ангелов. Кодът и техническата архитектура са достъпни в GitHub за преглед, развитие и нови интеграции.","A public open-source EMS project created by Dr. Eng. Antuan Angelov. The code and technical architecture are available on GitHub for review, development and new integrations.")}</span></div>
      <div className="github-project-points"><span>✓ {t("Публичен изходен код","Public source code")}</span><span>✓ OpenRemote + GrideX Edge</span><span>✓ {t("Един ценови модел по публикация и GitHub код на Антуан Ангелов","One price-forecast model based on Antuan Angelov’s publication and GitHub code")}</span></div>
      <div className="github-project-actions"><a href="https://github.com/antouanbg/gridex-energy-os" target="_blank" rel="noreferrer">GitHub repository ↗</a><a href="https://github.com/antouanbg/Compiled-IBEX-Day-Ahead-Price-Dataset" target="_blank" rel="noreferrer">{t("Модел и код за IBEX прогноза ↗","IBEX forecast model & code ↗")}</a><a href="https://github.com/antouanbg/gridex-energy-os/blob/main/LICENSE" target="_blank" rel="noreferrer">MIT License ↗</a></div>
    </section>
  </div>;
}
