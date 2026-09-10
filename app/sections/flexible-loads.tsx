"use client";

import { useState } from "react";
import type { UiLanguage } from "../i18n/messages";
import { DataTable, ModeRange, PanelTitle } from "./shared";

export function FlexibleLoads({notify,lang}:{notify:(v:string)=>void;lang:UiLanguage}) {
  const t=(bg:string,en:string)=>lang==="en"?en:bg;
  const [tab,setTab]=useState<"assets"|"rules"|"erp"|"thermal">("assets");
  const [maxPrice,setMaxPrice]=useState(142);
  const [reserve,setReserve]=useState(18);
  const [occupancy,setOccupancy]=useState(64);
  const [softwareFuse,setSoftwareFuse]=useState(180);
  const loads=[
    {icon:"♨",name:t("Електрически котел 1","Electric boiler 1"),type:t("Термичен буфер","Thermal storage"),power:"72 kW",state:t("Готов","Ready"),plan:"11:00–14:00"},
    {icon:"❄",name:t("Чилърна група","Chiller plant"),type:"HVAC",power:"96 kW",state:t("Ограничен","Limited"),plan:"16:30–18:30"},
    {icon:"ϟ",name:t("EV парк · 9 точки","EV fleet · 9 points"),type:"OCPP",power:"132 kW",state:t("Зарежда","Charging"),plan:"01:00–06:00"},
    {icon:"⌘",name:t("Процесна линия B","Process line B"),type:t("Отложим товар","Deferrable load"),power:"185 kW",state:t("Планиран","Scheduled"),plan:"22:00–02:00"},
    {icon:"◇",name:t("Компресорна станция","Compressor station"),type:t("Гъвкав товар","Flexible load"),power:"55 kW",state:t("Готов","Ready"),plan:"08:00–10:00"},
  ];
  return <div className="loads-page" data-no-translate>
    <section className="loads-hero card"><div><p>{t("FLEXIBLE LOAD ORCHESTRATION","FLEXIBLE LOAD ORCHESTRATION")}</p><h2>{t("Ценово управление на всеки управляем консуматор","Price-aware control for every controllable load")}</h2><span>{t("Бойлери, нагреватели, HVAC, EV, компресори и производствени линии участват в общия график, software fuse и прогнозата за небаланс.","Boilers, heaters, HVAC, EV, compressors and production lines participate in the shared schedule, software fuse and imbalance forecast.")}</span></div><div className="loads-live"><small>{t("УПРАВЛЯЕМ КАПАЦИТЕТ","CONTROLLABLE CAPACITY")}</small><strong>540 kW</strong><span>5 {t("актива · 4 онлайн","assets · 4 online")}</span></div></section>
    <div className="subnav loads-tabs">{[["assets",t("Активи и график","Assets & schedule")],["rules",t("Правила за покупка","Purchase rules")],["erp",t("ERP производствен план","ERP production plan")],["thermal",t("Термичен модел","Thermal model")]].map(x=><button key={x[0]} className={tab===x[0]?"active":""} onClick={()=>setTab(x[0] as typeof tab)}>{x[1]}</button>)}</div>
    {tab==="assets"&&<><section className="load-kpis"><article className="card"><small>{t("ТЕКУЩ ТОВАР","CURRENT LOAD")}</small><strong>168 kW</strong><span>31% {t("от наличния","of available")}</span></article><article className="card"><small>{t("ПРЕМЕСТЕН КЪМ ЕВТИНИ ЧАСОВЕ","SHIFTED TO LOW-PRICE HOURS")}</small><strong>1.42 MWh</strong><span className="positive">+286 EUR</span></article><article className="card"><small>{t("PV ИЗЛИШЪК УСВОЕН","PV SURPLUS ABSORBED")}</small><strong>86%</strong><span>1.18 MWh</span></article><article className="card"><small>SOFTWARE FUSE</small><strong>{softwareFuse} kW</strong><span>{t("общ лимит","shared limit")}</span></article></section><section className="load-grid">{loads.map((item,i)=><article className="card load-card" key={item.name}><i>{item.icon}</i><span className={i===1?"load-state amber-pill":"load-state"}>● {item.state}</span><h3>{item.name}</h3><p>{item.type}</p><div><span>{t("Мощност","Power")}<b>{item.power}</b></span><span>{t("Оптимален прозорец","Optimal window")}<b>{item.plan}</b></span></div><button className="secondary-btn" onClick={()=>notify(t(`Отворен е графикът за ${item.name}`,`Schedule opened for ${item.name}`))}>{t("Отвори график","Open schedule")}</button></article>)}</section><article className="card load-fuse"><PanelTitle eyebrow="SHARED SOFTWARE FUSE" title={t("Обща отпусната мощност за гъвкави товари","Shared capacity for flexible loads")}/><ModeRange label={t("Лимит за всички управляеми товари","Limit for all controllable loads")} value={softwareFuse} unit="kW" min={60} max={360} onChange={setSoftwareFuse}/><div><span><i style={{width:"64%"}}/><b>Site 412 kW</b></span><span><i style={{width:"26%"}}/><b>{t("Гъвкави товари","Flexible loads")} 168 kW</b></span><span><i style={{width:"10%"}}/><b>{t("Резерв","Reserve")} 65 kW</b></span></div></article></>}
    {tab==="rules"&&<section className="load-rules-layout"><article className="card load-rule-config"><PanelTitle eyebrow={t("ПОЛИТИКА ЗА ПОКУПКА","PURCHASE POLICY")} title={t("Цена, PV излишък и оперативна нужда","Price, PV surplus and operational demand")}/><ModeRange label={t("Максимална пълна цена","Maximum all-in price")} value={maxPrice} unit="EUR/MWh" min={40} max={260} onChange={setMaxPrice}/><ModeRange label={t("Оперативен резерв","Operational reserve")} value={reserve} unit="%" min={0} max={40} onChange={setReserve}/><div className="load-rule-types"><button className="active"><i>¤</i><span><strong>{t("Максимална цена","Maximum price")}</strong><small>{t("Работи под зададения праг","Run below the threshold")}</small></span></button><button><i>↓</i><span><strong>{t("Най-евтин час","Cheapest hour")}</strong><small>{t("Избира най-ниската цена за деня","Select the day’s lowest price")}</small></span></button><button><i>☀</i><span><strong>{t("Само PV излишък","PV surplus only")}</strong><small>{t("Без покупка от мрежата","No grid import")}</small></span></button><button><i>0</i><span><strong>{t("Без продажба","No export")}</strong><small>{t("Усвоява целия локален излишък","Absorb all local surplus")}</small></span></button></div><button className="primary-btn" onClick={()=>notify(t("Правилата за управляемите товари са запазени","Flexible-load rules saved"))}>{t("Запази политиката","Save policy")}</button></article><article className="card occupancy-card"><PanelTitle eyebrow={t("ВЪНШЕН ОПЕРАТИВЕН СИГНАЛ","EXTERNAL OPERATING SIGNAL")} title={t("Резервации, смени и производствен план","Bookings, shifts and production plan")}/><div className="occupancy-value"><strong>{occupancy}%</strong><span>{t("очаквано натоварване утре","expected utilisation tomorrow")}</span></div><ModeRange label={t("Симулация на заетостта","Utilisation simulation")} value={occupancy} unit="%" min={0} max={100} onChange={setOccupancy}/><div className="occupancy-source"><span><i>API</i><b>{t("Резервационна / ERP система","Booking / ERP system")}</b><small>{t("Обновено преди 6 мин.","Updated 6 min ago")}</small></span><span><i>↗</i><b>{t("Прогнозен товар","Forecast load")}</b><small>{Math.round(260+occupancy*2.8)} kWh</small></span></div><p>{t("Сигналът променя нужния термичен резерв, EV капацитета и допустимото отлагане на процесните товари.","The signal changes required thermal reserve, EV capacity and allowable deferral of process loads.")}</p></article></section>}
    {tab==="erp"&&<ErpProductionPlan notify={notify} lang={lang}/>}
    {tab==="thermal"&&<section className="thermal-layout"><article className="card thermal-tank"><div className="tank-visual"><span style={{height:"68%"}}/><strong>68°C</strong><small>4.2 MWhth</small></div><div><PanelTitle eyebrow={t("ТЕРМИЧЕН БУФЕР","THERMAL STORAGE")} title={t("Индустриален бойлерен каскад","Industrial boiler cascade")}/><div className="thermal-stats"><span>{t("Минимум","Minimum")}<b>48°C</b></span><span>{t("Максимум","Maximum")}<b>78°C</b></span><span>{t("Хистерезис","Hysteresis")}<b>3°C</b></span><span>{t("Загуби","Losses")}<b>0.006 / h</b></span></div><div className="thermal-flow"><span><i>☀</i>{t("PV излишък","PV surplus")}</span><b>+</b><span><i>¤</i>{t("Евтин ток","Low-cost power")}</span><b>→</b><span><i>♨</i>{t("Топлинен запас","Thermal reserve")}</span></div></div></article><article className="card thermal-sensors"><PanelTitle eyebrow={t("СЕНЗОРИ И САМООБУЧЕНИЕ","SENSORS & SELF-LEARNING")} title={t("Загуби срещу реална консумация","Losses versus actual demand")}/><div><span><i>●</i><b>{t("Топла вода","Hot water")}</b><strong>68.2°C</strong></span><span><i>●</i><b>{t("Студена вода","Cold water")}</b><strong>14.6°C</strong></span><span><i>●</i><b>{t("Помещение","Plant room")}</b><strong>25.1°C</strong></span><span><i>AI</i><b>{t("Модел на загубите","Loss model")}</b><strong>96.4%</strong></span></div><button className="primary-btn" onClick={()=>notify(t("Коефициентът на топлинни загуби е преизчислен","Thermal-loss coefficient recalculated"))}>{t("Преизчисли коефициента","Recalculate coefficient")}</button></article></section>}
  </div>;
}

