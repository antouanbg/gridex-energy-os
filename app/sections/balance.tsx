"use client";

import { useState } from "react";
import type { UiLanguage } from "../i18n/messages";
import { Check, DataTable, ModeRange, PanelTitle } from "./shared";

function BalancingPolicy({notify,lang}:{notify:(v:string)=>void;lang:UiLanguage}) {
  const t=(bg:string,en:string)=>lang==="en"?en:bg;
  const [priority,setPriority]=useState(62);
  const [scheduleWeight,setScheduleWeight]=useState(11);
  const [enabled,setEnabled]=useState(true);
  return <section className="card balancing-policy" data-no-translate><div><p>{t("АВТОМАТИЗИРАНО БАЛАНСИРАНЕ","AUTOMATED BALANCING")}</p><h2>{t("Приоритет, риск и изпълнение на графика","Priority, risk and schedule adherence")}</h2><span>{t("Стратегията управлява само когато очакваната стойност на небаланса превишава пазарната алтернатива и всички договорни условия са валидни.","The strategy acts only when expected imbalance value exceeds the market alternative and all contractual conditions are valid.")}</span></div><div className="balancing-switch"><span><strong>{enabled?t("Активно","Enabled"):t("Наблюдение","Monitoring only")}</strong><small>{t("Договорът е валидиран","Contract validated")}</small></span><button className={enabled?"toggle on":"toggle"} onClick={()=>setEnabled(v=>!v)}/></div><div className="balancing-sliders"><ModeRange label={t("Приоритет на балансирането","Balancing priority")} value={priority} unit="%" min={0} max={100} onChange={setPriority}/><ModeRange label={t("Тежест за изпълнение на графика","Schedule-adherence weight")} value={scheduleWeight} unit="EUR/MWh" min={0} max={30} onChange={setScheduleWeight}/></div><div className="eligibility-checks"><Check text={t("Индивидуално балансиране по договор","Individual balancing agreement")}/><Check text={t("15-минутен график към търговеца","15-minute schedule to trader")}/><Check text={t("Отклонение спрямо официален електромер < 2%","Deviation from official meter < 2%")}/><Check text={t("Локален буфер и възстановяване на данни","Local buffer and data recovery")}/></div><button className="primary-btn" onClick={()=>notify(t("Политиката за балансиране е запазена","Balancing policy saved"))}>{t("Запази политиката","Save policy")}</button></section>;
}

export function Balance({notify,lang}:{notify:(v:string)=>void;lang:UiLanguage}) { return <><BalanceCore/><BalancingPolicy notify={notify} lang={lang}/></>; }

function BalanceCore() {
  return <><section className="portfolio-summary"><div><span>Участници</span><strong>24</strong></div><div><span>Обща позиция</span><strong className="positive">+186 kWh</strong></div><div><span>Прогнозен резултат</span><strong>+1752.71 €</strong></div><div><span>Точност</span><strong>96.8%</strong></div></section><article className="card balance-chart"><PanelTitle eyebrow="ГРАФИК СПРЯМО ИЗМЕРВАНЕ" title="Позиция на групата" action={<span className="pill amber-pill">Обновено 14:30</span>}/><div className="deviation-chart"><div className="deviation-line"/>{[22,18,24,16,12,-8,-12,4,18,26,14,-5,-16,-24,-8,6,18,22,16,8,-4,-10,-6,2].map((v,i)=><div key={i}><i className={v>=0?"surplus":"shortage"} style={{height:`${Math.abs(v)*3}px`}}/><span>{i%4===0?`${i}:00`:""}</span></div>)}</div></article><article className="card table-card"><PanelTitle eyebrow="УЧАСТНИЦИ" title="Текущи позиции"/><DataTable headers={["Обект","График","Измерено","Отклонение","Цена небаланс","Резултат"]} rows={[["Solar Park East","2.46 MWh","2.51 MWh","+2.0%","−9.42 €","+941.80 €"],["Logistics Hub Plovdiv","1.18 MWh","1.12 MWh","−5.1%","−12.36 €","+326.20 €"],["Factory Varna","1.86 MWh","1.83 MWh","−1.6%","−9.42 €","+564.47 €"],["Retail Park Burgas","0.82 MWh","0.91 MWh","+11.0%","−15.97 €","+197.36 €"] , ["Warehouse Ruse","0.42 MWh","0.41 MWh","−2.4%","−9.42 €","+109.42 €"]]}/></article></>;
}
