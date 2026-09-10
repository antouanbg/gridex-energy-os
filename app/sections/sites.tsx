"use client";

export function Sites({ setSite, navigate }: {setSite:(v:string)=>void;navigate:(v:string)=>void}) {
  const data = [
    ["Solar Park East","София","Онлайн","248.6 kW","72%","+941.80 €"],
    ["Logistics Hub Plovdiv","Пловдив","Онлайн","86.4 kW","64%","+326.20 €"],
    ["Factory Varna","Варна","Онлайн","142.8 kW","81%","+564.47 €"],
    ["Retail Park Burgas","Бургас","Предупреждение","64.2 kW","49%","+197.36 €"],
    ["Warehouse Ruse","Русе","Онлайн","38.9 kW","76%","+109.42 €"],
    ["Office Center Sofia","София","Офлайн","—","—","—"],
  ];
  return <><div className="portfolio-summary"><div><span>Обща мощност</span><strong>581 kW</strong></div><div><span>Енергия днес</span><strong>6.42 MWh</strong></div><div><span>Активни батерии</span><strong>5 / 6</strong></div><div><span>Резултат днес</span><strong className="positive">+2139.25 €</strong></div></div><section className="sites-grid">{data.map((s,i)=><button className="site-card card" key={s[0]} onClick={()=>{setSite(s[0]);navigate("overview")}}><div className="site-visual"><span>{["☀","⌂","▦","◇","▥","□"][i]}</span><em className={s[2] === "Онлайн" ? "online" : s[2] === "Офлайн" ? "offline" : "warning"}>{s[2]}</em></div><h2>{s[0]}</h2><p>{s[1]} · BG</p><div className="site-stats"><span>PV<strong>{s[3]}</strong></span><span>SOC<strong>{s[4]}</strong></span><span>Днес<strong>{s[5]}</strong></span></div></button>)}</section></>;
}