function ErpProductionPlan({notify,lang}:{notify:(v:string)=>void;lang:UiLanguage}) {
  const t=(bg:string,en:string)=>lang==="en"?en:bg;
  const [reserve,setReserve]=useState(12);
  const forecast=[38,32,29,31,46,68,92,118,146,172,188,196,184,169,158,174,205,228,214,182,136,98,71,52];
  const orders=[
    ["PO-4821",t("Линия A · партида 14","Line A · batch 14"),"08:00–11:30","412 kWh",t("Висок","High")],
    ["PO-4827",t("Линия B · термообработка","Line B · thermal process"),"12:15–16:00","684 kWh",t("Задължителен","Mandatory")],
    ["PO-4830",t("Компресори · партида 9","Compressors · batch 9"),"22:00–01:00","188 kWh",t("Гъвкав","Flexible")],
    ["PO-4834",t("Опаковъчна линия","Packaging line"),"05:30–07:30","126 kWh",t("Среден","Medium")],
  ];
  return <section className="erp-plan" data-no-translate>
    <div className="erp-status card">
      <div><span className="plan-chip enterprise">ENTERPRISE</span><p>{t("ERP / MES ВХОДЕН СИГНАЛ","ERP / MES INPUT SIGNAL")}</p><h2>{t("Производственият план става прогноза за електрическия товар","The production plan becomes an electrical-load forecast")}</h2><small>{t("Поръчки, смени, партиди и крайни срокове се преобразуват в 15-минутен товар и се оптимизират спрямо PV, батерията, цената и отпуснатата мощност.","Orders, shifts, batches and deadlines are converted into a 15-minute load forecast and optimised against PV, battery, price and contracted capacity.")}</small></div>
      <div className="erp-connection"><i>API</i><span><b>SAP S/4HANA</b><small>Online · 14:32:08</small></span></div>
    </div>
    <div className="erp-kpis">
      <article className="card"><small>{t("ХОРИЗОНТ","HORIZON")}</small><strong>72 h</strong><span>{t("обновяване на 15 мин.","15-minute refresh")}</span></article>
      <article className="card"><small>{t("АКТИВНИ ПОРЪЧКИ","ACTIVE ORDERS")}</small><strong>18</strong><span>4 {t("линии","lines")}</span></article>
      <article className="card"><small>{t("ОЧАКВАНА ЕНЕРГИЯ УТРЕ","EXPECTED ENERGY TOMORROW")}</small><strong>3.84 MWh</strong><span>+12% vs baseline</span></article>
      <article className="card"><small>{t("ДОВЕРИЕ НА МОДЕЛА","MODEL CONFIDENCE")}</small><strong>94.2%</strong><span>MAE 18.6 kW</span></article>
    </div>
    <div className="erp-main">
      <article className="card erp-orders">
        <PanelTitle eyebrow={t("ПОРЪЧКИ И ЕНЕРГИЕН ОТПЕЧАТЪК","ORDERS & ENERGY SIGNATURE")} title={t("План за следващите 24 часа","Next 24-hour plan")} action={<button className="secondary-btn" onClick={()=>notify(t("ERP планът е синхронизиран","ERP plan synchronised"))}>{t("Синхронизирай","Synchronise")}</button>}/>
        <DataTable headers={["ERP ID",t("Процес","Process"),t("Прозорец","Window"),t("Енергия","Energy"),t("Приоритет","Priority")]} rows={orders}/>
      </article>
      <article className="card erp-forecast">
        <PanelTitle eyebrow={t("ПРОГНОЗА ОТ ERP","ERP-DRIVEN FORECAST")} title={t("Очакван товар по часове","Expected hourly load")}/>
        <div className="erp-bars">{forecast.map((value,i)=><span key={i}><i style={{height:`${value/2.4}px`}} className={i>=7&&i<=18?"peak":""}/><small>{String(i).padStart(2,"0")}</small></span>)}</div>
        <div className="erp-legend"><span><i/>ERP baseline</span><span><i className="peak"/>Production orders</span></div>
      </article>
    </div>
    <div className="erp-bottom">
      <article className="card erp-flow">
        <PanelTitle eyebrow={t("ИНДУСТРИАЛНА ЛОГИКА","INDUSTRIAL LOGIC")} title={t("От поръчка до безопасна команда","From production order to safe command")}/>
        <div><span><i>ERP</i><b>{t("Поръчки и смени","Orders & shifts")}</b></span><em>→</em><span><i>AI</i><b>{t("Прогноза на товара","Load forecast")}</b></span><em>→</em><span><i>¤</i><b>{t("Цена + PV + BESS","Price + PV + BESS")}</b></span><em>→</em><span><i>GX</i><b>{t("Безопасен график","Safe schedule")}</b></span></div>
      </article>
      <article className="card erp-policy">
        <PanelTitle eyebrow={t("ОПЕРАТИВЕН РЕЗЕРВ","OPERATING RESERVE")} title={t("Защита на производството","Production protection")}/>
        <ModeRange label={t("Резерв над ERP прогнозата","Reserve above ERP forecast")} value={reserve} unit="%" min={0} max={30} onChange={setReserve}/>
        <div className="setting-row"><span>{t("При липса на ERP сигнал","When ERP signal is unavailable")}</span><b>{t("Последен план + 18%","Last plan + 18%")}</b></div>
        <div className="setting-row"><span>{t("Крайните срокове","Production deadlines")}</span><b>{t("Никога не се нарушават","Never violated")}</b></div>
      </article>
    </div>
  </section>;
}
