import type {RockTelemetryItem} from './gridex-api';

// Deduplicate only the exact source and metric. Never merge different sensors.
export function telemetryRows(items:RockTelemetryItem[]):RockTelemetryItem[]{
  const rows=new Map<string,RockTelemetryItem>();
  for(const item of items){
    const key=JSON.stringify([item.assetId,item.metric,item.unit]);
    const old=rows.get(key);
    rows.set(key,{...item,points:[...(old?.points||[]),...item.points].filter(point=>Number.isFinite(point.x)&&Number.isFinite(point.y))});
  }
  return [...rows.values()];
}

export function telemetryValue(value:number,unit:string,locale:string){
  const number=(v:number)=>new Intl.NumberFormat(locale,{maximumFractionDigits:1}).format(v);
  if(unit==='bytes')return `${number(value/1048576)} MiB`;
  if(unit==='s')return `${number(value/3600)} h`;
  return `${number(value)} ${unit==='Cel'?'°C':unit==='load'?'':unit}`.trim();
}
