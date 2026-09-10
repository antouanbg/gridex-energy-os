"use client";

import { useState } from "react";
import type { GridexSiteSnapshot } from "../lib/gridex-api";
import type { UiLanguage } from "../i18n/messages";
import { formatMoney } from "../lib/currency";
import type { DataMode } from "./types";
import { Metric, PanelTitle } from "./shared";

function FlowAsset({className,icon,label,value,unit,note,state,active=true}:{className:string;icon:string;label:string;value:string;unit:string;note:string;state:string;active?:boolean}) {
  return <div className={`energy-asset ${className} ${active?"active":"inactive"}`}>
    <i>{icon}</i>
    <span><small>{label}</small><strong>{value} <b>{unit}</b></strong><em>{note}</em></span>
    <mark>{state}</mark>
  </div>;
}

function FlowLane({className,value,tone,active=true}:{className:string;value:string;tone:"solar"|"grid"|"load"|"battery";active?:boolean}) {
  return <div className={`energy-lane ${className} ${tone} ${active?"active":"inactive"}`} aria-hidden="true">
    <span>{value}</span><div><i/><i/><i/></div>
  </div>;
}

function EnergyFlowVisual({lang,dataMode,snapshot}:{lang:UiLanguage;dataMode:DataMode;snapshot:GridexSiteSnapshot|null}) {
  const [scenario,setScenario]=useState<"solar-surplus"|"grid-charge">("solar-surplus");
  const t=(bg:string,en:string)=>lang==="en"?en:bg;
  const hasLiveSnapshot=dataMode==="live"&&Boolean(snapshot);
  const liveGrid=snapshot?.power.gridKw;
  const liveBattery=snapshot?.power.batteryKw;
  const gridCharge=hasLiveSnapshot?Boolean((liveGrid??0)>0&&(liveBattery??0)<0):scenario==="grid-charge";
  const formatPower=(value:number|null|undefined)=>value==null?"—":Math.abs(value).toFixed(1);
  const values=hasLiveSnapshot
    ? {pv:formatPower(snapshot?.power.pvKw),gridIn:formatPower(liveGrid&&liveGrid>0?liveGrid:0),load:formatPower(snapshot?.power.siteLoadKw),battery:formatPower(liveBattery),gridOut:formatPower(liveGrid&&liveGrid<0?liveGrid:0)}
    : gridCharge
    ? {pv:"18.4",gridIn:"126.0",load:"96.0",battery:"48.4",gridOut:"0.0"}
    : {pv:"248.6",gridIn:"0.0",load:"124.3",battery:"41.1",gridOut:"83.2"};
  const forecast=hasLiveSnapshot
    ? {profit:"—",uplift:t("Очаква данни от forecast endpoint","Awaiting forecast endpoint data")}
    : gridCharge
    ? {profit:t("+1219.02 €","+EUR 2,384.20"),uplift:t("+121.38 € спрямо PV сценария","+EUR 237.40 vs. the PV scenario")}
    : {profit:t("+1097.64 €","+EUR 2,146.80"),uplift:t("Базов оптимизиран сценарий","Optimised baseline scenario")};
  const batteryState=(liveBattery??0)>0?t("РАЗРЕЖДА","DISCHARGING"):(liveBattery??0)<0?t("ЗАРЕЖДА","CHARGING"):t("ГОТОВА","STANDBY");
  return <div className={`energy-flow-visual ${gridCharge?"grid-charge":"solar-surplus"}`} data-no-translate>
    <div className="energy-flow-toolbar">
      <div className="flow-scenario-tabs" role="group" aria-label={t("Сценарий на енергийния поток","Energy flow scenario")}>
        <button disabled={hasLiveSnapshot} className={!gridCharge?"active":""} onClick={()=>setScenario("solar-surplus")}><i>☀</i><span><b>{t("PV излишък","PV surplus")}</b><small>{hasLiveSnapshot?t("Режимът идва от OpenRemote","Mode from OpenRemote"):t("+1097.64 € / 24 ч.","+EUR 2,146.80 / 24 h")}</small></span></button>
        <button disabled={hasLiveSnapshot} className={gridCharge?"active":""} onClick={()=>setScenario("grid-charge")}><i>⌁</i><span><b>{t("Заряд от мрежата","Grid charging")}</b><small>{hasLiveSnapshot?t("Режимът идва от OpenRemote","Mode from OpenRemote"):t("+1219.02 € / 24 ч.","+EUR 2,384.20 / 24 h")}</small></span></button>
      </div>
      <div className="flow-toolbar-kpis">
        <div className="flow-profit-forecast"><small>{t("Прогнозна печалба · 24 ч.","Forecast profit · 24 h")}</small><strong>{forecast.profit}</strong><em>{forecast.uplift}</em></div>
        <div className="flow-balance"><i>✓</i><span><small>{t("Баланс","Balance")}</small><strong>0.0 kW</strong></span></div>
      </div>
    </div>
    <div className="energy-flow-map">
      <FlowAsset className="flow-pv" icon="☀" label={t("Фотоволтаици","Solar PV")} value={values.pv} unit="kW" note={gridCharge?t("Ниско производство","Low production"):t("Активно производство","Active generation")} state={gridCharge?t("НИСКО","LOW"):t("ИЗТОЧНИК","SOURCE")}/>
      <FlowLane className="lane-pv" value={`${values.pv} kW`} tone="solar"/>

      <FlowAsset className="flow-grid-in" icon="⌁" label={t("Електрическа мрежа","Utility grid")} value={values.gridIn} unit="kW" note={gridCharge?t("Внос при ниска цена","Import at low price"):t("Без внос","No import")} state={gridCharge?t("ИЗТОЧНИК","SOURCE"):t("ГОТОВА","STANDBY")} active={gridCharge}/>
      <FlowLane className="lane-grid-in" value={`${values.gridIn} kW`} tone="grid" active={gridCharge}/>

      <div className="energy-flow-hub"><i>GX</i><small>GRIDEX EMS</small><strong>{gridCharge?t("Заряд от мрежата","Grid charging"):t("PV излишък","PV surplus")}</strong><span><b/> {t("Автоматично балансиране","Automatic balancing")}</span></div>

      <FlowLane className="lane-load" value={`${values.load} kW`} tone="load"/>
      <FlowAsset className="flow-load" icon="⌂" label={t("Консумация","Site load")} value={values.load} unit="kW" note={t("Текущ товар на обекта","Current site demand")} state={t("КОНСУМАТОР","LOAD")}/>

      <FlowLane className="lane-battery" value={`${values.battery} kW`} tone="battery"/>
      <FlowAsset className="flow-battery" icon="▣" label={t("Батерия","Battery")} value={hasLiveSnapshot&&snapshot?.battery?.socPct!=null?`${snapshot.battery.socPct.toFixed(1)}%`:hasLiveSnapshot?"—":"72%"} unit="SOC" note={hasLiveSnapshot?`${values.battery} kW · ${snapshot?.quality}`:gridCharge?t("Заряд от мрежата · ниска цена","Grid charge · low price"):t("Заряд от PV излишък","Charging from PV surplus")} state={hasLiveSnapshot?batteryState:t("ЗАРЕЖДА","CHARGING")}/>

      <FlowLane className="lane-grid-out" value={`${values.gridOut} kW`} tone="grid" active={!gridCharge}/>
      <FlowAsset className="flow-grid-out" icon="↗" label={t("Износ към мрежата","Grid export")} value={values.gridOut} unit="kW" note={gridCharge?t("Износът е спрян","Export disabled"):t("Продажба на излишъка","Selling surplus")} state={gridCharge?t("ИЗКЛЮЧЕН","OFF"):t("ИЗНОС","EXPORT")} active={!gridCharge}/>
    </div>
    <div className="flow-scenario-note"><i>{gridCharge?"¤":"☀"}</i><span><strong>{hasLiveSnapshot?t("Реален поток от OpenRemote","Live flow from OpenRemote"):gridCharge?t("Защо зареждаме от мрежата?","Why are we charging from the grid?"):t("Оптимално използване на PV излишъка","Optimal use of PV surplus")}</strong><small>{hasLiveSnapshot?t("Стойностите се обновяват автоматично. Липсващите показатели се показват с тире и никога не се заместват с демо стойности.","Values refresh automatically. Missing metrics are shown as a dash and are never replaced with demo values."):gridCharge?t("Прогнозата е за слабо слънце, а текущата пазарна цена е под зададения праг. EMS запазва енергия за следващите скъпи часове.","Low solar output is forecast and the current market price is below the configured threshold. EMS stores energy for the next expensive hours."):t("Първо се покрива товарът, след това се зарежда батерията, а останалата енергия се продава към мрежата.","Site demand is covered first, then the battery is charged and the remaining energy is exported to the grid.")}</small><em>{hasLiveSnapshot?`${t("обновено","updated")} ${new Date(snapshot!.timestamp).toLocaleTimeString(lang==="en"?"en-GB":"bg-BG")}`:`LightGBM · ${t("достоверност 87% · обновено 14:30","87% confidence · updated 14:30")}`}</em></span></div>
  </div>;
}

