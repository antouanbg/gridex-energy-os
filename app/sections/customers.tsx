"use client";

import { useState } from "react";
import { PanelTitle } from "./shared";

export function Customers({navigate,notify}:{navigate:(v:string)=>void;notify:(v:string)=>void}) {
  const customers = [
    {name:"Solaris Industries AD",city:"София",sites:2,assets:17,service:"EMS Pro + Балансиране",status:"Активен",result:"+1268 €"},
    {name:"LogiCore Bulgaria",city:"Пловдив",sites:1,assets:12,service:"EMS Flex",status:"Активен",result:"+326.20 €"},
    {name:"Black Sea Manufacturing",city:"Варна",sites:2,assets:21,service:"EMS Pro + VEM",status:"Активен",result:"+564.47 €"},
    {name:"Retail Parks BG",city:"Бургас",sites:1,assets:9,service:"Мониторинг",status:"За подновяване",result:"+197.36 €"},
  ];
  const [selected,setSelected] = useState(0);
  const customer = customers[selected];
  return <>
    <section className="portfolio-summary"><div><span>Клиенти</span><strong>4</strong></div><div><span>Активни договори</span><strong>7</strong></div><div><span>Управлявани активи</span><strong>59</strong></div><div><span>Месечна стойност</span><strong className="positive">9530.48 €</strong></div></section>
    <section className="customer-layout">
      <article className="card customer-list"><PanelTitle eyebrow="КЛИЕНТСКО ПОРТФОЛИО" title="Организации" action={<button className="secondary-btn" onClick={()=>notify("Новият клиентски формуляр е готов")}>+ Нов клиент</button>}/>{customers.map((c,i)=><button key={c.name} className={selected===i?"customer-row selected":"customer-row"} onClick={()=>setSelected(i)}><i>{c.name.split(" ").map(x=>x[0]).join("").slice(0,2)}</i><span><strong>{c.name}</strong><small>{c.city} · {c.sites} обекта · {c.assets} актива</small></span><em>{c.status}</em><b>{c.result}</b></button>)}</article>
      <article className="card customer-detail"><PanelTitle eyebrow="360° КЛИЕНТСКИ ПРОФИЛ" title={customer.name} action={<span className={customer.status==="Активен"?"pill green":"pill amber-pill"}>● {customer.status}</span>}/><div className="relationship-flow"><button><span>Организация</span><strong>{customer.name}</strong></button><i>→</i><button onClick={()=>navigate("sites")}><span>Обекти</span><strong>{customer.sites} активни</strong></button><i>→</i><button onClick={()=>navigate("devices")}><span>Устройства</span><strong>{customer.assets} свързани</strong></button><i>→</i><button><span>Метрични точки</span><strong>{customer.assets*8} mapped</strong></button></div><div className="contract-card"><div><span>Активна услуга</span><strong>{customer.service}</strong><small>Договор GX-2026-{104+selected} · валиден до 31.12.2027</small></div><button className="primary-btn" onClick={()=>notify("Договорът е отворен")}>Отвори договор</button></div><div className="customer-actions"><button onClick={()=>navigate("overview")}>⌂ Оперативен преглед</button><button onClick={()=>navigate("settlement")}>¤ Сетълмент</button><button onClick={()=>navigate("alarms")}>△ Аларми</button></div></article>
    </section>
  </>;
}
