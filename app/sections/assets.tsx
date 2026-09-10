"use client";

import { useState } from "react";
import type { UiLanguage } from "../i18n/messages";
import { DataTable, PanelTitle } from "./shared";

export function Assets({navigate,notify,lang}:{navigate:(v:string)=>void;notify:(v:string)=>void;lang:UiLanguage}) {
  const assetGroups = [
    { icon:"☀", type:"PV инвертори", count:"6 / 6", power:"248.6 kW", note:"Deye · Sungrow · Huawei · Growatt", tone:"sun" },
    { icon:"▣", type:"Батерии и BMS", count:"2 / 2", power:"1.44 MWh", note:"TESVOLT · Deye · Sungrow · Huawei", tone:"storage" },
    { icon:"ϟ", type:"Зарядни станции", count:"8 / 9", power:"46.2 kW", note:"OCPP · ABB · Wallbox · Alfen", tone:"ev" },
    { icon:"⌁", type:"Електромери и I/O", count:"4 / 4", power:"98.6%", note:"Modbus · SunSpec · IEC 61850", tone:"meter" },
  ];
  const vendors = [
    ["Deye","SUN / BOS / RW","PV, Hybrid, BESS","DC / AC по модел","Modbus TCP/RTU","Поддържан"],
    ["Sungrow","SG / SH / PowerTitan","PV, Hybrid, AIO BESS","DC / AC по модел","Modbus TCP / SunSpec","Поддържан"],
    ["Huawei","SUN2000 / LUNA2000","PV, Hybrid, ESS","DC / AC по модел","Modbus TCP","Поддържан"],
    ["Growatt","MAX / MID / WIT / APX","PV, Hybrid, BESS","DC / AC по модел","Modbus TCP/RTU","Поддържан"],
    ["SMA","Sunny Tripower / Storage","PV, Battery inverter","AC / DC по модел","Modbus TCP / SunSpec","Каталог"],
    ["GoodWe","ET / BT / Lynx","Hybrid, Battery","DC coupled","Modbus TCP","Каталог"],
    ["Fronius","Tauro / GEN24","PV, Hybrid","DC coupled","SunSpec / Solar API","Каталог"],
    ["Victron","Cerbo GX / MultiPlus","Battery inverter / ESS","AC coupled","Modbus TCP / MQTT","Каталог"],
  ];
  return <>
    <section className="asset-summary-grid">{assetGroups.map(a=><button key={a.type} className="asset-block card" onClick={()=>navigate(a.type.includes("Батерии")?"battery":"devices")}><i className={a.tone}>{a.icon}</i><div><span>{a.type}</span><strong>{a.count}</strong><small>{a.note}</small></div><b>{a.power}</b></button>)}</section>
    <section className="asset-detail-grid">
      <article className="card asset-map"><PanelTitle eyebrow="АКТИВИ НА ОБЕКТА" title="Енергийни блокове" action={<span className="pill green">● 20 от 21 онлайн</span>}/><div className="energy-bus"><div className="bus-line"/><AssetNode icon="☀" title="PV масив" model="4 × инверторни блока" value="248.6 kW"/><AssetNode icon="▣" title="BESS" model="2.0 MWh / 500 kW" value="72% SOC"/><AssetNode icon="ϟ" title="EV парк" model="9 зарядни точки" value="46.2 kW"/><AssetNode icon="⌂" title="Товар" model="3 измервателни точки" value="124.3 kW"/><AssetNode icon="⌁" title="Мрежа" model="PCC + защита" value="−83.2 kW"/></div></article>
      <article className="card protocol-card"><PanelTitle eyebrow="УНИВЕРСАЛЕН EDGE СЛОЙ" title="Протоколи и управление"/><div className="protocol-cloud"><span>Modbus TCP</span><span>Modbus RTU</span><span>SunSpec</span><span>OCPP 1.6 / 2.0.1</span><span>CAN</span><span>MQTT</span><span>IEC 61850</span><span>REST API</span></div><div className="edge-note"><i>↻</i><div><strong>Driver adapter layer</strong><small>Нови марки и модели се добавят като драйвери, без промяна на EMS логиката.</small></div></div></article>
    </section>
    <article className="card table-card vendor-table"><PanelTitle eyebrow="КАТАЛОГ НА ДРАЙВЕРИТЕ" title="Производители, типове и coupling"/><DataTable headers={["Производител","Серии","Типове","Coupling","Протокол","Статус"]} rows={vendors}/></article>
    <DriverCatalog notify={notify}/>
    <OpenProtocolReference notify={notify} lang={lang}/>
    <MeterTopology notify={notify}/>
    <section className="charger-strip card"><PanelTitle eyebrow="EV ЗАРЯДНА ИНФРАСТРУКТУРА" title="Управление на зарядни станции" action={<button className="secondary-btn" onClick={()=>navigate("automation")}>Отвори логиката →</button>}/><div className="charger-features"><span><i>ϟ</i><strong>Dynamic load balancing</strong><small>Разпределение според свободната мощност</small></span><span><i>¤</i><strong>Зареждане по цена</strong><small>Отлагане при скъпа енергия</small></span><span><i>☀</i><strong>Solar surplus</strong><small>Приоритет на собственото PV производство</small></span><span><i>⌁</i><strong>OCPP контрол</strong><small>Сесии, тарифи, лимити и статус</small></span></div></section>
  </>;
}

