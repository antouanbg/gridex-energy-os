"use client";

import { useState } from "react";

const navItems = [
  { id: "overview", label: "Преглед", icon: "⌂" },
  { id: "sites", label: "Обекти", icon: "◇" },
  { id: "assets", label: "Енергийни активи", icon: "▦" },
  { id: "battery", label: "Батерия", icon: "▣" },
  { id: "schedule", label: "Графици", icon: "▤" },
  { id: "market", label: "Пазар", icon: "↗" },
  { id: "automation", label: "Логика и режими", icon: "⌘" },
  { id: "balance", label: "Балансиране", icon: "≋" },
  { id: "devices", label: "Устройства", icon: "⊞" },
  { id: "alarms", label: "Аларми", icon: "△" },
];

const titles: Record<string, [string, string]> = {
  overview: ["Solar Park East", "ПОРТФОЛИО / СОФИЯ"],
  sites: ["Моите обекти", "ПОРТФОЛИО / 6 ОБЕКТА"],
  assets: ["Енергийни активи", "SOLAR PARK EAST / АКТИВИ"],
  battery: ["Батерия и оптимизация", "SOLAR PARK EAST / BESS"],
  schedule: ["Енергиен график", "SOLAR PARK EAST / 21 АВГУСТ"],
  market: ["Пазар и прогнози", "БЪЛГАРИЯ / IBEX ДЕН НАПРЕД"],
  automation: ["Логика и режими", "EMS / АВТОМАТИЗАЦИЯ"],
  balance: ["Балансираща група", "TECHNOSUN / 21 АВГУСТ"],
  devices: ["Устройства и SCADA", "SOLAR PARK EAST / 12 УСТРОЙСТВА"],
  alarms: ["Аларми и събития", "ПОРТФОЛИО / АКТИВНИ"],
};

const marketValues = [116, 104, 96, 88, 93, 118, 162, 188, 174, 148, 132, 126, 119, 128, 147, 176, 215, 242, 228, 204, 187, 164, 143, 126];
const scheduleValues = [-20, -28, -34, -30, -18, 0, 18, 30, 22, 8, 0, 0, -12, -25, -38, -46, 0, 30, 44, 50, 34, 18, 0, -10];

export default function Home() {
  const [view, setView] = useState("overview");
  const [auto, setAuto] = useState(true);
  const [period, setPeriod] = useState("Днес");
  const [site, setSite] = useState("Solar Park East");
  const [toast, setToast] = useState("");

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const navigate = (id: string) => {
    setView(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => navigate("overview")} aria-label="TechnoSun Energy OS – начало">
          <span>TS</span><div>TECHNOSUN<small>ENERGY OS</small></div>
        </button>
        <nav aria-label="Основна навигация">
          {navItems.map((item) => (
            <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => navigate(item.id)}>
              <i>{item.icon}</i><span>{item.label}</span>{item.id === "alarms" && <em>3</em>}
            </button>
          ))}
        </nav>
        <div className="gateway"><span className="live-dot"/><div><strong>Edge Gateway</strong><small>Онлайн · преди 8 сек.</small></div></div>
        <div className="profile"><span>АК</span><div><strong>Антон Колев</strong><small>Администратор</small></div><b>⋮</b></div>
      </aside>

      <section className="content">
        <header>
          <div><p className="eyebrow">{titles[view][1]}</p><h1>{view === "overview" ? site : titles[view][0]}</h1></div>
          <div className="header-actions">
            {view !== "sites" && <select value={site} onChange={(e) => setSite(e.target.value)} aria-label="Избран обект"><option>Solar Park East</option><option>Logistics Hub Plovdiv</option><option>Factory Varna</option></select>}
            <select value={period} onChange={(e) => setPeriod(e.target.value)} aria-label="Период"><option>Днес</option><option>Тази седмица</option><option>Този месец</option></select>
            <button className="icon-btn" aria-label="Известия" onClick={() => navigate("alarms")}>△<em>3</em></button>
          </div>
        </header>

        {view === "overview" && <Overview auto={auto} setAuto={setAuto} navigate={navigate} notify={notify}/>} 
        {view === "sites" && <Sites setSite={setSite} navigate={navigate}/>} 
        {view === "assets" && <Assets navigate={navigate}/>} 
        {view === "battery" && <Battery auto={auto} setAuto={setAuto} notify={notify}/>} 
        {view === "schedule" && <Schedule notify={notify}/>} 
        {view === "market" && <Market/>} 
        {view === "automation" && <Automation notify={notify}/>} 
        {view === "balance" && <Balance/>} 
        {view === "devices" && <Devices notify={notify}/>} 
        {view === "alarms" && <Alarms notify={notify}/>} 
      </section>
      {toast && <div className="toast"><i>✓</i>{toast}</div>}
    </main>
  );
}

