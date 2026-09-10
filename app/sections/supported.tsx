"use client";

import { useState } from "react";
import { supportedDeviceDrivers } from "../data/supported-devices";
import type { UiLanguage } from "../i18n/messages";

export function SupportedDevices({lang}:{lang:UiLanguage}) {
  const t=(bg:string,en:string)=>lang==="en"?en:bg;
  const [query,setQuery]=useState("");
  const [category,setCategory]=useState<"all"|"verified"|"inverter"|"bms"|"aio"|"bridge">("all");
  const [protocol,setProtocol]=useState<"all"|"CAN"|"Modbus"|"RS485"|"RS232/UART">("all");
  const statusCopy={
    "manufacturer-confirmed":{label:t("Потвърдено от производителя","Manufacturer-confirmed"),detail:t("GrideX production профил","GrideX production profile")},
    documented:{label:t("Карта налична","Map available"),detail:t("Изисква commissioning тест","Commissioning test required")},
    "external-reference":{label:t("Външна R&D референция","External R&D reference"),detail:t("Не е production GrideX драйвер","Not a production GrideX driver")},
    "design-reference":{label:t("Архитектурна референция","Architecture reference"),detail:t("Документиран design · без готов драйвер","Documented design · no implemented driver")},
  } as const;
  const categoryCopy={aio:t("All-in-one BESS","All-in-one BESS"),pcs:"PCS",inverter:t("Инвертор","Inverter"),bms:"Battery / BMS",bridge:t("Протоколен bridge","Protocol bridge")};
  const normalizedQuery=query.trim().toLowerCase();
  const matches=supportedDeviceDrivers.filter(driver=>{
    const categoryMatch=category==="all"
      || (category==="verified"&&driver.status!=="external-reference")
      || (category==="inverter"&&(driver.category==="inverter"||driver.category==="pcs"))
      || driver.category===category;
    const protocolMatch=protocol==="all"||driver.interfaces.some(item=>protocol==="Modbus"?item.includes("Modbus"):item===protocol);
    const searchMatch=!normalizedQuery||[driver.brand,driver.profile,driver.module,...driver.interfaces].join(" ").toLowerCase().includes(normalizedQuery);
    return categoryMatch&&protocolMatch&&searchMatch;
  });
  const projectProfiles=supportedDeviceDrivers.filter(driver=>driver.status==="manufacturer-confirmed"||driver.status==="documented").length;
  const inverterReferences=supportedDeviceDrivers.filter(driver=>driver.status==="external-reference"&&driver.category==="inverter").length;
  const bmsReferences=supportedDeviceDrivers.filter(driver=>driver.status==="external-reference"&&(driver.category==="bms"||driver.category==="meter")).length;
  const designReferences=supportedDeviceDrivers.filter(driver=>driver.status==="design-reference").length;
  const categories:[typeof category,string,string][]=[
    ["all",t("Всички","All"),String(supportedDeviceDrivers.length)],
    ["verified",t("GrideX проверени","GrideX verified"),String(projectProfiles)],
    ["inverter",t("Инвертори / PCS","Inverters / PCS"),String(supportedDeviceDrivers.filter(driver=>driver.category==="inverter"||driver.category==="pcs").length)],
    ["bms","Battery / BMS",String(supportedDeviceDrivers.filter(driver=>driver.category==="bms").length)],
    ["meter",t("Електромери","Meters"),String(supportedDeviceDrivers.filter(driver=>driver.category==="meter").length)],
    ["aio","All-in-one",String(supportedDeviceDrivers.filter(driver=>driver.category==="aio").length)],
    ["bridge",t("Bridge протоколи","Bridge protocols"),String(supportedDeviceDrivers.filter(driver=>driver.category==="bridge").length)],
  ];
  const protocols:[typeof protocol,string][]=[["all",t("Всички интерфейси","All interfaces")],["CAN","CAN"],["Modbus","Modbus"],["RS485","RS485"],["RS232/UART","RS232 / UART"]];
  return <section className="supported-devices-page" data-no-translate>
    <article className="card supported-devices-hero">
      <div><p>SUPPORTED DEVICES</p><h2>{t("Проверим каталог на драйвери и комуникационни карти","Traceable driver and communication-map catalogue")}</h2><span>{t("Статусът показва какво действително е налично: потвърден GrideX профил, документ за commissioning или външна R&D реализация, която още трябва да бъде независимо внедрена и изпитана.","Each status states what actually exists: a confirmed GrideX profile, a commissioning document, or an external R&D implementation that still requires independent implementation and validation.")}</span></div>
      <div className="supported-devices-hero-stats"><span><small>{t("КАТАЛОЖНИ ЗАПИСИ","CATALOGUE ENTRIES")}</small><strong>{supportedDeviceDrivers.length}</strong></span><span><small>{t("ПРОЕКТНИ ПРОФИЛИ","PROJECT PROFILES")}</small><strong>{projectProfiles}</strong></span><span><small>{t("ВЪНШНИ МОДУЛИ","EXTERNAL MODULES")}</small><strong>{inverterReferences+bmsReferences}</strong></span><span><small>{t("DESIGN ПРОТОКОЛИ","DESIGN PROTOCOLS")}</small><strong>{designReferences}</strong></span></div>
    </article>
    <article className="card supported-filter-panel">
      <label className="supported-search"><span>{t("Търсене по марка, модел или модул","Search by brand, model or module")}</span><div><i>⌕</i><input value={query} onChange={event=>setQuery(event.target.value)} placeholder={t("Напр. Suntech, Growatt, PylonTech…","E.g. Suntech, Growatt, PylonTech…")}/>{query&&<button onClick={()=>setQuery("")} aria-label={t("Изчисти търсенето","Clear search")}>×</button>}</div></label>
      <div className="supported-filter-group"><span>{t("Тип и статус","Type and status")}</span><div>{categories.map(([id,label,count])=><button key={id} className={category===id?"active":""} onClick={()=>setCategory(id)}>{label}<b>{count}</b></button>)}</div></div>
      <div className="supported-filter-group"><span>{t("Комуникационен интерфейс","Communication interface")}</span><div>{protocols.map(([id,label])=><button key={id} className={protocol===id?"active":""} onClick={()=>setProtocol(id)}>{label}</button>)}</div></div>
    </article>
    <div className="supported-results-head"><span><strong>{matches.length}</strong> {t("показани профила","profiles shown")}</span><div className="supported-status-legend"><i className="confirmed"/>{t("Потвърден","Confirmed")}<i className="documented"/>{t("Документиран","Documented")}<i className="reference"/>R&amp;D<i className="design"/>{t("Архитектура","Architecture")}</div></div>
    {matches.length?<div className="supported-driver-grid">{matches.map(driver=>{
      const status=statusCopy[driver.status];
      return <article className={`card supported-driver-card status-${driver.status}`} key={driver.id}>
        <header><div><span>{driver.brand.slice(0,2).toUpperCase()}</span><p><small>{categoryCopy[driver.category]}</small><strong>{driver.brand}</strong></p></div><em>{status.label}</em></header>
        <h3>{driver.profile}</h3>
        <div className="supported-interface-list">{driver.interfaces.map(item=><span key={item}>{item}</span>)}</div>
        <p>{lang==="en"?driver.scopeEn:driver.scopeBg}</p>
        <div className="supported-model-note"><small>{t("МОДЕЛИ И ВАЛИДАЦИЯ","MODELS & VALIDATION")}</small><span>{lang==="en"?driver.modelsEn:driver.modelsBg}</span></div>
        <footer><span><small>{t("МОДУЛ / ПРОФИЛ","MODULE / PROFILE")}</small><code>{driver.module}</code></span><a href={driver.sourceUrl} target="_blank" rel="noreferrer">{driver.status==="external-reference"?t("Външен модул ↗","External module ↗"):driver.status==="design-reference"?t("Design източник ↗","Design source ↗"):t("GrideX код ↗","GrideX source ↗")}</a></footer>
        <div className="supported-driver-state"><i/> <span><strong>{status.detail}</strong><small>{driver.status==="external-reference"?t("Не използваме директно външния код; изграждаме собствен драйвер по официален протокол и тестови traces.","External code is not embedded directly; GrideX builds an independent driver from official protocol documents and test traces."):driver.status==="design-reference"?t("Протоколът е документиран като цел за bridge реализация, но още няма изпълним GrideX модул и hardware validation.","The protocol is documented as a bridge target, but no executable GrideX module or hardware validation exists yet."):t("Статусът е проследим до наличната проектна документация и код.","The status is traceable to available project documentation and source code.")}</small></span></div>
      </article>;
    })}</div>:<article className="card supported-empty"><i>⌕</i><h3>{t("Няма съвпадащи драйвери","No matching drivers")}</h3><p>{t("Променете търсенето или изберете друг интерфейс.","Change the search or choose another interface.")}</p><button className="secondary-btn" onClick={()=>{setQuery("");setCategory("all");setProtocol("all");}}>{t("Покажи всички","Show all")}</button></article>}
    <article className="card supported-group-readiness"><i>≋</i><div><p>{t("ГОТОВНОСТ ЗА ГРУПОВО УПРАВЛЕНИЕ","GROUP-CONTROL READINESS")}</p><h3>{t("Каталогът ще определя кои устройства и обекти могат безопасно да участват в обща група","The catalogue will determine which devices and sites can safely participate in one control group")}</h3><span>{t("Групирането ще допуска само профили с еднаква канонична команда, известна полярност, актуални BMS лимити и достатъчно ниво на валидация. Външните R&D референции няма да получават групови команди преди bench и commissioning тест.","Grouping will only allow profiles with the same canonical command, known polarity, fresh BMS limits and sufficient validation. External R&D references will not receive group commands before bench and commissioning validation.")}</span></div><strong><small>{t("СЛЕДВАЩ ЕТАП","NEXT STAGE")}</small>Portfolio / VPP groups</strong></article>
    <article className="supported-source-note"><i>OS</i><span><strong>{t("Лицензионна и инженерна граница","Licensing and engineering boundary")}</strong><small>{t("Модулите от ai-republic/bms-to-inverter са CC BY-NC-SA 4.0 и не се включват директно в търговския GrideX продукт без разрешение. Анализът open-giv/bms-analysis е MIT и добавя GivEnergy LV и bridge design референции. Всеки production драйвер ще има собствена версия, тестове и доказателствен статус.","Modules from ai-republic/bms-to-inverter use CC BY-NC-SA 4.0 and are not embedded directly into the commercial GrideX product without permission. The open-giv/bms-analysis work uses MIT and adds GivEnergy LV and bridge design references. Every production driver will have its own version, tests and evidence status.")}</small></span><div className="supported-source-links"><a href="https://github.com/ai-republic/bms-to-inverter" target="_blank" rel="noreferrer">ai-republic ↗</a><a href="https://github.com/open-giv/bms-analysis" target="_blank" rel="noreferrer">open-giv ↗</a></div></article>
  </section>;
}
