"use client";

import { useState } from "react";
import { PanelTitle } from "./shared";
import type { UiLanguage } from "../i18n/messages";

export function Customers({navigate,notify,lang}:{navigate:(v:string)=>void;notify:(v:string)=>void;lang:UiLanguage}) {
  const t=(bg:string,en:string)=>lang==="en"?en:bg;
  const customers = [
    {name:"Solaris Industries AD",city:t("София","Sofia"),sites:2,assets:17,service:t("EMS Pro + Балансиране","EMS Pro + balancing"),status:"active",result:"+1268 €"},
    {name:"LogiCore Bulgaria",city:t("Пловдив","Plovdiv"),sites:1,assets:12,service:"EMS Flex",status:"active",result:"+326.20 €"},
    {name:"Black Sea Manufacturing",city:t("Варна","Varna"),sites:2,assets:21,service:"EMS Pro + VEM",status:"active",result:"+564.47 €"},
    {name:"Retail Parks BG",city:t("Бургас","Burgas"),sites:1,assets:9,service:t("Мониторинг","Monitoring"),status:"renewal",result:"+197.36 €"},
  ];
  const [selected,setSelected] = useState(0);
  const customer = customers[selected];
  return <>
    <section className="portfolio-summary"><div><span>{t("Клиенти","Customers")}</span><strong>4</strong></div><div><span>{t("Активни договори","Active contracts")}</span><strong>7</strong></div><div><span>{t("Управлявани активи","Managed assets")}</span><strong>59</strong></div><div><span>{t("Месечна стойност","Monthly value")}</span><strong className="positive">9530.48 €</strong></div></section>
    <section className="customer-layout">
      <article className="card customer-list"><PanelTitle eyebrow={t("КЛИЕНТСКО ПОРТФОЛИО","CUSTOMER PORTFOLIO")} title={t("Организации","Organisations")} action={<button className="secondary-btn" onClick={()=>notify(t("Новият клиентски формуляр е готов","The new customer form is ready"))}>+ {t("Нов клиент","New customer")}</button>}/>{customers.map((c,i)=><button key={c.name} className={selected===i?"customer-row selected":"customer-row"} onClick={()=>setSelected(i)}><i>{c.name.split(" ").map(x=>x[0]).join("").slice(0,2)}</i><span><strong>{c.name}</strong><small>{c.city} · {c.sites} {t("обекта","sites")} · {c.assets} {t("актива","assets")}</small></span><em>{c.status==="active"?t("Активен","Active"):t("За подновяване","Due for renewal")}</em><b>{c.result}</b></button>)}</article>
      <article className="card customer-detail"><PanelTitle eyebrow={t("360° КЛИЕНТСКИ ПРОФИЛ","360° CUSTOMER PROFILE")} title={customer.name} action={<span className={customer.status==="active"?"pill green":"pill amber-pill"}>● {customer.status==="active"?t("Активен","Active"):t("За подновяване","Due for renewal")}</span>}/><div className="relationship-flow"><button><span>{t("Организация","Organisation")}</span><strong>{customer.name}</strong></button><i>→</i><button onClick={()=>navigate("sites")}><span>{t("Обекти","Sites")}</span><strong>{customer.sites} {t("активни","active")}</strong></button><i>→</i><button onClick={()=>navigate("devices")}><span>{t("Устройства","Devices")}</span><strong>{customer.assets} {t("свързани","connected")}</strong></button><i>→</i><button><span>{t("Метрични точки","Metric points")}</span><strong>{customer.assets*8} {t("свързани","mapped")}</strong></button></div><div className="contract-card"><div><span>{t("Активна услуга","Active service")}</span><strong>{customer.service}</strong><small>{t("Договор","Contract")} GX-2026-{104+selected} · {t("валиден до","valid until")} 31.12.2027</small></div><button className="primary-btn" onClick={()=>notify(t("Договорът е отворен","Contract opened"))}>{t("Отвори договор","Open contract")}</button></div><div className="customer-actions"><button onClick={()=>navigate("overview")}>⌂ {t("Оперативен преглед","Operations overview")}</button><button onClick={()=>navigate("settlement")}>¤ {t("Сетълмент","Settlement")}</button><button onClick={()=>navigate("alarms")}>△ {t("Аларми","Alarms")}</button></div></article>
    </section>
  </>;
}