function PanelTitle({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) {
  return <div className="card-title"><div><p>{eyebrow}</p><h2>{title}</h2></div>{action}</div>;
}

function Overview({ auto, setAuto, navigate, notify }: { auto: boolean; setAuto: (v:boolean)=>void; navigate:(v:string)=>void; notify:(v:string)=>void }) {
  return <>
    <div className="status-strip">
      <span><i className="live-dot"/>Всички системи работят нормално</span>
      <span>Последни данни <b>14:32:08</b></span>
      <button onClick={() => setAuto(!auto)}><i className={auto ? "toggle on" : "toggle"}/><span><strong>{auto ? "Автоматичен режим" : "Ръчен режим"}</strong><small>Оптимизация по пазарна цена</small></span></button>
    </div>
    <section className="hero-grid">
      <article className="flow-card card">
        <PanelTitle eyebrow="ЕНЕРГИЕН ПОТОК" title="В реално време" action={<span className="pill green">● Оптимално</span>}/>
        <div className="flow">
          <div className="flow-node solar"><i>☀</i><strong>248.6 <small>kW</small></strong><span>Фотоволтаици</span></div>
          <div className="flow-line horizontal left"><b>248.6 kW</b></div>
          <div className="flow-center"><i>⚡</i><span>EMS</span></div>
          <div className="flow-line horizontal right"><b>83.2 kW</b></div>
          <div className="flow-node grid"><i>⌁</i><strong>83.2 <small>kW</small></strong><span>Към мрежата</span></div>
          <div className="flow-line down"><b>41.1 kW</b></div>
          <div className="flow-node battery"><i>▯</i><strong>72%</strong><span>Батерия · зарежда</span></div>
          <div className="flow-line down right-down"><b>124.3 kW</b></div>
          <div className="flow-node load"><i>⌂</i><strong>124.3 <small>kW</small></strong><span>Консумация</span></div>
        </div>
      </article>
      <aside className="summary card">
        <PanelTitle eyebrow="ДНЕШЕН РЕЗУЛТАТ" title="21 август 2026" action={<button onClick={() => notify("Отчетът е подготвен за изтегляне")}>•••</button>}/>
        <div className="profit"><span>Нетен резултат</span><strong>+1 842.60 лв.</strong><small>↑ 18.4% спрямо прогнозата</small></div>
        <div className="summary-row"><span>Спестени разходи<small>Собствено потребление</small></span><b>684.20 лв.</b></div>
        <div className="summary-row"><span>Приход от продажба<small>1.26 MWh към мрежата</small></span><b>1 296.80 лв.</b></div>
        <div className="summary-row"><span>Разход за покупка<small>0.42 MWh от мрежата</small></span><b className="negative">−138.40 лв.</b></div>
        <button className="details" onClick={() => navigate("balance")}>Виж подробен отчет →</button>
      </aside>
    </section>
    <section className="kpis">
      <Metric label="PV производство" value="2.84" unit="MWh" badge="↑ 8.2%" type="spark solar-spark"/>
      <Metric label="Консумация" value="1.92" unit="MWh" badge="↓ 3.1%" type="spark load-spark"/>
      <Metric label="Състояние на батерията" value="72" unit="% SOC" badge="SOH 98%" type="charge"/>
      <Metric label="Цена в момента" value="214.62" unit="лв./MWh" badge="Висока" type="price"/>
    </section>
    <section className="lower-grid">
      <article className="card chart-card"><PanelTitle eyebrow="МОЩНОСТ И ПРОГНОЗА" title="Днешен профил" action={<div className="legend"><span className="green-key">PV</span><span className="purple-key">Товар</span></div>}/><AreaChart/></article>
      <article className="card activity-card"><PanelTitle eyebrow="ПОСЛЕДНИ ДЕЙСТВИЯ" title="Дневник на системата"/><Activity icon="↗" title="Продажба към мрежата" note="83.2 kW · автоматична команда" time="14:31"/><Activity icon="▣" title="SOC достигна 72%" note="Зареждането е ограничено" time="14:18"/><Activity icon="✓" title="Графикът е приет" note="IBEX ден напред · 24 интервала" time="13:42"/><button className="details" onClick={() => navigate("alarms")}>Всички събития →</button></article>
    </section>
  </>;
}

function Metric({label,value,unit,badge,type}:{label:string;value:string;unit:string;badge:string;type:string}) {
  return <article className="card metric"><p>{label}<span>{badge}</span></p><strong>{value} <small>{unit}</small></strong>{type === "charge" ? <div className="charge"><i style={{width:"72%"}}/></div> : type === "price" ? <div className="price-note">Продаваме към мрежата</div> : <div className={type}/>}</article>;
}

function AreaChart() {
  const values = [20,18,16,19,28,48,72,92,108,116,124,130,126,118,104,88,70,48,34,28,24,22,20,18];
  return <div className="area-chart" aria-label="Графика на мощността по часове"><div className="chart-grid"/>{values.map((v,i)=><div key={i} className="area-column"><i style={{height:`${v}px`}}/><b style={{height:`${Math.max(12,v*.62)}px`}}/>{i%4===0&&<span>{String(i).padStart(2,"0")}:00</span>}</div>)}</div>;
}

function Activity({icon,title,note,time}:{icon:string;title:string;note:string;time:string}) { return <div className="activity"><i>{icon}</i><span><strong>{title}</strong><small>{note}</small></span><time>{time}</time></div>; }

function Sites({ setSite, navigate }: {setSite:(v:string)=>void;navigate:(v:string)=>void}) {
  const data = [
    ["Solar Park East","София","Онлайн","248.6 kW","72%","+1 842 лв."],
    ["Logistics Hub Plovdiv","Пловдив","Онлайн","86.4 kW","64%","+638 лв."],
    ["Factory Varna","Варна","Онлайн","142.8 kW","81%","+1 104 лв."],
    ["Retail Park Burgas","Бургас","Предупреждение","64.2 kW","49%","+386 лв."],
    ["Warehouse Ruse","Русе","Онлайн","38.9 kW","76%","+214 лв."],
    ["Office Center Sofia","София","Офлайн","—","—","—"],
  ];
  return <><div className="portfolio-summary"><div><span>Обща мощност</span><strong>581 kW</strong></div><div><span>Енергия днес</span><strong>6.42 MWh</strong></div><div><span>Активни батерии</span><strong>5 / 6</strong></div><div><span>Резултат днес</span><strong className="positive">+4 184 лв.</strong></div></div><section className="sites-grid">{data.map((s,i)=><button className="site-card card" key={s[0]} onClick={()=>{setSite(s[0]);navigate("overview")}}><div className="site-visual"><span>{["☀","⌂","▦","◇","▥","□"][i]}</span><em className={s[2] === "Онлайн" ? "online" : s[2] === "Офлайн" ? "offline" : "warning"}>{s[2]}</em></div><h2>{s[0]}</h2><p>{s[1]} · BG</p><div className="site-stats"><span>PV<strong>{s[3]}</strong></span><span>SOC<strong>{s[4]}</strong></span><span>Днес<strong>{s[5]}</strong></span></div></button>)}</section></>;
}

function Battery({auto,setAuto,notify}:{auto:boolean;setAuto:(v:boolean)=>void;notify:(v:string)=>void}) {
  const [strategy,setStrategy] = useState("Ценови арбитраж");
  const [soc,setSoc] = useState(20);
  return <><div className="battery-hero card"><div className="battery-gauge"><div className="gauge-ring"><strong>72%</strong><span>SOC</span></div><p>1.44 MWh налични</p></div><div className="battery-main"><PanelTitle eyebrow="BESS / TESVOLT TPS-E" title="2.0 MWh · 500 kW" action={<span className="pill green">● Отлично състояние</span>}/><div className="battery-values"><div><span>Мощност</span><strong>+41.1 kW</strong><small>Зареждане</small></div><div><span>SOH</span><strong>98.2%</strong><small>Здраве на клетките</small></div><div><span>Температура</span><strong>24.6°C</strong><small>В норма</small></div><div><span>Цикли</span><strong>384</strong><small>от 8 000</small></div></div></div></div><section className="settings-grid"><article className="card settings-panel"><PanelTitle eyebrow="РЕЖИМ НА РАБОТА" title="Стратегия за оптимизация"/><label className="switch-row"><span><strong>Автоматично управление</strong><small>EMS изпълнява оптималния график</small></span><button className={auto?"toggle on":"toggle"} onClick={()=>setAuto(!auto)} aria-label="Автоматично управление"/></label><div className="strategy-list">{["Интелигентен хибрид","Ценови арбитраж","Максимална собствена консумация","Zero export","Peak shaving"].map(s=><button key={s} className={strategy===s?"selected":""} onClick={()=>setStrategy(s)}><i>{strategy===s?"●":"○"}</i><span><strong>{s}</strong><small>{s === "Интелигентен хибрид" ? "Цена + поток + PV и товарова прогноза" : s === "Ценови арбитраж" ? "Купува при ниска и продава при висока цена" : s === "Peak shaving" ? "Ограничава върховото потребление" : "Автоматично управление на енергийния поток"}</small></span></button>)}</div></article><article className="card settings-panel"><PanelTitle eyebrow="ГРАНИЦИ И ЗАЩИТИ" title="Оперативни настройки"/><label className="range-label"><span>Минимален SOC<strong>{soc}%</strong></span><input type="range" min="10" max="50" value={soc} onChange={e=>setSoc(Number(e.target.value))}/><small>Запазен резерв: {(2*soc/100).toFixed(2)} MWh</small></label><div className="setting-row"><span>Максимална мощност заряд</span><b>450 kW</b></div><div className="setting-row"><span>Максимална мощност разряд</span><b>500 kW</b></div><div className="setting-row"><span>Софтуерен предпазител</span><b>780 kW</b></div><button className="primary-btn" onClick={()=>notify("Настройките на батерията са запазени")}>Запази настройките</button></article></section><article className="card command-log"><PanelTitle eyebrow="ИСТОРИЯ НА КОМАНДИТЕ" title="Последни автоматични действия"/><DataTable headers={["Час","Команда","Мощност","Причина","Резултат"]} rows={[["14:31","Продажба","83.2 kW","Висока цена + пик на товара","Изпълнена"],["13:58","Ограничаване","41.1 kW","SOC цел 72%","Изпълнена"],["12:45","Зареждане","126.0 kW","PV излишък + ниска цена","Изпълнена"],["10:15","Zero export","0 kW","Мрежов лимит","Изпълнена"]]}/></article></>;
}

function Schedule({notify}:{notify:(v:string)=>void}) {
  const [editable,setEditable] = useState(scheduleValues);
  const change = (i:number) => setEditable(v=>v.map((x,n)=>n===i?(x>=50?-50:x+10):x));
  return <><div className="schedule-toolbar card"><div><span>Прогнозен резултат</span><strong>+2 146.30 лв.</strong><small>+16.5% спрямо пасивен режим</small></div><div><span>Очакван SOC в 24:00</span><strong>54%</strong><small>Над минималния резерв</small></div><div><span>Статус към оператор</span><strong className="positive">Приет</strong><small>Изпратен в 13:42</small></div><button className="primary-btn" onClick={()=>notify("Графикът е записан и изпратен")}>Запази и изпрати</button></div><article className="card schedule-card"><PanelTitle eyebrow="15-МИНУТЕН ГРАФИК / АГРЕГИРАН ПО ЧАС" title="Заряд и разряд" action={<div className="legend"><span className="green-key">Разряд</span><span className="blue-key">Заряд</span></div>}/><div className="schedule-chart">{editable.map((v,i)=><button key={i} className={v>=0?"discharge":"charging"} onClick={()=>change(i)} title={`${String(i).padStart(2,"0")}:00 · ${v} kW`}><span style={{height:`${Math.abs(v)*1.8}px`}}/><em>{i%3===0?String(i).padStart(2,"0"):""}</em></button>)}<i className="zero-line"/></div><p className="chart-help">Натиснете колона, за да промените мощността. Над линията е разряд, под нея — заряд.</p></article><section className="lower-grid"><article className="card settings-panel"><PanelTitle eyebrow="ПРОГНОЗА" title="Енергия в края на деня"/><div className="forecast-row"><span>PV производство</span><b>4.18 MWh</b></div><div className="forecast-row"><span>Консумация</span><b>2.76 MWh</b></div><div className="forecast-row"><span>Към мрежата</span><b>1.64 MWh</b></div><div className="forecast-row"><span>Загуби</span><b>0.08 MWh</b></div></article><article className="card settings-panel"><PanelTitle eyebrow="ОГРАНИЧЕНИЯ" title="Проверка на графика"/><Check text="BMS лимити"/><Check text="Мрежови лимит 780 kW"/><Check text="Минимален SOC 20%"/><Check text="Налична мощност"/></article></section></>;
}

function Market() {
  return <><section className="kpis market-kpis"><Metric label="IBEX в момента" value="214.62" unit="лв./MWh" badge="↑ 12.8%" type="price"/><Metric label="Цена купува" value="229.40" unit="лв./MWh" badge="с тарифи" type="spark solar-spark"/><Metric label="Цена продава" value="207.80" unit="лв./MWh" badge="нетна" type="spark load-spark"/><Metric label="Небаланс" value="−18.42" unit="лв./MWh" badge="прогноза" type="charge"/></section><article className="card market-chart-card"><PanelTitle eyebrow="IBEX ДЕН НАПРЕД" title="Пазарна цена по часове" action={<div className="legend"><span className="green-key">Цена</span><span className="amber-key">Прогноза</span></div>}/><div className="market-chart">{marketValues.map((v,i)=><div key={i} className={i>=15?"forecast":""}><span style={{height:`${v*.66}px`}}/><em>{i%3===0?`${String(i).padStart(2,"0")}:00`:""}</em><b>{i===16?`${v}`:""}</b></div>)}</div></article><section className="triple-grid"><article className="card weather-card"><PanelTitle eyebrow="ВРЕМЕТО" title="София · днес"/><div className="weather-main"><span>☀</span><strong>29°</strong><small>Ясно</small></div><div className="weather-hours"><span>Сега<b>29°</b></span><span>16:00<b>30°</b></span><span>18:00<b>27°</b></span><span>20:00<b>23°</b></span></div></article><article className="card settings-panel"><PanelTitle eyebrow="PV ПРОГНОЗА" title="4.18 MWh"/><div className="forecast-bars">{[18,26,42,66,88,100,94,76,48,22].map((v,i)=><i key={i} style={{height:`${v}px`}}/>)}</div><p className="confidence">Точност на прогнозата <b>94.2%</b></p></article><article className="card settings-panel"><PanelTitle eyebrow="ПАЗАРЕН СИГНАЛ" title="Препоръчано действие"/><div className="signal"><i>↗</i><strong>Продавай</strong><span>до 18:45</span></div><p className="signal-note">Очакван ценови пик: <b>242 лв./MWh</b> в 17:00</p></article></section></>;
}

function Balance() {
  return <><section className="portfolio-summary"><div><span>Участници</span><strong>24</strong></div><div><span>Обща позиция</span><strong className="positive">+186 kWh</strong></div><div><span>Прогнозен резултат</span><strong>+3 428 лв.</strong></div><div><span>Точност</span><strong>96.8%</strong></div></section><article className="card balance-chart"><PanelTitle eyebrow="ГРАФИК СПРЯМО ИЗМЕРВАНЕ" title="Позиция на групата" action={<span className="pill amber-pill">Обновено 14:30</span>}/><div className="deviation-chart"><div className="deviation-line"/>{[22,18,24,16,12,-8,-12,4,18,26,14,-5,-16,-24,-8,6,18,22,16,8,-4,-10,-6,2].map((v,i)=><div key={i}><i className={v>=0?"surplus":"shortage"} style={{height:`${Math.abs(v)*3}px`}}/><span>{i%4===0?`${i}:00`:""}</span></div>)}</div></article><article className="card table-card"><PanelTitle eyebrow="УЧАСТНИЦИ" title="Текущи позиции"/><DataTable headers={["Обект","График","Измерено","Отклонение","Цена небаланс","Резултат"]} rows={[["Solar Park East","2.46 MWh","2.51 MWh","+2.0%","−18.42 лв.","+1 842 лв."],["Logistics Hub Plovdiv","1.18 MWh","1.12 MWh","−5.1%","−24.18 лв.","+638 лв."],["Factory Varna","1.86 MWh","1.83 MWh","−1.6%","−18.42 лв.","+1 104 лв."],["Retail Park Burgas","0.82 MWh","0.91 MWh","+11.0%","−31.24 лв.","+386 лв."] , ["Warehouse Ruse","0.42 MWh","0.41 MWh","−2.4%","−18.42 лв.","+214 лв."]]}/></article></>;
}

function Assets({navigate}:{navigate:(v:string)=>void}) {
  const assetGroups = [
    { icon:"☀", type:"PV инвертори", count:"6 / 6", power:"248.6 kW", note:"Deye · Sungrow · Huawei · Growatt", tone:"sun" },
    { icon:"▣", type:"Батерии и BMS", count:"2 / 2", power:"1.44 MWh", note:"TESVOLT · Deye · Sungrow · Huawei", tone:"storage" },
    { icon:"ϟ", type:"Зарядни станции", count:"8 / 9", power:"46.2 kW", note:"OCPP · ABB · Wallbox · Alfen", tone:"ev" },
    { icon:"⌁", type:"Електромери и I/O", count:"4 / 4", power:"98.6%", note:"Modbus · SunSpec · IEC 61850", tone:"meter" },
  ];
  const vendors = [
    ["Deye","SUN / BOS / RW","Modbus TCP/RTU","Инвертор + BESS","Поддържан"],
    ["Sungrow","SG / SH / PowerTitan","Modbus TCP / SunSpec","Инвертор + BESS","Поддържан"],
    ["Huawei","SUN2000 / LUNA2000","Modbus TCP","Инвертор + BESS","Поддържан"],
    ["Growatt","MAX / MID / WIT / APX","Modbus TCP/RTU","Инвертор + BESS","Поддържан"],
    ["SMA","Sunny Tripower / Storage","Modbus TCP / SunSpec","Инвертор + BESS","Каталог"],
    ["GoodWe","ET / BT / Lynx","Modbus TCP","Инвертор + BESS","Каталог"],
    ["Fronius","Tauro / GEN24","SunSpec / Solar API","Инвертор","Каталог"],
    ["Victron","Cerbo GX / MultiPlus","Modbus TCP / MQTT","Инвертор + BESS","Каталог"],
  ];
  return <>
    <section className="asset-summary-grid">{assetGroups.map(a=><button key={a.type} className="asset-block card" onClick={()=>navigate(a.type.includes("Батерии")?"battery":"devices")}><i className={a.tone}>{a.icon}</i><div><span>{a.type}</span><strong>{a.count}</strong><small>{a.note}</small></div><b>{a.power}</b></button>)}</section>
    <section className="asset-detail-grid">
      <article className="card asset-map"><PanelTitle eyebrow="АКТИВИ НА ОБЕКТА" title="Енергийни блокове" action={<span className="pill green">● 20 от 21 онлайн</span>}/><div className="energy-bus"><div className="bus-line"/><AssetNode icon="☀" title="PV масив" model="4 × инверторни блока" value="248.6 kW"/><AssetNode icon="▣" title="BESS" model="2.0 MWh / 500 kW" value="72% SOC"/><AssetNode icon="ϟ" title="EV парк" model="9 зарядни точки" value="46.2 kW"/><AssetNode icon="⌂" title="Товар" model="3 измервателни точки" value="124.3 kW"/><AssetNode icon="⌁" title="Мрежа" model="PCC + защита" value="−83.2 kW"/></div></article>
      <article className="card protocol-card"><PanelTitle eyebrow="УНИВЕРСАЛЕН EDGE СЛОЙ" title="Протоколи и управление"/><div className="protocol-cloud"><span>Modbus TCP</span><span>Modbus RTU</span><span>SunSpec</span><span>OCPP 1.6 / 2.0.1</span><span>CAN</span><span>MQTT</span><span>IEC 61850</span><span>REST API</span></div><div className="edge-note"><i>↻</i><div><strong>Driver adapter layer</strong><small>Нови марки и модели се добавят като драйвери, без промяна на EMS логиката.</small></div></div></article>
    </section>
    <article className="card table-card vendor-table"><PanelTitle eyebrow="КАТАЛОГ НА ДРАЙВЕРИТЕ" title="Инвертори и батерийни системи"/><DataTable headers={["Производител","Серии","Протокол","Тип актив","Статус"]} rows={vendors}/></article>
    <section className="charger-strip card"><PanelTitle eyebrow="EV ЗАРЯДНА ИНФРАСТРУКТУРА" title="Управление на зарядни станции" action={<button className="secondary-btn" onClick={()=>navigate("automation")}>Отвори логиката →</button>}/><div className="charger-features"><span><i>ϟ</i><strong>Dynamic load balancing</strong><small>Разпределение според свободната мощност</small></span><span><i>¤</i><strong>Зареждане по цена</strong><small>Отлагане при скъпа енергия</small></span><span><i>☀</i><strong>Solar surplus</strong><small>Приоритет на собственото PV производство</small></span><span><i>⌁</i><strong>OCPP контрол</strong><small>Сесии, тарифи, лимити и статус</small></span></div></section>
  </>;
}

function AssetNode({icon,title,model,value}:{icon:string;title:string;model:string;value:string}) { return <div className="asset-node"><i>{icon}</i><span><strong>{title}</strong><small>{model}</small></span><b>{value}</b></div>; }

function Automation({notify}:{notify:(v:string)=>void}) {
  const [mode,setMode] = useState("Интелигентен хибрид");
  const [buy,setBuy] = useState(105);
  const [sell,setSell] = useState(195);
  const [rules,setRules] = useState([true,true,true,true,true]);
  const toggleRule=(i:number)=>setRules(r=>r.map((v,n)=>n===i?!v:v));
  const ruleData = [
    ["Ниска пазарна цена","Цена ≤ праг за покупка","Зареждай батерията до 85%"],
    ["Висока пазарна цена","Цена ≥ праг за продажба","Разреждай до минималния SOC"],
    ["Прогнозиран PV излишък","PV − товар > 80 kW за следващите 2 ч.","Освободи капацитет в батерията"],
    ["Прогнозиран товарен пик","Товар > 620 kW в следващите 60 мин.","Запази енергия за peak shaving"],
    ["Ограничение на мрежата","Поток към мрежата > 780 kW","Ограничи PV или зареди BESS"],
  ];
  return <>
    <section className="logic-status card"><div className="logic-engine"><i>⌘</i><div><p>EMS РЕШАВАЩ МОДУЛ</p><h2>Автоматичната логика е активна</h2><span><b className="live-dot"/> Преизчисляване на всеки 5 минути · последно 14:30</span></div></div><div className="current-decision"><span>Текущо решение</span><strong>Разряд към мрежата</strong><b>83.2 kW</b><small>Увереност 94%</small></div></section>
    <section className="decision-flow card"><PanelTitle eyebrow="ВХОДОВЕ → РЕШЕНИЕ → КОМАНДИ" title="Логика в реално време"/><div className="logic-flow"><LogicSource icon="¤" title="Пазарна цена" value="214.62 лв./MWh" state="Над праг за продажба"/><LogicSource icon="⌁" title="Текущ поток" value="+124.3 kW PV излишък" state="Има свободна енергия"/><LogicSource icon="◷" title="Прогноза 6 ч." value="PV 0.84 / товар 1.12 MWh" state="Товарен пик в 17:30"/><div className="decision-box"><i>⌘</i><span>ОПТИМИЗАТОР</span><strong>Продавай сега</strong><small>Запази 54% SOC за пика</small></div><div className="command-stack"><span><i>▣</i><b>BESS</b><strong>−83.2 kW</strong></span><span><i>ϟ</i><b>EV парк</b><strong>лимит 32 kW</strong></span><span><i>☀</i><b>Инвертори</b><strong>без лимит</strong></span></div></div></section>
    <section className="logic-config-grid">
      <article className="card settings-panel"><PanelTitle eyebrow="ОПТИМИЗАЦИОНЕН РЕЖИМ" title="Приоритет на системата"/><div className="mode-pills">{["Интелигентен хибрид","Ценови арбитраж","Самоконсумация","Zero export","Peak shaving"].map(m=><button key={m} className={mode===m?"active":""} onClick={()=>setMode(m)}>{m}</button>)}</div><div className="mode-explain"><i>◎</i><div><strong>{mode}</strong><small>{mode==="Интелигентен хибрид"?"Комбинира цена, текущ енергиен поток, PV/товарова прогноза, SOC, мрежови и BMS лимити.":"Режимът следва избрания приоритет, без да нарушава защитните ограничения."}</small></div></div></article>
      <article className="card settings-panel"><PanelTitle eyebrow="ЦЕНОВИ ПРАГОВЕ" title="Покупка и продажба"/><label className="range-label"><span>Зареждай под<strong>{buy} лв./MWh</strong></span><input type="range" min="40" max="180" value={buy} onChange={e=>setBuy(Number(e.target.value))}/></label><label className="range-label"><span>Продавай над<strong>{sell} лв./MWh</strong></span><input type="range" min="120" max="300" value={sell} onChange={e=>setSell(Number(e.target.value))}/></label><div className="price-window"><span>Арбитражен прозорец</span><strong>{sell-buy} лв./MWh</strong></div></article>
    </section>
    <article className="card rule-engine"><PanelTitle eyebrow="RULE ENGINE" title="Активни правила" action={<button className="primary-btn" onClick={()=>notify("Логиката и ценовите прагове са запазени")}>Запази логиката</button>}/><div className="rule-list">{ruleData.map((r,i)=><div className={rules[i]?"rule-row":"rule-row disabled"} key={r[0]}><button className={rules[i]?"toggle on":"toggle"} onClick={()=>toggleRule(i)} aria-label={`${r[0]} – ${rules[i]?"изключи":"включи"}`}/><span><strong>{r[0]}</strong><small>{r[1]}</small></span><i>→</i><b>{r[2]}</b></div>)}</div></article>
    <section className="safety-band"><div><i>✓</i><span><strong>Safety constraints винаги имат приоритет</strong><small>BMS граници · минимален SOC · мрежова защита · ramp rate · комуникационен watchdog</small></span></div><button onClick={()=>notify("Всички защити са активни")}>5 / 5 активни</button></section>
  </>;
}

function LogicSource({icon,title,value,state}:{icon:string;title:string;value:string;state:string}) { return <div className="logic-source"><i>{icon}</i><span><small>{title}</small><strong>{value}</strong><em>{state}</em></span></div>; }

function Devices({notify}:{notify:(v:string)=>void}) {
  const devices = [["PV инвертор 01","Deye SUN-50K-SG01HP3","Modbus TCP","Онлайн","48.6 kW","8 сек."],["PV инвертор 02","Sungrow SG125CX-P2","Modbus TCP","Онлайн","72.4 kW","6 сек."],["PV инвертор 03","Huawei SUN2000-100KTL","Modbus TCP","Онлайн","68.8 kW","7 сек."],["PV инвертор 04","Growatt MAX 125KTL3-X","Modbus RTU","Онлайн","58.8 kW","9 сек."],["BESS PCS","TESVOLT TPS-E","Modbus TCP","Онлайн","+41.1 kW","7 сек."],["BMS Controller","Deye BOS-G","CAN / TCP","Онлайн","72% SOC","7 сек."],["Grid meter","Janitza UMG 604","Modbus TCP","Онлайн","−83.2 kW","5 сек."],["Load meter","Schneider PM8000","Modbus TCP","Онлайн","124.3 kW","5 сек."],["EV charger 01","ABB Terra AC","OCPP 1.6","Онлайн","11.0 kW","12 сек."],["EV charger 02","Wallbox Commander","OCPP 1.6","Онлайн","22.0 kW","10 сек."],["Weather station","Kipp & Zonen","RS-485","Внимание","844 W/m²","2 мин."],["Protection relay","Siemens 7SJ82","IEC 61850","Онлайн","Нормално","6 сек."]];
  return <><div className="device-toolbar"><div className="searchbox">⌕ <input aria-label="Търсене на устройство" placeholder="Търсене на устройство..."/></div><button className="secondary-btn" onClick={()=>notify("Сканирането откри 2 нови устройства")}>↻ Открий устройства</button><button className="primary-btn" onClick={()=>notify("Каталогът е отворен")}>+ Добави устройство</button></div><section className="kpis compact-kpis"><Metric label="Устройства" value="12" unit="общо" badge="" type="charge"/><Metric label="Онлайн" value="11" unit="активни" badge="91.7%" type="spark solar-spark"/><Metric label="Комуникация" value="98.6" unit="%" badge="стабилна" type="spark load-spark"/><Metric label="Последна команда" value="14:31" unit="ч." badge="изпълнена" type="price"/></section><article className="card table-card devices-table"><PanelTitle eyebrow="SCADA / КОМУНИКАЦИЯ" title="Всички устройства"/><DataTable headers={["Устройство","Модел","Протокол","Статус","Последни данни","Обновено"]} rows={devices}/></article></>;
}

function Alarms({notify}:{notify:(v:string)=>void}) {
  const [filter,setFilter]=useState("Всички"); const alarms=[["Критична","Office Center Sofia","Gateway няма връзка","Данните не са обновявани от 24 мин.","14:08"],["Внимание","Retail Park Burgas","Висока температура на инвертор","Температура 67.4°C · лимит 65°C","13:52"],["Внимание","Solar Park East","Метеостанция: забавени данни","Последна телеметрия преди 2 мин.","13:47"],["Информация","Factory Varna","Графикът е актуализиран","Автоматична корекция спрямо PV прогноза","13:32"],["Информация","Logistics Hub Plovdiv","SOC цел е достигната","Батерията преминава в режим готовност","12:58"]];
  const shown=filter==="Всички"?alarms:alarms.filter(a=>a[0]===filter);
  return <><div className="alarm-tabs">{["Всички","Критична","Внимание","Информация"].map(x=><button className={filter===x?"active":""} key={x} onClick={()=>setFilter(x)}>{x}</button>)}<button className="secondary-btn" onClick={()=>notify("Всички аларми са потвърдени")}>Потвърди всички</button></div><article className="card alarm-list">{shown.map((a,i)=><div className="alarm-row" key={a[2]}><i className={`severity s${a[0]}`}>{a[0]==="Критична"?"!":a[0]==="Внимание"?"△":"i"}</i><div><span className={`severity-label s${a[0]}`}>{a[0]}</span><h3>{a[2]}</h3><p>{a[1]} · {a[3]}</p></div><time>{a[4]}</time><button onClick={()=>notify(`Алармата е потвърдена`)}>{i<3?"Потвърди":"Отвори"}</button></div>)}</article></>;
}

function DataTable({headers,rows}:{headers:string[];rows:string[][]}) { return <div className="data-table" role="table"><div className="table-row table-head">{headers.map(h=><span key={h}>{h}</span>)}</div>{rows.map((r,i)=><div className="table-row" key={i}>{r.map((c,n)=><span key={n} className={c==="Изпълнена"||c==="Онлайн"?"positive":c==="Внимание"?"warning-text":""}>{c}</span>)}</div>)}</div>; }
function Check({text}:{text:string}) { return <div className="check-row"><i>✓</i><span>{text}</span><b>OK</b></div>; }