function LossProtectionPanel({lang,dataMode,snapshot}:{lang:UiLanguage;dataMode:DataMode;snapshot:GridexSiteSnapshot|null}) {
  const t=(bg:string,en:string)=>lang==="en"?en:bg;
  const [costMode,setCostMode]=useState<"cash_cost"|"full_cost">("full_cost");
  const live=dataMode==="live";
  const economics=live?snapshot?.strategy?.economicForecast24h:null;
  const cycles=live?snapshot?.strategy?.cycleForecast24h:null;
  const actual=live?snapshot?.batteryEconomicsToday:null;
  const money=(value:number|undefined)=>value==null?"—":formatMoney(value,lang);
  const number=(value:number|undefined,digits=2)=>value==null?"—":value.toFixed(digits);
  const demo=costMode==="full_cost"
    ? {pvFloor:37.4,batteryFloor:136.2,revenue:2384.2,purchase:812.4,fees:124.8,imbalance:86.5,losses:72.6,degradation:164.2,depreciation:91.7,profit:1032.0,gridCycles:.46,pvCycles:.31,totalCycles:.82}
    : {pvFloor:19.2,batteryFloor:105.7,revenue:2384.2,purchase:812.4,fees:124.8,imbalance:86.5,losses:72.6,degradation:0,depreciation:0,profit:1288.0,gridCycles:.46,pvCycles:.31,totalCycles:.82};
  const shown={
    pvFloor:live?economics?.pvDirect.minimumSalePricePerMwh:demo.pvFloor,
    batteryFloor:live?economics?.batteryDischarge.minimumSalePricePerMwh:demo.batteryFloor,
    revenue:live?economics?.grossRevenue:demo.revenue,
    purchase:live?economics?.energyPurchaseCost:demo.purchase,
    fees:live?economics?.tariffsAndFees:demo.fees,
    imbalance:live?economics?.imbalanceRiskCost:demo.imbalance,
    losses:live?economics?.conversionLossCost:demo.losses,
    degradation:live?economics?.batteryDegradationCost:demo.degradation,
    depreciation:live?economics?.assetDepreciationCost:demo.depreciation,
    profit:live?economics?.netProfit:demo.profit,
    gridCycles:live?cycles?.gridChargeEquivalentCycles:demo.gridCycles,
    pvCycles:live?cycles?.pvChargeEquivalentCycles:demo.pvCycles,
    totalCycles:live?cycles?.equivalentFullCycles:demo.totalCycles,
  };
  return <article className="card loss-protection" data-no-translate>
    <div className="loss-protection-head"><div><p>{t("ИКОНОМИЧЕСКА ЗАЩИТА · 24 ЧАСА","ECONOMIC PROTECTION · 24 HOURS")}</p><h2>{t("Не продавай на загуба","Do not sell at a loss")}</h2><span>{t("Отделна себестойност за директна PV продажба и за енергия, преминала през батерията.","Separate cost floors for direct PV export and energy routed through the battery.")}</span></div><div className="loss-mode-tabs"><button disabled={live} className={costMode==="cash_cost"?"active":""} onClick={()=>setCostMode("cash_cost")}>{t("Паричен разход","Cash cost")}</button><button disabled={live} className={costMode==="full_cost"?"active":""} onClick={()=>setCostMode("full_cost")}>{t("Пълна себестойност","Full cost")}</button></div></div>
    <div className="sale-floor-grid"><section><small>{t("PV → МРЕЖА","PV → GRID")}</small><strong>{number(shown.pvFloor)} <b>EUR/MWh</b></strong><span>{t("Минимална продажна цена без батериен разход","Minimum sale price without battery cost")}</span></section><section className="battery-floor"><small>{t("БАТЕРИЯ → МРЕЖА","BATTERY → GRID")}</small><strong>{number(shown.batteryFloor)} <b>EUR/MWh</b></strong><span>{t("Включва произход, загуби, деградация и ДМА според режима","Includes source, losses, degradation and depreciation per policy")}</span></section><section className="net-forecast"><small>{t("НЕТНА ПРОГНОЗА","NET FORECAST")}</small><strong>{money(shown.profit)}</strong><span>{t("След всички избрани разходи","After all selected costs")}</span></section></div>
    <div className="economics-body"><div className="cost-components"><h3>{t("Компоненти на прогнозата","Forecast components")}</h3>{[
      [t("Брутен приход","Gross revenue"),shown.revenue],
      [t("Покупка на енергия от мрежата","Grid energy purchase"),shown.purchase],
      [t("Тарифи, търговец и борса","Tariffs, trader and exchange"),shown.fees],
      [t("Риск от небаланс","Imbalance risk"),shown.imbalance],
      [t("Загуби при преобразуване","Conversion losses"),shown.losses],
      [t("Деградация / разход за цикъл","Degradation / cycle cost"),shown.degradation],
      [t("ДМА на активите","Asset depreciation"),shown.depreciation],
    ].map(([label,value])=><span key={String(label)}><small>{label}</small><b>{money(value as number|undefined)}</b></span>)}</div>
    <div className="cycle-origin"><h3>{t("Прогнозни цикли по произход на заряда","Projected cycles by charge source")}</h3><div><span className="grid-cycle"><i>⌁</i><small>{t("От мрежата","From grid")}</small><strong>{number(shown.gridCycles)}</strong><em>{live?`${number(cycles?.gridChargeKwh,1)} kWh`:"92.0 kWh"}</em></span><span className="pv-cycle"><i>☀</i><small>{t("От PV","From PV")}</small><strong>{number(shown.pvCycles)}</strong><em>{live?`${number(cycles?.pvChargeKwh,1)} kWh`:"62.0 kWh"}</em></span><span className="total-cycle"><i>↻</i><small>{t("Общо EFC","Total EFC")}</small><strong>{number(shown.totalCycles)}</strong><em>{t("charge + discharge throughput","charge + discharge throughput")}</em></span></div><div className="actual-cycle-strip"><b>{t("Днес реално","Actual today")}</b><span>{t("Мрежа","Grid")} <strong>{actual?.available?number(actual.gridChargeEquivalentCycles??undefined):"—"}</strong></span><span>PV <strong>{actual?.available?number(actual.pvChargeEquivalentCycles??undefined):"—"}</strong></span><span>EFC <strong>{actual?.available?number(actual.equivalentFullCycles??undefined):"—"}</strong></span><span>{t("Деградация + ДМА","Degradation + depreciation")} <strong>{actual?.available?money((actual.degradationCost??0)+(actual.depreciationCost??0)):"—"}</strong></span></div><p>{live&&economics?`${t("Два ценови източника","Two price sources")}: ${economics.priceForecastSources.map(item=>item.source).join(" · ")} · ${t("Изгрев","Sunrise")} ${economics.sunrise} · ${t("Залез","Sunset")} ${economics.sunset}`:t("2 ценови прогнози · актуална метео прогноза · изгрев 06:34 · залез 20:18","2 price forecasts · current weather forecast · sunrise 06:34 · sunset 20:18")}</p></div></div>
  </article>;
}