function AssetNode({icon,title,model,value}:{icon:string;title:string;model:string;value:string}) { return <div className="asset-node"><i>{icon}</i><span><strong>{title}</strong><small>{model}</small></span><b>{value}</b></div>; }

function DriverCatalog({notify}:{notify:(v:string)=>void}) {
  const driverTypes = [
    {name:"PV инвертор",icon:"☀",coupling:"DC → AC",kind:"String / central",description:"Преобразува DC енергията от PV масива към AC шината. Не управлява директно батерия.",contains:["MPPT входове","DC/AC преобразувател","AC защити и релета","Локален контролер"],telemetry:["AC/DC мощност и енергия","Напрежения, токове, честота","MPPT канали и изолация","Температури, аларми, derating"],commands:["Active power limit","Reactive power / cos φ","Start / stop","Ramp rate"],identity:["Производител и модел","String или central","Номинална AC/DC мощност","Firmware и register map"]},
    {name:"Hybrid инвертор",icon:"⇄",coupling:"DC coupled",kind:"PV + battery inverter",description:"Обединява PV и батерия върху общ DC bus и използва един инвертор за връзка с AC мрежата.",contains:["PV MPPT входове","Двупосочен battery DC порт","DC bus","Общ AC инвертор"],telemetry:["PV, battery и grid power","SOC от външен/вграден BMS","DC bus voltage","Operating mode и alarms"],commands:["Battery charge/discharge","Export/import limit","PV curtailment","Backup / EPS mode"],identity:["Производител и модел","Поддържана батерия/BMS","PV и battery DC диапазон","Мрежова конфигурация"]},
    {name:"Battery PCS",icon:"↔",coupling:"AC coupled",kind:"Bidirectional inverter",description:"Самостоятелен двупосочен AC/DC преобразувател между батерийната DC шина и AC шината на обекта.",contains:["AC/DC power stage","DC contactor interface","Grid relay / protection","PCS controller"],telemetry:["AC/DC active power","DC voltage/current","Available charge/discharge","PCS state, temperature, faults"],commands:["Requested active power","Reactive power","Enable / disable","Heartbeat / watchdog"],identity:["PCS производител и модел","Номинални kW и kVA","Знакова конвенция","Scale, offset и heartbeat"]},
    {name:"Батерия / BMS",icon:"▣",coupling:"DC subsystem",kind:"Rack / cabinet / container",description:"Съхранява енергията и определя реалния безопасен envelope. BMS лимитите винаги имат приоритет.",contains:["Cell modules","Racks и contactors","BMU / CMU","BMS / BAU controller"],telemetry:["SOC / SOH","Cell min/max voltage","Температури и alarms","Charge/discharge limits"],commands:["Wake / sleep, ако е разрешено","Contactor request","Alarm reset","Няма директен power setpoint"],identity:["Химия и капацитет","BMS/BAU модел","Rack/module topology","CAN/RS485 register map"]},
    {name:"All-in-one AC",icon:"▦",coupling:"AC coupled",kind:"Integrated BESS",description:"Завършена AC-свързана BESS система. Към EMS се моделира като assembly с отделни PCS, Battery/BMS и вътрешни помощни assets.",contains:["Battery racks и BMS/BAU","PCS — производител и модел","AC/DC защити и switchgear","HVAC, fire system, auxiliary meter","Локален controller / EMS"],telemetry:["Assembly status и availability","PCS active/reactive power","BMS SOC/SOH и лимити","HVAC/fire/door/aux alarms"],commands:["Assembly power setpoint","PCS enable / standby","Reactive power","Safe shutdown"],identity:["AIO производител и модел","PCS производител и модел","Battery/BMS производител и модел","AC coupling point и nominal power"]},
    {name:"All-in-one DC",icon:"◈",coupling:"DC coupled",kind:"PV + BESS integrated",description:"PV и батерията споделят DC bus преди общ hybrid inverter/PCS. Позволява съхранение на PV без допълнително AC преобразуване.",contains:["PV MPPT/DC combiner","Battery racks и BMS","DC/DC battery stage","Hybrid inverter / common PCS","DC и AC protection"],telemetry:["PV power before inverter","Battery DC power и SOC","DC bus state","Combined AC output"],commands:["Battery DC charge/discharge","AC export limit","PV curtailment","Hybrid operating mode"],identity:["AIO и inverter модел","DC topology и voltage range","Battery compatibility","PV/BESS power ratios"]},
    {name:"Smart meter",icon:"⌁",coupling:"Measurement",kind:"PCC / branch / submeter",description:"Независим измервателен Asset, поставен в конкретна електрическа точка. Ролята се задава чрез measurement point, не само чрез името на уреда.",contains:["3-phase voltage/current inputs","CT/VT ratio configuration","Energy counters","Communication interface"],telemetry:["Import/export active power","Reactive power и power factor","Voltage/current/frequency","Import/export energy counters"],commands:["Обикновено read-only","Reset demand — само ако е разрешено","Time sync","Tariff selection при нужда"],identity:["Производител и модел","PCC/PV/Load/BESS/EV role","CT/VT ratio и direction","Modbus address и phase order"]},
  ];
  const [selected,setSelected]=useState(4);
  const type=driverTypes[selected];
  return <article className="card driver-taxonomy"><PanelTitle eyebrow="ТИПОВ МОДЕЛ НА ДРАЙВЕРИТЕ" title="Какво представлява и какво съдържа всеки тип" action={<button className="secondary-btn" onClick={()=>notify("Шаблонът за нов драйвер е отворен")}>+ Нов драйвер</button>}/><div className="driver-type-tabs">{driverTypes.map((d,i)=><button key={d.name} className={selected===i?"active":""} onClick={()=>setSelected(i)}><i>{d.icon}</i><span><strong>{d.name}</strong><small>{d.coupling}</small></span></button>)}</div><section className="driver-type-detail"><div className="driver-description"><div className="driver-badge"><i>{type.icon}</i><span><small>{type.kind}</small><strong>{type.name}</strong><em>{type.coupling}</em></span></div><p>{type.description}</p><div className="driver-identity"><span>Задължителна идентификация</span>{type.identity.map(x=><b key={x}>✓ {x}</b>)}</div></div><DriverFieldList title="Съдържа" icon="▦" items={type.contains}/><DriverFieldList title="Телеметрия" icon="↗" items={type.telemetry}/><DriverFieldList title="Команди" icon="⌘" items={type.commands}/></section><div className="driver-rule"><i>!</i><span><strong>Driver package = тип + производител + модел + firmware/register-map версия</strong><small>„All-in-one“ не е един черен блок. PCS, Battery/BMS, smart meter и помощните системи се виждат като отделни child assets под общ assembly.</small></span></div></article>;
}

