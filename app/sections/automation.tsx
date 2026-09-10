"use client";

import { useEffect, useState } from "react";
import type { UiLanguage } from "../i18n/messages";
import type { BatteryCostSettings } from "./types";
import { marketValues } from "./data";
import { ModeRange, PanelTitle } from "./shared";

function ModeCostAccounting({mode,lang,settings}:{mode:string;lang:UiLanguage;settings:BatteryCostSettings}) {
  const t=(bg:string,en:string)=>lang==="en"?en:bg;
  const nominalCapacity=2;
  const depreciableBase=settings.capex*(1-settings.residual/100);
  const costPerCycle=depreciableBase/Math.max(1,settings.warrantedCycles);
  const straightDaily=depreciableBase/Math.max(1,settings.years*365);
  const maintenanceDaily=settings.capex*settings.maintenance/100/365;
  const profiles=[
    {bg:"Интелигентен хибрид",en:"Smart hybrid",fec:.78,income:186},
    {bg:"Ценови арбитраж",en:"Price arbitrage",fec:1.24,income:268},
    {bg:"Самоконсумация",en:"Self-consumption",fec:.56,income:132},
    {bg:"Zero export",en:"Zero export",fec:.32,income:74},
    {bg:"Peak shaving",en:"Peak shaving",fec:.68,income:164},
    {bg:"Следване на график",en:"Schedule following",fec:.74,income:178},
    {bg:"Резервно захранване",en:"Backup reserve",fec:.18,income:42},
    {bg:"Ръчно управление",en:"Manual control",fec:.40,income:80},
  ].map(item=>{
    const depreciation=settings.method==="usage"?costPerCycle*item.fec:straightDaily;
    const variableCost=item.fec*nominalCapacity*24.8;
    const total=depreciation+maintenanceDaily+variableCost;
    return {...item,depreciation,variableCost,total,net:item.income-total};
  });
  const selected=profiles.find(item=>item.bg===mode)??profiles[0];
  const money=(value:number)=>new Intl.NumberFormat(lang==="en"?"en-GB":"bg-BG",{minimumFractionDigits:2,maximumFractionDigits:2}).format(value);
  return <section className="card mode-cost-accounting" data-no-translate>
    <div className="mode-cost-head"><div><p>{t("РЕЖИМ → ЦИКЛИ → ДМА → НЕТЕН РЕЗУЛТАТ","MODE → CYCLES → DEPRECIATION → NET RESULT")}</p><h2>{t("Дневен разход на батерията по режими","Daily battery cost by operating mode")}</h2><span>{t("Всеки режим прогнозира различен брой еквивалентни цикли. При повече цикли ДМА и променливият разход се увеличават автоматично.","Each mode forecasts a different number of equivalent cycles. More cycles automatically increase depreciation and variable cost.")}</span></div><span className={settings.included?"cost-status active":"cost-status"}><i>{settings.included?"✓":"i"}</i><b>{settings.included?t("ДМА участва в решенията","Depreciation included in decisions"):t("ДМА е само информационно","Depreciation is informational")}</b></span></div>
    <div className="mode-cost-kpis"><span><small>{t("Стойност на актива","Asset value")}</small><strong>{settings.capex.toLocaleString(lang==="en"?"en-GB":"bg-BG")} EUR</strong></span><span><small>{t("Цена на 1 EFC","Cost per EFC")}</small><strong>{money(costPerCycle)} EUR</strong></span><span><small>{t("Прогноза за активния режим","Active-mode forecast")}</small><strong>{selected.fec.toFixed(2)} EFC/{t("ден","day")}</strong></span><span><small>{t("ДМА за деня","Daily depreciation")}</small><strong>{money(selected.depreciation)} EUR</strong></span><span className="mode-cost-total"><small>{t("Общ разход за деня","Total daily cost")}</small><strong>{money(selected.total)} EUR</strong></span></div>
    <div className="mode-cost-formula"><span><small>{t("АКТИВЕН РЕЖИМ","ACTIVE MODE")}</small><strong>{t(selected.bg,selected.en)}</strong></span><b>→</b><span><small>{t("ПРОГНОЗНИ ЦИКЛИ","FORECAST CYCLES")}</small><strong>{selected.fec.toFixed(2)} EFC</strong></span><b>×</b><span><small>{t("ЦЕНА НА ЦИКЪЛ","COST PER CYCLE")}</small><strong>{money(costPerCycle)} EUR</strong></span><b>=</b><span className="mode-dma"><small>{t("ДМА ЗА ДЕНЯ","DAILY DEPRECIATION")}</small><strong>{money(selected.depreciation)} EUR</strong></span></div>
    <div className="mode-cost-table"><div className="mode-cost-row head"><span>{t("Режим","Mode")}</span><span>EFC/{t("ден","day")}</span><span>{t("ДМА","Depreciation")}</span><span>{t("Загуби + тарифи","Losses + tariffs")}</span><span>{t("Общ разход","Total cost")}</span><span>{t("Очаквана полза","Expected benefit")}</span><span>{t("Нетен резултат","Net result")}</span></div>{profiles.map(item=><div key={item.bg} className={item.bg===mode?"mode-cost-row selected":"mode-cost-row"}><span><i>{item.bg===mode?"●":"○"}</i><b>{t(item.bg,item.en)}</b></span><span>{item.fec.toFixed(2)}</span><span>{money(item.depreciation)} EUR</span><span>{money(item.variableCost)} EUR</span><span>{money(item.total)} EUR</span><span>+{money(item.income)} EUR</span><span className={item.net>=0?"positive":"negative"}>{item.net>=0?"+":""}{money(item.net)} EUR</span></div>)}</div>
    <p className="mode-cost-note">{t(`Пример: при ${selected.fec.toFixed(2)} EFC режимът начислява ${money(selected.depreciation)} EUR ДМА. Ако прогнозните цикли се удвоят, usage-based ДМА също се удвоява. Реално отчетените ${settings.todayCycles.toFixed(2)} EFC се използват в дневния отчет на батерията.`,`Example: at ${selected.fec.toFixed(2)} EFC the mode allocates ${money(selected.depreciation)} EUR depreciation. If forecast cycles double, usage-based depreciation doubles as well. The actual ${settings.todayCycles.toFixed(2)} EFC is used in the battery daily report.`)}</p>
  </section>;
}

