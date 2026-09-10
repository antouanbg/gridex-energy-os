"use client";

import type React from "react";

export function PanelTitle({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) {
  return <div className="card-title"><div><p>{eyebrow}</p><h2>{title}</h2></div>{action}</div>;
}

export function Metric({label,value,unit,badge,type,priceNote="Продаваме към мрежата"}:{label:string;value:string;unit:string;badge:string;type:string;priceNote?:string}) {
  return <article className="card metric"><p>{label}<span>{badge}</span></p><strong>{value} <small>{unit}</small></strong>{type === "charge" ? <div className="charge"><i style={{width:"72%"}}/></div> : type === "price" ? <div className="price-note">{priceNote}</div> : <div className={type}/>}</article>;
}

export function ModeRange({label,value,unit,min,max,onChange}:{label:string;value:number;unit:string;min:number;max:number;onChange:(value:number)=>void}) { return <label className="mode-range"><span>{label}<strong>{value} {unit}</strong></span><input type="range" min={min} max={max} value={value} onChange={e=>onChange(Number(e.target.value))}/><small><b>{min}</b><b>{max}</b></small></label>; }

export function DataTable({headers,rows}:{headers:string[];rows:string[][]}) { return <div className="data-table" role="table"><div className="table-row table-head">{headers.map(h=><span key={h}>{h}</span>)}</div>{rows.map((r,i)=><div className="table-row" key={i}>{r.map((c,n)=><span key={n} className={c==="Изпълнена"||c==="Онлайн"?"positive":c==="Внимание"?"warning-text":""}>{c}</span>)}</div>)}</div>; }

export function Check({text}:{text:string}) { return <div className="check-row"><i>✓</i><span>{text}</span><b>OK</b></div>; }