function OpenProtocolReference({notify,lang}:{notify:(v:string)=>void;lang:UiLanguage}) {
  const t=(bg:string,en:string)=>lang==="en"?en:bg;
  const [tab,setTab]=useState<"inverter"|"bms"|"wiring">("inverter");
  const inverterRows=[
    ["DEYE_CAN","Deye","CAN",t("По модел · лабораторен тест","Per model · bench test")],
    ["GOODWE_CAN","GoodWe HV","CAN",t("По модел · лабораторен тест","Per model · bench test")],
    ["GROWATT_CAN","Growatt LV","CAN","SPF 5000 ES · ES 5000"],
    ["GROWATT_HV_CAN","Growatt HV","CAN","SPH Series"],
    ["GROWATT_MODBUS","Growatt","Modbus",t("По модел · register-map тест","Per model · register-map test")],
    ["HUAWEI_MODBUS","Huawei","Modbus",t("По модел · register-map тест","Per model · register-map test")],
    ["LUXPOWER_CAN","Luxpower","CAN",t("По модел · лабораторен тест","Per model · bench test")],
    ["PYLON_CAN","Pylon-compatible","CAN","Growatt SPH TL3 BH UP · OEM families"],
    ["PYLON_RS485","Pylon-compatible","RS485 / UART","Growatt SPF 3000 ES · OEM families"],
    ["PYLON_HV_CAN","Pylon HV-compatible","CAN",t("По модел · лабораторен тест","Per model · bench test")],
    ["SMA_CAN","SMA Sunny Island","CAN","4.0H · 6.0H · 8.0H · 4548-US · 6048-US"],
    ["SOLARK_CAN","Sol-Ark","CAN",t("По модел · лабораторен тест","Per model · bench test")],
    ["SOLIS_HV_CAN","Solis HV","CAN",t("По модел · лабораторен тест","Per model · bench test")],
  ];
  const bmsRows=[
    ["BYD","CAN"],["Daly","CAN · RS485 · UART / RS232"],["Growatt LV / HV","CAN"],["Huawei","Modbus"],["JBD","RS485 · UART / RS232"],
    ["JK","CAN · RS485 · UART / RS232 · Modbus"],["Megarevo","CAN"],["LIA","CAN"],["Luxpower","CAN"],["Narada","Modbus"],
    ["PACE","CAN"],["PylonTech LV","CAN · RS485 · UART / RS232 · Modbus"],["PylonTech HV","CAN"],["SacredSun","RS485"],["Samsung / Vertiv","CAN"],
    ["Seplos","CAN"],["SMA","CAN"],["TianPower","Modbus"],
  ].map(row=>[row[0],row[1],t("R&D референция","R&D reference"),t("Изисква тест с точния BMS firmware","Exact BMS firmware test required")]);
  const wiringRows=[
    ["Deye BMS RJ45","CAN H: 4 · CAN L: 5 · GND: 6","RS485 B/A: 1/2 · A/B: 7/8"],
    ["Growatt CAN RJ45","CAN H: 4 · CAN L: 5 · GND: 2",t("Провери серията и firmware","Verify series and firmware")],
    ["Pylon compatible RJ45","CAN H: 4 · CAN L: 5 · GND: 6","RS485 A/B: 7/8 · pins 1–3 NC"],
    ["SMA CAN RJ45","CAN H: 4 · CAN L: 5",t("Sunny Island family reference","Sunny Island family reference")],
  ];
  return <article className="card protocol-reference" data-no-translate>
    <div className="protocol-reference-head"><div><p>{t("ОТВОРЕН R&D КАТАЛОГ","OPEN R&D CATALOGUE")}</p><h2>{t("BMS ↔ инвертор протоколи и serial/CAN карта","BMS ↔ inverter protocols and serial/CAN map")}</h2><span>{t("Използваме публичния проект ai-republic/bms-to-inverter като референция за протоколни семейства, тестови сценарии и съвместими модели — не като директно копиран firmware.","We use the public ai-republic/bms-to-inverter project as a reference for protocol families, test scenarios and compatible models — not as copied firmware.")}</span></div><a href="https://github.com/ai-republic/bms-to-inverter" target="_blank" rel="noreferrer">GitHub reference ↗</a></div>
    <section className="protocol-reference-kpis"><span><small>{t("ИНВЕРТОРНИ BINDINGS","INVERTER BINDINGS")}</small><strong>13</strong></span><span><small>{t("BMS СЕМЕЙСТВА","BMS FAMILIES")}</small><strong>18+</strong></span><span><small>{t("ТРАНСПОРТИ","TRANSPORTS")}</small><strong>CAN · RS485 · RS232 · Modbus</strong></span><span><small>{t("СТАТУС","STATUS")}</small><strong>{t("R&D / за валидация","R&D / validation")}</strong></span></section>
    <div className="protocol-reference-tabs"><button className={tab==="inverter"?"active":""} onClick={()=>setTab("inverter")}>{t("Инверторни протоколи","Inverter protocols")}</button><button className={tab==="bms"?"active":""} onClick={()=>setTab("bms")}>{t("BMS протоколи","BMS protocols")}</button><button className={tab==="wiring"?"active":""} onClick={()=>setTab("wiring")}>{t("Serial / CAN pin map","Serial / CAN pin map")}</button></div>
    {tab==="inverter"&&<div className="protocol-table-wrap"><DataTable headers={[t("Binding","Binding"),t("Марка / семейство","Brand / family"),t("Транспорт","Transport"),t("Публично описани модели / статус","Publicly described models / status")]} rows={inverterRows}/></div>}
    {tab==="bms"&&<div className="protocol-table-wrap"><DataTable headers={[t("BMS семейство","BMS family"),t("Транспорт","Transport"),t("Източник","Source"),t("GrideX статус","GrideX status")]} rows={bmsRows}/></div>}
    {tab==="wiring"&&<><div className="protocol-table-wrap"><DataTable headers={[t("Интерфейс","Interface"),"CAN",t("Serial / бележка","Serial / note")]} rows={wiringRows}/></div><div className="wiring-warning"><i>!</i><span><strong>{t("RJ45 тук не означава Ethernet.","RJ45 does not mean Ethernet here.")}</strong><small>{t("Pinout-ът е R&D референция. Преди окабеляване задължително се сверява ръководството за точния модел, hardware revision и firmware; CAN шината се терминира само в двата края.","The pinout is an R&D reference. Before wiring, verify the exact model, hardware revision and firmware manual; terminate the CAN bus only at both ends.")}</small></span></div></>}
    <div className="protocol-license-note"><i>CC</i><span><strong>{t("Лицензионна граница: идеи и проверка, без директно копиране на код","Licence boundary: ideas and verification, no direct code copying")}</strong><small>{t("Референтното repo е под CC BY-NC-SA 4.0. За комерсиално вграждане на негов код е нужно отделно разрешение. GrideX драйверите ще бъдат собствена реализация по официалните протоколи и лабораторни traces.","The reference repository is licensed CC BY-NC-SA 4.0. Commercial embedding of its code requires separate permission. GrideX drivers will be independently implemented from official protocols and laboratory traces.")}</small></span><button onClick={()=>notify(t("Създаден е план за bench validation по модел и firmware","A per-model and firmware bench-validation plan has been created"))}>{t("План за валидация","Validation plan")}</button></div>
  </article>;
}