export function Automation({notify,site,lang,batteryCost}:{notify:(v:string)=>void;site:string;lang:UiLanguage;batteryCost:BatteryCostSettings}) {
  const [mode,setMode] = useState("Интелигентен хибрид");
  const [optimised,setOptimised] = useState(false);
  const [buy,setBuy] = useState(105);
  const [sell,setSell] = useState(195);
  const [reserve,setReserve] = useState(20);
  const [targetSoc,setTargetSoc] = useState(85);
  const [forecastHorizon,setForecastHorizon] = useState(6);
  const [exportLimit,setExportLimit] = useState(0);
  const [peakTarget,setPeakTarget] = useState(620);
  const [gridImport,setGridImport] = useState(40);
  const [scheduleTolerance,setScheduleTolerance] = useState(25);
  const [manualTtl,setManualTtl] = useState(15);
  const [rules,setRules] = useState([true,true,true,true,true,true]);
  const t=(bg:string,en:string)=>lang==="en"?en:bg;
  const applyLogicTuning=()=>{setMode("Интелигентен хибрид");setReserve(25);setTargetSoc(54);setRules([true,true,true,true,true,true]);setOptimised(true);notify(t("Автоматичната логика е синхронизирана с прогнозата","Automatic logic synchronised with the forecast"));};
  const toggleRule=(i:number)=>setRules(r=>r.map((v,n)=>n===i?!v:v));
  const ruleData = [
    ["Ниска пазарна цена","Цена ≤ праг за покупка","Зареждай батерията до 85%"],
    ["Висока пазарна цена","Цена ≥ праг за продажба","Разреждай до минималния SOC"],
    ["Прогнозиран PV излишък","PV − товар > 80 kW за следващите 2 ч.","Освободи капацитет в батерията"],
    ["Прогнозиран товарен пик","Товар > 620 kW в следващите 60 мин.","Запази енергия за peak shaving"],
    ["Ограничение на мрежата","Поток към мрежата > 780 kW","Ограничи PV или зареди BESS"],
    ["3-дневна метео прогноза","PV прогноза за утре < 60% или валеж > 55%","Коригирай SOC целта и day-ahead графика"],
  ];
  const modeProfiles = {
    "Интелигентен хибрид": {icon:"◎",goal:"Максимална обща стойност",description:"Комбинира пазарна цена, текущ поток, PV и товарова прогноза, SOC и всички технически ограничения.",signals:["Цена 35%","Прогноза 30%","Поток 20%","Резерв 15%"],inputs:["IBEX цена","PV + товар","SOC + BMS"],decision:"Оптимизирай целия хоризонт",result:"Продай 83.2 kW · запази 54% SOC"},
    "Ценови арбитраж": {icon:"¤",goal:"Печалба от ценови разлики",description:"Зарежда в евтините часове и разрежда при висок пазарен сигнал, след отчитане на загубите и амортизацията.",signals:["Цена 65%","Прогноза 20%","SOC 15%"],inputs:["Цена купува","Цена продава","Цена на цикъл"],decision:"Провери нетния спред",result:`Разряд над ${sell} €/MWh`},
    "Самоконсумация": {icon:"☀",goal:"Минимална покупка от мрежата",description:"Използва първо PV за товара, съхранява излишъка и разрежда батерията при недостиг.",signals:["PV излишък 45%","Товар 35%","SOC 20%"],inputs:["PV производство","Текущ товар","Мрежов внос"],decision:"Следвай локалния баланс",result:`Ограничи вноса до ${gridImport} kW`},
    "Zero export": {icon:"⌁",goal:"Без отдаване към мрежата",description:"Поддържа потока в точката на присъединяване под зададения лимит чрез BESS и ограничаване на инверторите.",signals:["PCC поток 60%","BESS 25%","PV 15%"],inputs:["PCC електромер","BESS капацитет","PV мощност"],decision:"Компенсирай за секунди",result:`Износ ≤ ${exportLimit} kW`},
    "Peak shaving": {icon:"⌂",goal:"Ограничаване на товарния пик",description:"Предзарежда батерията и покрива пиковете, за да не се надвишава договорената мощност.",signals:["Товар 50%","Прогноза 30%","SOC 20%"],inputs:["Текущ товар","Прогноза за пик","Договорен лимит"],decision:"Разреждай над лимита",result:`Целеви пик ${peakTarget} kW`},
    "Следване на график": {icon:"▦",goal:"Изпълнение на 15-минутния график",description:"Следва одобрения day-ahead график към търговеца и минимизира отклонението във всеки от 96-те интервала.",signals:["График 50%","PCC 30%","Небаланс 20%"],inputs:["Версия на графика","PCC електромер","Цена небаланс"],decision:"Компенсирай отклонението",result:`Толеранс ±${scheduleTolerance} kW`},
    "Резервно захранване": {icon:"◒",goal:"Гарантиран енергиен резерв",description:"Запазва зададен SOC за прекъсване на мрежата или предварително планиран прозорец с критичен товар.",signals:["SOC 55%","Прогноза 25%","Критичен товар 20%"],inputs:["SOC + BMS","Прогноза 72 h","Критични товари"],decision:"Не използвай резерва",result:`Запази ${targetSoc}% SOC`},
    "Ръчно управление": {icon:"✥",goal:"Временно операторско управление",description:"Позволява защитена команда с кратък TTL, роля и audit причина, без да изключва BMS или Edge защитите.",signals:["Оператор 50%","TTL 30%","Safety 20%"],inputs:["Желана мощност","Роля и причина","Safety envelope"],decision:"Изпълни до изтичане",result:`TTL ${manualTtl} s`},
  };
  const profile = modeProfiles[mode as keyof typeof modeProfiles];
  return <>
    <section className="logic-status card"><div className="logic-engine"><i>⌘</i><div><p>EMS РЕШАВАЩ МОДУЛ</p><h2>Автоматичната логика е активна</h2><span><b className="live-dot"/> Преизчисляване на всеки 5 минути · последно 14:30</span></div></div><div className="current-decision"><span>Текущо решение</span><strong>Разряд към мрежата</strong><b>83.2 kW</b><small>Увереност 94%</small></div></section>
    <section className="logic-message-grid" data-no-translate><article className="section-message success"><i>✓</i><div><small>{t("2 ЗЕЛЕНИ ПРЕПОРЪКИ · АВТОМАТИЧНА ОПТИМИЗАЦИЯ","2 GREEN RECOMMENDATIONS · AUTOMATIC OPTIMISATION")}</small><strong>{optimised?t("Логиката е синхронизирана с прогнозата","Logic is synchronised with the forecast"):t("Автоматичният режим може да изпълнява графика по-добре","Automatic mode can execute the schedule more effectively")}</strong><p>{t("Оптимизаторът може да подобри очаквания резултат с 6.8% чрез динамичен SOC резерв и по-ранна подготовка за вечерния ценови пик.","The optimiser can improve the expected result by 6.8% using a dynamic SOC reserve and earlier preparation for the evening price peak.")}</p></div><button disabled={optimised} onClick={applyLogicTuning}>{optimised?t("Приложено","Applied"):t("Приложи безопасната настройка","Apply safe tuning")}</button></article><article className="logic-mismatch"><i>!</i><div><small>{t("ОТКРИТО НЕСЪОТВЕТСТВИЕ","MISMATCH DETECTED")}</small><strong>{t("Фиксираното правило допуска разряд до 20% SOC","The fixed rule allows discharge down to 20% SOC")}</strong><p>{t("Day-ahead прогнозата изисква 54% резерв за следващия пик. Автоматичният режим ще даде приоритет на прогнозния хоризонт и всички BMS ограничения.","The day-ahead forecast requires a 54% reserve for the next peak. Automatic mode will prioritise the forecast horizon and every BMS constraint.")}</p></div></article></section>
    <section className="decision-flow card"><PanelTitle eyebrow="ВХОДОВЕ → РЕШЕНИЕ → КОМАНДИ" title="Логика в реално време"/><div className="logic-flow"><LogicSource icon="¤" title="Пазарна цена" value="109.73 €/MWh" state="Над праг за продажба"/><LogicSource icon="⌁" title="Текущ поток" value="+124.3 kW PV излишък" state="Има свободна енергия"/><LogicSource icon="☁" title="Прогноза 3 дни" value="Време + PV + товар" state="Автоматично обновяване"/><div className="decision-box"><i>⌘</i><span>ОПТИМИЗАТОР</span><strong>Продавай сега</strong><small>Запази 54% SOC за пика</small></div><div className="command-stack"><span><i>▣</i><b>BESS</b><strong>−83.2 kW</strong></span><span><i>ϟ</i><b>EV парк</b><strong>лимит 32 kW</strong></span><span><i>☀</i><b>Инвертори</b><strong>без лимит</strong></span></div></div></section>
    <section className="mode-workbench card">
      <PanelTitle eyebrow="РЕЖИМИ НА УПРАВЛЕНИЕ" title="Изберете режим, за да видите неговите настройки" action={<span className="pill green">● {mode}</span>}/>
      <div className="mode-cards">{Object.entries(modeProfiles).map(([name,item],i)=><button key={name} className={mode===name?`mode-card active tone-${i}`:`mode-card tone-${i}`} onClick={()=>setMode(name)}><i>{item.icon}</i><span><strong>{name}</strong><small>{item.goal}</small></span><em>{mode===name?"Активен":"Преглед"}</em></button>)}</div>
      <div className="mode-detail">
        <article className="mode-map"><div className="mode-intro"><i>{profile.icon}</i><div><p>ЦЕЛ НА РЕЖИМА</p><h3>{profile.goal}</h3><span>{profile.description}</span></div></div><div className="mode-path"><div><small>ВХОДНИ СИГНАЛИ</small>{profile.inputs.map(x=><span key={x}>{x}</span>)}</div><b>→</b><div className="mode-decision"><small>РЕШЕНИЕ</small><strong>{profile.decision}</strong></div><b>→</b><div><small>ИЗХОД</small><span className="mode-result">{profile.result}</span></div></div><div className="signal-weights">{profile.signals.map((x,i)=><span key={x}><i style={{width:`${[92,76,58,42][i]}%`}}/><b>{x}</b></span>)}</div></article>
        <article className="mode-settings"><h3>Настройки за „{mode}“</h3>{mode==="Интелигентен хибрид"&&<><ModeRange label="Хоризонт на прогнозата" value={forecastHorizon} unit="ч." min={1} max={72} onChange={setForecastHorizon}/><ModeRange label="Минимален резерв" value={reserve} unit="% SOC" min={10} max={50} onChange={setReserve}/><ModeRange label="Целеви SOC преди пик" value={targetSoc} unit="%" min={50} max={100} onChange={setTargetSoc}/></>}{mode==="Ценови арбитраж"&&<><ModeRange label="Зареждай под" value={buy} unit="€/MWh" min={40} max={180} onChange={setBuy}/><ModeRange label="Продавай над" value={sell} unit="€/MWh" min={120} max={300} onChange={setSell}/><ModeRange label="Цел след зареждане" value={targetSoc} unit="% SOC" min={50} max={100} onChange={setTargetSoc}/><div className="price-window"><span>Нетен ценови прозорец</span><strong>{sell-buy} €/MWh</strong></div></>}{mode==="Самоконсумация"&&<><ModeRange label="Минимален резерв" value={reserve} unit="% SOC" min={10} max={50} onChange={setReserve}/><ModeRange label="Допустим внос" value={gridImport} unit="kW" min={0} max={200} onChange={setGridImport}/><ModeRange label="Цел след PV заряд" value={targetSoc} unit="% SOC" min={60} max={100} onChange={setTargetSoc}/></>}{mode==="Zero export"&&<><ModeRange label="Допустим износ" value={exportLimit} unit="kW" min={0} max={50} onChange={setExportLimit}/><ModeRange label="Резерв за компенсация" value={reserve} unit="% SOC" min={10} max={50} onChange={setReserve}/><div className="setting-choice"><span>При пълна батерия</span><div><button className="active">Ограничи PV</button><button>EV товар</button></div></div></>}{mode==="Peak shaving"&&<><ModeRange label="Целеви товарен пик" value={peakTarget} unit="kW" min={300} max={780} onChange={setPeakTarget}/><ModeRange label="Хоризонт за предзаряд" value={forecastHorizon} unit="ч." min={1} max={72} onChange={setForecastHorizon}/><ModeRange label="Минимален резерв" value={reserve} unit="% SOC" min={10} max={60} onChange={setReserve}/></>}{mode==="Следване на график"&&<><ModeRange label="Допустимо отклонение" value={scheduleTolerance} unit="kW" min={0} max={100} onChange={setScheduleTolerance}/><ModeRange label="Тежест на небаланса" value={sell} unit="€/MWh" min={0} max={300} onChange={setSell}/><div className="setting-row"><span>Активен график</span><b>96 × 15 min · v12</b></div></>}{mode==="Резервно захранване"&&<><ModeRange label="Гарантиран резерв" value={targetSoc} unit="% SOC" min={20} max={100} onChange={setTargetSoc}/><ModeRange label="Прогнозен хоризонт" value={forecastHorizon} unit="ч." min={1} max={72} onChange={setForecastHorizon}/><div className="setting-row"><span>Критични товари</span><b>Приоритет 1</b></div></>}{mode==="Ръчно управление"&&<><ModeRange label="Валидност на командата" value={manualTtl} unit="сек." min={5} max={60} onChange={setManualTtl}/><ModeRange label="Минимален резерв" value={reserve} unit="% SOC" min={10} max={60} onChange={setReserve}/><div className="setting-row"><span>Изисквана роля</span><b>Energy manager</b></div></>}<button className="primary-btn" onClick={()=>notify(`Създадена е чернова за „${mode}“. Нужни са проверка, симулация и активиране.`)}>Запази като чернова</button></article>
      </div>
    </section>
    <ModeCostAccounting mode={mode} lang={lang} settings={batteryCost}/>
    <WeatherLogic notify={notify} site={site}/>
    <article className="card rule-engine"><PanelTitle eyebrow="RULE ENGINE" title="Активни правила" action={<button className="primary-btn" onClick={()=>notify("Логиката и ценовите прагове са запазени")}>Запази логиката</button>}/><div className="rule-list">{ruleData.map((r,i)=><div className={rules[i]?"rule-row":"rule-row disabled"} key={r[0]}><button className={rules[i]?"toggle on":"toggle"} onClick={()=>toggleRule(i)} aria-label={`${r[0]} – ${rules[i]?"изключи":"включи"}`}/><span><strong>{r[0]}</strong><small>{r[1]}</small></span><i>→</i><b>{r[2]}</b></div>)}</div></article>
    <section className="safety-band"><div><i>✓</i><span><strong>Safety constraints винаги имат приоритет</strong><small>BMS граници · минимален SOC · мрежова защита · ramp rate · комуникационен watchdog</small></span></div><button onClick={()=>notify("Всички защити са активни")}>5 / 5 активни</button></section>
  </>;
}

