"use client";

import { useState } from "react";
import type { UiLanguage } from "../i18n/messages";
import { DataTable, PanelTitle } from "./shared";

export function SubscriptionPlans({notify,lang}:{notify:(v:string)=>void;lang:UiLanguage}) {
  const t=(bg:string,en:string)=>lang==="en"?en:bg;
  const [annual,setAnnual]=useState(true);
  const [selected,setSelected]=useState<"free"|"pro"|"enterprise">("enterprise");
  const plans=[
    {id:"free" as const,name:"GrideX Free",label:t("БЕЗПЛАТЕН ЗАВИНАГИ","FREE FOREVER"),price:t("0 €","EUR 0"),suffix:t("със SunStorage Pro 261","with SunStorage Pro 261"),description:t("Наблюдение, защита и основно управление на един обект.","Monitoring, protection and basic control for one site."),features:[t("1 обект и до 12 устройства","1 site and up to 12 devices"),t("Live PV, BESS, мрежа и товари","Live PV, BESS, grid and loads"),t("Edge failsafe и Software Fuse","Edge failsafe and Software Fuse"),t("Ръчни команди и базов график","Manual commands and basic schedule"),t("Аларми и 30 дни история","Alerts and 30-day history"),t("Дневна енергия, цикли и ДМА","Daily energy, cycles and depreciation")]},
    {id:"pro" as const,name:"GrideX Pro",label:t("АБОНАМЕНТ НА ОБЕКТ","SUBSCRIPTION PER SITE"),price:t("Месечен план","Monthly plan"),suffix:annual?t("2 месеца бонус при годишно плащане","2 months included with annual billing"):t("без дългосрочен договор","no long-term commitment"),description:t("Автоматична икономическа оптимизация на един енергиен обект.","Automated economic optimisation for one energy site."),features:[t("Всичко от Free","Everything in Free"),t("IBEX и пълна покупна/продажна цена","IBEX and all-in import/export price"),t("3-дневна прогноза за време, PV и товар","3-day weather, PV and load forecast"),t("AI режими и ценови арбитраж","AI modes and price arbitrage"),t("96 × 15 min график към търговеца","96 × 15 min trader schedule"),t("Разширени отчети, тарифи и сетълмент","Advanced reports, tariffs and settlement")]},
    {id:"enterprise" as const,name:"GrideX Enterprise",label:t("ИНДУСТРИАЛЕН АБОНАМЕНТ","INDUSTRIAL SUBSCRIPTION"),price:t("Индивидуална оферта","Custom quote"),suffix:t("според мощност, обекти и интеграции","by capacity, sites and integrations"),description:t("Индустриално управление, ERP интеграция и портфолио от обекти.","Industrial control, ERP integration and multi-site portfolio."),features:[t("Всичко от Pro","Everything in Pro"),t("ERP / MES / WMS входни сигнали","ERP / MES / WMS input signals"),t("Товар по поръчки, смени и партиди","Load by orders, shifts and batches"),t("Управляеми индустриални товари","Controllable industrial loads"),t("15-минутно балансиране и VPP","15-minute balancing and VPP"),t("Custom драйвери, API, SLA и audit log","Custom drivers, API, SLA and audit log")]},
  ];
  const rows=[
    [t("Live мониторинг и основни KPI","Live monitoring and core KPIs"),"✓","✓","✓"],
    [t("Edge защити, heartbeat и safe mode","Edge protection, heartbeat and safe mode"),"✓","✓","✓"],
    [t("Software Fuse и BMS ограничения","Software Fuse and BMS limits"),"✓","✓","✓"],
    [t("Дневен разход и ДМА на батерията","Daily battery cost and depreciation"),"✓","✓","✓"],
    [t("IBEX, 3-дневна прогноза и AI режими","IBEX, 3-day forecast and AI modes"),"—","✓","✓"],
    [t("Автоматичен график към търговец","Automated trader schedule"),"—","✓","✓"],
    [t("Тарифи, сетълмент и управленски отчети","Tariffs, settlement and management reports"),"—","✓","✓"],
    [t("ERP / MES прогнозно натоварване","ERP / MES load forecast"),"—","—","✓"],
    [t("Индустриални товари и термичен буфер","Industrial loads and thermal storage"),"—","—","✓"],
    [t("Балансиране, VPP и multi-site dispatch","Balancing, VPP and multi-site dispatch"),"—","—","✓"],
  ];
  return <div className="plans-page" data-no-translate>
    <section className="plans-hero card">
      <div><p>{t("ПРОЗРАЧНО РАЗДЕЛЕНИЕ НА ФУНКЦИИТЕ","TRANSPARENT FEATURE TIERS")}</p><h2>{t("Безплатна безопасност. Платена оптимизация. Индустриална интеграция.","Free safety. Paid optimisation. Industrial integration.")}</h2><span>{t("Критичните защити никога не зависят от абонамент. Платените планове добавят прогнози, автоматизация и измерима икономическа стойност.","Critical protection never depends on a subscription. Paid plans add forecasts, automation and measurable economic value.")}</span></div>
      <div className="billing-toggle"><button className={!annual?"active":""} onClick={()=>setAnnual(false)}>{t("Месечно","Monthly")}</button><button className={annual?"active":""} onClick={()=>setAnnual(true)}>{t("Годишно","Annual")} <em>−16%</em></button></div>
    </section>
    <div className="plan-safety">
      <i>✓</i><div><strong>{t("Защитите остават активни дори без абонамент","Protection remains active even without a subscription")}</strong><span>{t("Edge failsafe, BMS лимити, heartbeat, аварийно нулиране и Software Fuse са част от GrideX Free.","Edge failsafe, BMS limits, heartbeat, emergency zeroing and Software Fuse are part of GrideX Free.")}</span></div>
    </div>
    <section className="plan-grid">{plans.map(plan=><article className={`card plan-card ${plan.id==="pro"?"featured":""} ${selected===plan.id?"selected":""}`} key={plan.id}>
      {plan.id==="pro"&&<span className="recommended">{t("ПРЕПОРЪЧАН","RECOMMENDED")}</span>}
      <span className={`plan-chip ${plan.id}`}>{plan.label}</span><h3>{plan.name}</h3><p>{plan.description}</p>
      <div className="plan-price"><strong>{plan.price}</strong><small>{plan.suffix}</small></div>
      <ul>{plan.features.map(feature=><li key={feature}><i>✓</i>{feature}</li>)}</ul>
      <button className={plan.id==="pro"?"primary-btn":"secondary-btn"} onClick={()=>{setSelected(plan.id);notify(plan.id==="free"?t("GrideX Free е включен завинаги","GrideX Free is included forever"):t(`Избран е ${plan.name} за търговска оферта`,`${plan.name} selected for a commercial quote`));}}>{selected===plan.id?t("Текущ избор","Current selection"):plan.id==="free"?t("Включен","Included"):t("Избери план","Select plan")}</button>
    </article>)}</section>
    <article className="card plan-matrix">
      <PanelTitle eyebrow={t("СРАВНЕНИЕ НА ВЪЗМОЖНОСТИТЕ","CAPABILITY COMPARISON")} title={t("Какво получава клиентът във всеки план","What the customer receives in each plan")}/>
      <DataTable headers={[t("Функционалност","Capability"),"Free","Pro","Enterprise"]} rows={rows}/>
    </article>
    <section className="commercial-note card">
      <div><span className="plan-chip free">FREE FOREVER</span><h3>SunStorage Pro 261</h3><p>{t("Включва GrideX Free лиценз за целия живот на системата и безплатен електропроект. Няма такса за основното наблюдение и защитите.","Includes a lifetime GrideX Free licence and a complimentary electrical design. There is no fee for core monitoring and protection.")}</p></div>
      <div><span className="plan-chip enterprise">ENTERPRISE</span><h3>{t("ERP интеграцията е проектна услуга","ERP integration is a project service")}</h3><p>{t("Включва анализ на данните, mapping на поръчки към енергиен профил, API конектор, тестове и договорен SLA.","Includes data analysis, mapping orders to energy profiles, an API connector, testing and a contractual SLA.")}</p></div>
    </section>
  </div>;
}
