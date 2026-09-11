"use client";

import { useState } from "react";
import { DataTable, PanelTitle } from "./shared";
import type { UiLanguage } from "../i18n/messages";

export function Settlement({notify,lang}:{notify:(v:string)=>void;lang:UiLanguage}) {
  const t=(bg:string,en:string)=>lang==="en"?en:bg;
  const [tariff,setTariff] = useState("business-flex-2026");
  const [importEnergy,setImportEnergy] = useState(18.4);
  const [exportEnergy,setExportEnergy] = useState(26.8);
  const tariffs = {
    "business-flex-2026": {label:t("Бизнес Flex 2026","Business Flex 2026"),buy:229.40,sell:207.80,network:31.20},
    "solar-ppa-2026": {label:"Solar PPA 2026",buy:218.10,sell:214.60,network:28.40},
    "spot-premium": {label:"Spot + premium",buy:224.80,sell:211.20,network:30.10},
  };
  const active = tariffs[tariff as keyof typeof tariffs];
  const total = exportEnergy*active.sell-importEnergy*(active.buy+active.network);
  return <>
    <section className="settlement-head card"><div><p className="eyebrow">{t("ВЕРСИОНИРАНА ТАРИФА","VERSIONED TARIFF")}</p><h2>{active.label}</h2><span>{t("В сила от","Effective from")} 01.07.2026 · {t("версия","version")} 3.2</span></div><select value={tariff} onChange={e=>setTariff(e.target.value)} aria-label={t("Тарифен план","Tariff plan")}>{Object.entries(tariffs).map(([id,item])=><option key={id} value={id}>{item.label}</option>)}</select><button className="secondary-btn" onClick={()=>notify(t("Създадена е нова версия на тарифата","New tariff version created"))}>+ {t("Нова версия","New version")}</button></section>
    <section className="tariff-grid"><article className="card tariff-card"><PanelTitle eyebrow={t("ЦЕНОВИ КОМПОНЕНТИ","PRICE COMPONENTS")} title={t("Покупка и продажба","Import & export")}/><div className="tariff-price"><span>{t("Купува от мрежата","Imports from grid")}<strong>{active.buy.toFixed(2)} <small>€/MWh</small></strong></span><span>{t("Продава към мрежата","Exports to grid")}<strong>{active.sell.toFixed(2)} <small>€/MWh</small></strong></span><span>{t("Мрежови компоненти","Network components")}<strong>{active.network.toFixed(2)} <small>€/MWh</small></strong></span></div><div className="tou"><span><i className="offpeak"/>{t("Ниска тарифа","Off-peak")} <b>22:00–06:00</b></span><span><i className="midpeak"/>{t("Дневна","Daytime")} <b>06:00–17:00</b></span><span><i className="peak"/>{t("Пикова","Peak")} <b>17:00–22:00</b></span></div></article><article className="card settlement-card"><PanelTitle eyebrow={t("ВИРТУАЛЕН СЕТЪЛМЕНТ","VIRTUAL SETTLEMENT")} title={t("Калкулатор за периода","Period calculator")}/><label><span>{t("Купена енергия","Imported energy")} <b>{importEnergy.toFixed(1)} MWh</b></span><input type="range" min="0" max="50" step="0.1" value={importEnergy} onChange={e=>setImportEnergy(Number(e.target.value))}/></label><label><span>{t("Продадена енергия","Exported energy")} <b>{exportEnergy.toFixed(1)} MWh</b></span><input type="range" min="0" max="50" step="0.1" value={exportEnergy} onChange={e=>setExportEnergy(Number(e.target.value))}/></label><div className={total>=0?"settlement-total positive":"settlement-total negative"}><span>{t("Нетен резултат","Net result")}</span><strong>{total>=0?"+":""}{total.toFixed(2)} €</strong></div><button className="primary-btn" onClick={()=>notify(t("Виртуалната фактура е генерирана","Virtual invoice generated"))}>{t("Генерирай виртуална фактура","Generate virtual invoice")}</button></article></section>
    <article className="card table-card settlement-table"><PanelTitle eyebrow={t("РАЗПРЕДЕЛЕНИЕ","ALLOCATION")} title={t("Енергийна общност · август 2026","Energy community · August 2026")} action={<button className="secondary-btn" onClick={()=>notify(t("Разпределението е преизчислено","Allocation recalculated"))}>{t("Преизчисли","Recalculate")}</button>}/><DataTable headers={[t("Участник","Participant"),t("Потребление","Consumption"),t("Производство","Production"),t("Разпределен дял","Allocated share"),t("Баланс","Balance"),t("Статус","Status")]} rows={[["Solaris Industries","18.4 MWh","26.8 MWh","42%","+759.78 €",t("Готов","Ready")],["LogiCore Bulgaria","12.2 MWh","9.6 MWh","21%","−349.72 €",t("Готов","Ready")],["Black Sea Manufacturing","21.7 MWh","18.4 MWh","27%","−415.17 €",t("Готов","Ready")],["Retail Parks BG","8.9 MWh","3.2 MWh","10%","−730.12 €",t("За преглед","Needs review")]]}/></article>
  </>;
}