type ForecastDay = { date:string; code:number; max:number; min:number; rain:number; sunshine:number; radiation:number; pv:number; };

function WeatherLogic({notify,site}:{notify:(v:string)=>void;site:string}) {
  const [days,setDays] = useState<ForecastDay[]>([]);
  const [current,setCurrent] = useState<{temperature:number;cloud:number;code:number}|null>(null);
  const [updated,setUpdated] = useState("");
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState(false);
  const [refresh,setRefresh] = useState(0);
  const locations:Record<string,{lat:number;lon:number;city:string;capacity:number}>={"Solar Park East":{lat:42.6977,lon:23.3219,city:"София",capacity:.5},"Logistics Hub Plovdiv":{lat:42.1354,lon:24.7453,city:"Пловдив",capacity:.22},"Factory Varna":{lat:43.2141,lon:27.9147,city:"Варна",capacity:.32}};
  const location=locations[site]||locations["Solar Park East"];
  useEffect(()=>{
    let cancelled=false;
    const load=async()=>{
      setLoading(true); setError(false);
      try {
        const response=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,weather_code,cloud_cover&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunshine_duration,shortwave_radiation_sum&timezone=Europe%2FSofia&forecast_days=3`,{cache:"no-store"});
        if(!response.ok) throw new Error("forecast unavailable");
        const data=await response.json();
        if(cancelled) return;
        const forecast:ForecastDay[]=data.daily.time.map((date:string,i:number)=>({date,code:data.daily.weather_code[i],max:Math.round(data.daily.temperature_2m_max[i]),min:Math.round(data.daily.temperature_2m_min[i]),rain:Math.round(data.daily.precipitation_probability_max[i]),sunshine:Math.round(data.daily.sunshine_duration[i]/360)/10,radiation:data.daily.shortwave_radiation_sum[i],pv:Math.round((data.daily.shortwave_radiation_sum[i]/3.6)*location.capacity*0.82*100)/100}));
        setDays(forecast);
        setCurrent({temperature:Math.round(data.current.temperature_2m),cloud:Math.round(data.current.cloud_cover),code:data.current.weather_code});
        setUpdated(new Intl.DateTimeFormat("bg-BG",{hour:"2-digit",minute:"2-digit",day:"2-digit",month:"2-digit"}).format(new Date()));
      } catch { if(!cancelled){setError(true);setDays([]);} }
      finally { if(!cancelled)setLoading(false); }
    };
    void load();
    const timer=window.setInterval(load,30*60*1000);
    return()=>{cancelled=true;window.clearInterval(timer);};
  },[refresh,location.lat,location.lon,location.capacity]);
  const weather=(code:number)=>code===0?["☀","Ясно"]:code<=2?["🌤","Разкъсана облачност"]:code===3?["☁","Облачно"]:code<=48?["≋","Мъгла"]:code<=67?["☂","Дъжд"]:code<=77?["❄","Сняг"]:code<=82?["☔","Превалявания"]:["⚡","Буря"];
  const tomorrow=days[1]||days[0];
  const totalPv=days.reduce((sum,d)=>sum+d.pv,0);
  const recommendation=!tomorrow?"Очакване на актуална прогноза":tomorrow.radiation>20?"Освободи капацитет в BESS преди PV пика":tomorrow.rain>55?"Запази по-висок SOC за слаб PV ден":"Балансиран заряд по цена и PV прогноза";
  return <article className="card weather-logic"><PanelTitle eyebrow="ЖИВА ИНТЕГРАЦИЯ С ВРЕМЕТО" title="3-дневна прогноза за PV оптимизация" action={<div className="weather-source"><i className={error?"source-dot error":"source-dot"}/><span>{error?"Няма връзка":updated?`Open-Meteo · ${updated}`:"Свързване..."}</span><button onClick={()=>setRefresh(x=>x+1)} aria-label="Обнови прогнозата">↻</button></div>}/><div className="weather-logic-grid"><section className="forecast-days">{loading&&days.length===0&&[0,1,2].map(i=><div className="forecast-day loading" key={i}><span>Зареждане...</span></div>)}{error&&<div className="weather-error"><i>!</i><strong>Прогнозата временно не е достъпна</strong><button className="secondary-btn" onClick={()=>setRefresh(x=>x+1)}>Опитай отново</button></div>}{days.map((day,i)=>{const [icon,label]=weather(day.code);return <div className="forecast-day" key={day.date}><div><span>{i===0?"Днес":i===1?"Утре":"След 2 дни"}</span><small>{new Intl.DateTimeFormat("bg-BG",{weekday:"short",day:"2-digit",month:"2-digit"}).format(new Date(`${day.date}T12:00:00`))}</small></div><i>{icon}</i><strong>{day.max}° <small>{day.min}°</small></strong><p>{label}</p><div className="weather-metrics"><span><b>☂ {day.rain}%</b><small>валеж</small></span><span><b>☀ {day.sunshine} h</b><small>слънце</small></span><span><b>{day.pv} MWh</b><small>PV прогноза</small></span></div><div className="solar-index"><i style={{width:`${Math.min(100,Math.round(day.radiation/28*100))}%`}}/></div></div>})}</section><aside className="forecast-impact"><div className="current-weather"><i>{current?weather(current.code)[0]:"◌"}</i><span><small>Сега · {site} / {location.city}</small><strong>{current?`${current.temperature}°C · ${current.cloud}% облачност`:"Изчакване на данни"}</strong></span></div><p>ВЛИЯНИЕ ВЪРХУ EMS</p><div className="impact-kpis"><span><small>PV · следващи 3 дни</small><strong>{days.length?`${totalPv.toFixed(2)} MWh`:"—"}</strong></span><span><small>Прогноза за утре</small><strong>{tomorrow?`${tomorrow.pv.toFixed(2)} MWh · ${tomorrow.rain}% валеж`:"—"}</strong></span></div><div className="forecast-decision"><i>⌘</i><span><small>Препоръка за графика</small><strong>{recommendation}</strong></span></div><ul><li>PV прогнозата участва в day-ahead графика към търговеца.</li><li>SOC целта се коригира преди облачни и силно слънчеви дни.</li><li>Моделът използва {Math.round(location.capacity*1000)} kWp и PR 82%; обновява се на 30 мин.</li></ul><button className="primary-btn" disabled={!days.length} onClick={()=>notify("Прогнозата е приложена към оптимизационния хоризонт")}>Приложи към оптимизатора</button></aside></div><ForwardPlanner tomorrow={tomorrow} notify={notify}/></article>;
}

function ForwardPlanner({tomorrow,notify}:{tomorrow?:ForecastDay;notify:(v:string)=>void}) {
  const [solarThreshold,setSolarThreshold] = useState(65);
  const [reserveTarget,setReserveTarget] = useState(80);
  const [buyThreshold,setBuyThreshold] = useState(120);
  const [sellThreshold,setSellThreshold] = useState(205);
  const [gridCharge,setGridCharge] = useState(true);
  const solarIndex=tomorrow?Math.min(100,Math.round(tomorrow.radiation/28*100)):0;
  const lowSolar=Boolean(tomorrow&&solarIndex<solarThreshold);
  const effectiveReserve=lowSolar?reserveTarget:30;
  const plan=marketValues.map((price,hour)=>{if(!tomorrow)return"hold";if(lowSolar&&gridCharge&&price<=buyThreshold)return"grid";if(!lowSolar&&hour>=10&&hour<=15)return"solar";if(!lowSolar&&price>=sellThreshold)return"sell";return"hold";});
  const buyHours=plan.filter(x=>x==="grid").length;
  const estimatedGridEnergy=buyHours*.25;
  const estimatedCost=plan.reduce((sum,action,i)=>sum+(action==="grid"?marketValues[i]*.25:0),0);
  return <section className="forward-planner"><div className="planner-title"><div><p>DAY-AHEAD ПЛАНИРОВЧИК</p><h3>Логика за утрешния ден · 96 × 15 минути</h3><span>Планът се преизчислява при нова прогноза за време, PV, товар или IBEX цена.</span></div><div className={lowSolar?"planner-trigger on":"planner-trigger"}><i>{lowSolar?"!":"✓"}</i><span><small>Условие „слабо слънце“</small><strong>{tomorrow?`${solarIndex}% потенциал · праг ${solarThreshold}%`:"Изчакване на прогноза"}</strong></span></div></div><div className="planner-body"><div className="planner-settings"><ModeRange label="Праг за слабо слънце" value={solarThreshold} unit="%" min={20} max={95} onChange={setSolarThreshold}/><ModeRange label="SOC цел при слаб PV ден" value={reserveTarget} unit="%" min={50} max={95} onChange={setReserveTarget}/><ModeRange label="Купувай от мрежата под" value={buyThreshold} unit="€/MWh" min={40} max={180} onChange={setBuyThreshold}/><ModeRange label="Продавай над" value={sellThreshold} unit="€/MWh" min={150} max={300} onChange={setSellThreshold}/><div className="grid-charge-toggle"><span><strong>Зареждане от външната мрежа</strong><small>Само при слаб PV ден и цена под прага</small></span><button className={gridCharge?"toggle on":"toggle"} onClick={()=>setGridCharge(!gridCharge)} aria-label="Зареждане от външната мрежа"/></div></div><div className="planner-output"><div className="plan-summary"><span><small>PV утре</small><strong>{tomorrow?`${tomorrow.pv.toFixed(2)} MWh`:`—`}</strong></span><i>→</i><span><small>Минимална SOC цел</small><strong>{effectiveReserve}%</strong></span><i>→</i><span><small>Покупка от мрежата</small><strong>{lowSolar&&gridCharge?`${estimatedGridEnergy.toFixed(2)} MWh`:`Не е нужна`}</strong></span></div><div className="day-plan"><div className="plan-zero"/>{plan.map((action,hour)=><div className={`plan-hour ${action}`} key={hour} title={`${String(hour).padStart(2,"0")}:00 · ${marketValues[hour]} €/MWh · ${action}`}><span style={{height:`${Math.max(10,marketValues[hour]*.22)}px`}}/><em>{hour%3===0?String(hour).padStart(2,"0"):""}</em></div>)}</div><div className="plan-legend"><span className="grid-key">Мрежов заряд</span><span className="solar-plan-key">PV заряд</span><span className="sell-key">Разряд / продажба</span><span className="hold-key">Задържане</span></div><div className={lowSolar?"planner-decision warning":"planner-decision"}><i>⌘</i><span><small>Генерирано решение</small><strong>{!tomorrow?"Изчакване на метеорологични данни":lowSolar?gridCharge&&buyHours>0?`Слаб PV ден: запази ${reserveTarget}% SOC и купи в ${buyHours} евтини часа.`:`Слаб PV ден: запази ${reserveTarget}% SOC без покупка от мрежата.`:`Добра PV прогноза: зареди от слънцето и допускай арбитраж над ${sellThreshold} €/MWh.`}</strong></span><b>{lowSolar&&gridCharge?`≈ ${estimatedCost.toFixed(0)} €`:"Автоматично"}</b></div><button className="primary-btn" disabled={!tomorrow} onClick={()=>notify("Day-ahead логиката е записана и графикът е преизчислен")}>Запази логиката и преизчисли графика</button></div></div></section>;
}

function LogicSource({icon,title,value,state}:{icon:string;title:string;value:string;state:string}) { return <div className="logic-source"><i>{icon}</i><span><small>{title}</small><strong>{value}</strong><em>{state}</em></span></div>; }
