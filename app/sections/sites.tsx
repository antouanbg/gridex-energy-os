"use client";
import type { UiLanguage } from "../i18n/messages";

export function Sites({ setSite, navigate, lang }: {setSite:(v:string)=>void;navigate:(v:string)=>void;lang:UiLanguage}) {
  const t=(bg:string,en:string)=>lang==="en"?en:bg;
  const data = [
    ["Solar Park East",t("София","Sofia"),"online","248.6 kW","72%","+941.80 €"],
    ["Logistics Hub Plovdiv",t("Пловдив","Plovdiv"),"online","86.4 kW","64%","+326.20 €"],
    ["Factory Varna",t("Варна","Varna"),"online","142.8 kW","81%","+564.47 €"],
    ["Retail Park Burgas",t("Бургас","Burgas"),"warning","64.2 kW","49%","+197.36 €"],
    ["Warehouse Ruse",t("Русе","Ruse"),"online","38.9 kW","76%","+109.42 €"],
    ["Office Center Sofia",t("София","Sofia"),"offline","—","—","—"],
  ];
  return <><div className="portfolio-summary"><div><span>{t("Обща мощност","Total capacity")}</span><strong>581 kW</strong></div><div><span>{t("Енергия днес","Energy today")}</span><strong>6.42 MWh</strong></div><div><span>{t("Активни батерии","Active batteries")}</span><strong>5 / 6</strong></div><div><span>{t("Резултат днес","Result today")}</span><strong className="positive">+2139.25 €</strong></div></div><section className="sites-grid">{data.map((s,i)=>{const status=s[2]; return <button className="site-card card" key={s[0]} onClick={()=>{setSite(s[0]);navigate("overview")}}><div className="site-visual"><span>{["☀","⌂","▦","◇","▥","□"][i]}</span><em className={status === "online" ? "online" : status === "offline" ? "offline" : "warning"}>{status === "online" ? t("Онлайн","Online") : status === "offline" ? t("Офлайн","Offline") : t("Предупреждение","Warning")}</em></div><h2>{s[0]}</h2><p>{s[1]} · BG</p><div className="site-stats"><span>PV<strong>{s[3]}</strong></span><span>SOC<strong>{s[4]}</strong></span><span>{t("Днес","Today")}<strong>{s[5]}</strong></span></div></button>})}</section></>;
}
