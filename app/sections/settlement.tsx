"use client";

import { useState } from "react";
import { DataTable, PanelTitle } from "./shared";

export function Settlement({notify}:{notify:(v:string)=>void}) {
  const [tariff,setTariff] = useState("Бизнес Flex 2026");
  const [importEnergy,setImportEnergy] = useState(18.4);
  const [exportEnergy,setExportEnergy] = useState(26.8);
  const tariffs = {
    "Бизнес Flex 2026": {buy:229.40,sell:207.80,network:31.20},
    "Solar PPA 2026": {buy:218.10,sell:214.60,network:28.40},
    "Spot + premium": {buy:224.80,sell:211.20,network:30.10},
  };
  const active = tariffs[tariff as keyof typeof tariffs];
  const total = exportEnergy*active.sell-importEnergy*(active.buy+active.network);
  return <>
    <section className="settlement-head card"><div><p className="eyebrow">ВЕРСИОНИРАНА ТАРИФА</p><h2>{tariff}</h2><span>В сила от 01.07.2026 · версия 3.2</span></div><select value={tariff} onChange={e=>setTariff(e.target.value)} aria-label="Тарифен план">{Object.keys(tariffs).map(t=><option key={t}>{t}</option>)}</select><button className="secondary-btn" onClick={()=>notify("Създадена е нова версия на тарифата")}>+ Нова версия</button></section>
    <section className="tariff-grid"><article className="card tariff-card"><PanelTitle eyebrow="ЦЕНОВИ КОМПОНЕНТИ" title="Покупка и продажба"/><div className="tariff-price"><span>Купува от мрежата<strong>{active.buy.toFixed(2)} <small>€/MWh</small></strong></span><span>Продава към мрежата<strong>{active.sell.toFixed(2)} <small>€/MWh</small></strong></span><span>Мрежови компоненти<strong>{active.network.toFixed(2)} <small>€/MWh</small></strong></span></div><div className="tou"><span><i className="offpeak"/>Ниска тарифа <b>22:00–06:00</b></span><span><i className="midpeak"/>Дневна <b>06:00–17:00</b></span><span><i className="peak"/>Пикова <b>17:00–22:00</b></span></div></article><article className="card settlement-card"><PanelTitle eyebrow="ВИРТУАЛЕН СЕТЪЛМЕНТ" title="Калкулатор за периода"/><label><span>Купена енергия <b>{importEnergy.toFixed(1)} MWh</b></span><input type="range" min="0" max="50" step="0.1" value={importEnergy} onChange={e=>setImportEnergy(Number(e.target.value))}/></label><label><span>Продадена енергия <b>{exportEnergy.toFixed(1)} MWh</b></span><input type="range" min="0" max="50" step="0.1" value={exportEnergy} onChange={e=>setExportEnergy(Number(e.target.value))}/></label><div className={total>=0?"settlement-total positive":"settlement-total negative"}><span>Нетен резултат</span><strong>{total>=0?"+":""}{total.toFixed(2)} €</strong></div><button className="primary-btn" onClick={()=>notify("Виртуалната фактура е генерирана")}>Генерирай виртуална фактура</button></article></section>
    <article className="card table-card settlement-table"><PanelTitle eyebrow="РАЗПРЕДЕЛЕНИЕ" title="Енергийна общност · август 2026" action={<button className="secondary-btn" onClick={()=>notify("Разпределението е преизчислено")}>Преизчисли</button>}/><DataTable headers={["Участник","Потребление","Производство","Разпределен дял","Баланс","Статус"]} rows={[["Solaris Industries","18.4 MWh","26.8 MWh","42%","+759.78 €","Готов"],["LogiCore Bulgaria","12.2 MWh","9.6 MWh","21%","−349.72 €","Готов"],["Black Sea Manufacturing","21.7 MWh","18.4 MWh","27%","−415.17 €","Готов"],["Retail Parks BG","8.9 MWh","3.2 MWh","10%","−730.12 €","За преглед"]]}/></article>
  </>;
}