export function Overview({ auto, setAuto, navigate, notify, lang, dataMode, snapshot }: { auto: boolean; setAuto: (v:boolean)=>void; navigate:(v:string)=>void; notify:(v:string)=>void; lang:UiLanguage;dataMode:DataMode;snapshot:GridexSiteSnapshot|null }) {
  const t=(bg:string,en:string)=>lang==="en"?en:bg;
  const isLive=dataMode==="live";
  const batterySoc=isLive&&snapshot?.battery?.socPct!=null?snapshot.battery.socPct.toFixed(1):isLive?"—":"72";
  return <>
    <div className="status-strip">
      <span><i className="live-dot"/>{dataMode==="live"?t("Свързано с OpenRemote","Connected to OpenRemote"):t("Представителни демо данни","Representative demo data")}</span>
      <span>{t("Последни данни","Latest data")} <b>{dataMode==="live"&&snapshot?new Date(snapshot.timestamp).toLocaleTimeString(lang==="en"?"en-GB":"bg-BG"):"14:32:08"}</b></span>
      <button disabled={isLive} title={isLive?t("Режимът се управлява през защитената конфигурационна команда","Mode is controlled through the protected configuration command"):undefined} onClick={() => setAuto(!auto)}><i className={auto ? "toggle on" : "toggle"}/><span><strong>{isLive?(snapshot?.strategy?.mode??t("Режим от OpenRemote","Mode from OpenRemote")):auto ? "Автоматичен режим" : "Ръчен режим"}</strong><small>{isLive?t("Защитена live конфигурация","Protected live configuration"):"Оптимизация по пазарна цена"}</small></span></button>
    </div>
    <section className="hero-grid">
      <article className="flow-card card" data-no-translate>
        <PanelTitle eyebrow={t("ЕНЕРГИЕН ПОТОК","ENERGY FLOW")} title={t("В реално време","Real-time energy flow")} action={<span className={`pill ${dataMode==="live"?"green":"amber"}`}>● {dataMode==="live"?t("На живо","Live"):t("Демо","Demo")}</span>}/>
        <EnergyFlowVisual lang={lang} dataMode={dataMode} snapshot={snapshot}/>
      </article>
      <aside className="summary card">
        <PanelTitle eyebrow={t("ДНЕШЕН РЕЗУЛТАТ","TODAY'S RESULT")} title={isLive?new Date().toLocaleDateString(lang==="en"?"en-GB":"bg-BG"):"21 август 2026"} action={<button disabled={isLive} onClick={() => notify("Отчетът е подготвен за изтегляне")}>•••</button>}/>
        <div className="profit"><span>{t("Нетен резултат","Net result")}</span><strong>{isLive?"—":"+942.11 €"}</strong><small>{isLive?t("Очаква economics endpoint","Awaiting economics endpoint"):"↑ 18.4% спрямо прогнозата"}</small></div>
        <div className="summary-row"><span>{t("Спестени разходи","Avoided costs")}<small>{t("Собствено потребление","Self-consumption")}</small></span><b>{isLive?"—":"349.83 €"}</b></div>
        <div className="summary-row"><span>{t("Приход от продажба","Export revenue")}<small>{t("Енергия към мрежата","Energy exported")}</small></span><b>{isLive?"—":"663.04 €"}</b></div>
        <div className="summary-row"><span>{t("Разход за покупка","Import cost")}<small>{t("Енергия от мрежата","Energy imported")}</small></span><b className="negative">{isLive?"—":"−70.76 €"}</b></div>
        <button className="details" onClick={() => navigate("balance")}>Виж подробен отчет →</button>
      </aside>
    </section>
    <LossProtectionPanel lang={lang} dataMode={dataMode} snapshot={snapshot}/>
    <section className="kpis">
      <Metric label={t("PV производство","PV production")} value={isLive?"—":"2.84"} unit="MWh" badge={isLive?t("history endpoint","history endpoint"):"↑ 8.2%"} type="spark solar-spark"/>
      <Metric label={t("Консумация","Consumption")} value={isLive?"—":"1.92"} unit="MWh" badge={isLive?t("history endpoint","history endpoint"):"↓ 3.1%"} type="spark load-spark"/>
      <Metric label={t("Състояние на батерията","Battery state")} value={batterySoc} unit="% SOC" badge={isLive&&snapshot?`SOH ${snapshot.battery.sohPct.toFixed(1)}%`:"SOH 98%"} type="charge"/>
      <Metric label={t("Цена в момента","Current price")} value={isLive?"—":"214.62"} unit={t("€/MWh","EUR/MWh")} badge={isLive?t("market endpoint","market endpoint"):t("Висока","High")} type="price" priceNote={isLive?t("Очаква пазарни данни","Awaiting market data"):undefined}/>
    </section>
    {!isLive&&<section className="lower-grid">
      <article className="card chart-card"><PanelTitle eyebrow="МОЩНОСТ И ПРОГНОЗА" title="Днешен профил" action={<div className="legend"><span className="green-key">PV</span><span className="purple-key">Товар</span></div>}/><AreaChart/></article>
      <article className="card activity-card"><PanelTitle eyebrow="ПОСЛЕДНИ ДЕЙСТВИЯ" title="Дневник на системата"/><Activity icon="↗" title="Продажба към мрежата" note="83.2 kW · автоматична команда" time="14:31"/><Activity icon="▣" title="SOC достигна 72%" note="Зареждането е ограничено" time="14:18"/><Activity icon="✓" title="Графикът е приет" note="IBEX ден напред · 24 интервала" time="13:42"/><button className="details" onClick={() => navigate("alarms")}>Всички събития →</button></article>
    </section>}
    {isLive&&<section className="live-endpoint-grid"><article className="card"><PanelTitle eyebrow={t("ИСТОРИЯ И ПРОГНОЗА","HISTORY & FORECAST")} title={t("Очаква backend endpoint","Awaiting backend endpoint")}/><p>{t("Графиката ще се зареди от /history и /forecast. Представителни демо стойности не се показват в live режим.","The chart will load from /history and /forecast. Representative demo values are not shown in live mode.")}</p></article><article className="card"><PanelTitle eyebrow={t("ОДИТ И ДЕЙСТВИЯ","AUDIT & ACTIONS")} title={t("Очаква backend endpoint","Awaiting backend endpoint")}/><p>{t("Дневникът ще показва само реални команди и OpenRemote събития за разрешения обект.","The log will show only real commands and OpenRemote events for the authorised site.")}</p></article></section>}
  </>;
}

function AreaChart() {
  const values = [20,18,16,19,28,48,72,92,108,116,124,130,126,118,104,88,70,48,34,28,24,22,20,18];
  return <div className="area-chart" aria-label="Графика на мощността по часове"><div className="chart-grid"/>{values.map((v,i)=><div key={i} className="area-column"><i style={{height:`${v}px`}}/><b style={{height:`${Math.max(12,v*.62)}px`}}/>{i%4===0&&<span>{String(i).padStart(2,"0")}:00</span>}</div>)}</div>;
}

function Activity({icon,title,note,time}:{icon:string;title:string;note:string;time:string}) { return <div className="activity"><i>{icon}</i><span><strong>{title}</strong><small>{note}</small></span><time>{time}</time></div>; }