function DriverFieldList({title,icon,items}:{title:string;icon:string;items:string[]}) { return <div className="driver-field-list"><h3><i>{icon}</i>{title}</h3>{items.map(x=><span key={x}>{x}</span>)}</div>; }

function MeterTopology({notify}:{notify:(v:string)=>void}) {
  const [meterCount,setMeterCount]=useState(3);
  const meters=[
    {id:"M1",name:"PCC / Grid meter",role:"Задължителен",place:"В точката на присъединяване — след главния прекъсвач, преди вътрешните разклонения.",measures:"Нетен внос/износ на целия обект",parent:"Site"},
    {id:"M2",name:"PV production meter",role:"Препоръчителен",place:"На AC изхода на PV инверторите или общото PV табло.",measures:"Реално PV производство независимо от inverter telemetry",parent:"PV System"},
    {id:"M3",name:"Main load meter",role:"Препоръчителен",place:"На шината към основните консуматори, след отделяне на PV/BESS клоновете.",measures:"Чиста консумация на обекта",parent:"Site / Load group"},
    {id:"M4",name:"BESS branch meter",role:"Опционален",place:"Между PCS AC изхода и общата AC шина; може да е физически в AIO шкафа.",measures:"Независима енергия заряд/разряд и загуби",parent:"BESS assembly"},
    {id:"M5",name:"EV / process submeter",role:"Опционален",place:"На отделен управляем клон — EV, HVAC или технологична линия.",measures:"Контролируем товар и settlement по групи",parent:"EV / Load group"},
  ];
  const active=meters.slice(0,meterCount);
  return <article className="card meter-topology"><PanelTitle eyebrow="SMART METER ASSETS" title="Къде са свързани измервателните точки?" action={<div className="meter-count">{[1,2,3,5].map(x=><button key={x} className={meterCount===x?"active":""} onClick={()=>setMeterCount(x)}>{x} meter{x>1?"s":""}</button>)}</div>}/><div className="single-line"><div className="grid-source"><i>⌁</i><strong>Мрежа</strong></div><b>→</b><div className="meter-node primary"><i>M1</i><strong>PCC meter</strong><small>Import / export</small></div><b>→</b><div className="ac-bus"><strong>AC BUS</strong><span>{meterCount>1&&<em><i>M2</i> PV</em>}{meterCount>2&&<em><i>M3</i> Load</em>}{meterCount>3&&<em><i>M4</i> BESS</em>}{meterCount>4&&<em><i>M5</i> EV / Process</em>}</span></div></div><section className="meter-layout"><div className="meter-cards">{active.map(m=><article key={m.id}><div><i>{m.id}</i><span><strong>{m.name}</strong><small>{m.role}</small></span></div><p>{m.place}</p><b>{m.measures}</b><em>OpenRemote parent: {m.parent}</em></article>)}</div><aside className="meter-model"><p>OPENREMOTE МОДЕЛ</p><h3>Всеки измервател е отделен MeterAsset</h3><div><span><small>parentId</small><strong>Физическо местоположение</strong></span><span><small>measurementPoint</small><strong>PCC / PV / LOAD / BESS / EV</strong></span><span><small>measuresAssetId</small><strong>Логически измерван актив</strong></span><span><small>direction</small><strong>Import / Export / Bidirectional</strong></span><span><small>ctRatio / phaseOrder</small><strong>Монтажна конфигурация</strong></span></div><p className="meter-note">Ако smart meter е в All-in-one шкафа, той остава отделен MeterAsset, но неговият parent е BESS assembly. Така може да се смени уредът без промяна на модела на PCS/BMS.</p><button className="primary-btn" onClick={()=>notify(`Топологията с ${meterCount} smart meter-а е записана`)}>Запази измервателната топология</button></aside></section></article>;
}
