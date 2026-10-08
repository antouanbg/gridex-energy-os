"use client";

import { useEffect, useMemo, useState } from 'react';
import { GridexApiError, type GridexApiClient, type SiteVisualisationHistory } from '../lib/gridex-api';
import type { UiLanguage } from '../i18n/messages';
import { sectionHref } from '../lib/routes';
import { translate } from '../i18n/catalog';

const metrics: Record<string,{bg:string;en:string}> = {
  cpuTemperatureC:{bg:'Температура на ROCK Pi',en:'ROCK Pi temperature'},
  load1:{bg:'Натоварване на процесора',en:'Processor load'},
  memoryAvailableBytes:{bg:'Свободна памет',en:'Available memory'},
  storageDataFreeBytes:{bg:'Свободно дисково пространство',en:'Free storage'},
  uptimeSeconds:{bg:'Време без рестарт',en:'Uptime'},
  journalSizeBytes:{bg:'Размер на журнала',en:'Journal size'},
};

function humanValue(value:number,unit:string,lang:UiLanguage){
  const locale=lang==='en'?'en-GB':'bg-BG';
  if(unit==='bytes')return `${new Intl.NumberFormat(locale,{maximumFractionDigits:2}).format(value/1073741824)} GiB`;
  if(unit==='s')return `${new Intl.NumberFormat(locale,{maximumFractionDigits:1}).format(value/3600)} h`;
  return `${new Intl.NumberFormat(locale,{maximumFractionDigits:2}).format(value)} ${unit==='Cel'?'°C':unit==='load'?'':unit}`.trim();
}

function Chart({points,unit,lang}:{points:{x:number;y:number}[];unit:string;lang:UiLanguage}){
  const sorted=useMemo(()=>points.filter(point=>Number.isFinite(point.x)&&Number.isFinite(point.y))
    .sort((a,b)=>a.x-b.x),[points]);
  if(!sorted.length)return null;
  const minX=sorted[0].x,maxX=sorted.at(-1)!.x;
  let minY=Infinity,maxY=-Infinity;
  for(const point of sorted){minY=Math.min(minY,point.y);maxY=Math.max(maxY,point.y);}
  const spread=maxY-minY||Math.max(1,Math.abs(maxY)*0.1);
  const px=(x:number)=>40+640*(x-minX)/(maxX-minX||1);
  const py=(y:number)=>205-155*(y-minY)/spread;
  const path=sorted.map((point,index)=>`${index?'L':'M'}${px(point.x).toFixed(1)} ${py(point.y).toFixed(1)}`).join(' ');
  const time=(x:number)=>new Intl.DateTimeFormat(lang==='en'?'en-GB':'bg-BG',
    {day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(x));
  return <div className="site-chart" role="img" aria-label={lang==='en'?'Measured history, last 24 hours':'Измерена история за последните 24 часа'}>
    <svg viewBox="0 0 720 240" preserveAspectRatio="none" aria-hidden="true">
      <line x1="40" y1="205" x2="680" y2="205" className="site-chart-axis"/>
      <line x1="40" y1="128" x2="680" y2="128" className="site-chart-grid"/>
      <line x1="40" y1="50" x2="680" y2="50" className="site-chart-grid"/>
      {sorted.length>1?<path d={path} className="site-chart-line"/>:<circle cx="40" cy="205" r="5" className="site-chart-dot"/>}
    </svg>
    <div className="site-chart-labels"><span>{time(minX)}</span><span>{humanValue(minY,unit,lang)} – {humanValue(maxY,unit,lang)}</span><span>{time(maxX)}</span></div>
  </div>;
}

export function SiteVisualisations({api,siteId,siteName,lang}:{api:GridexApiClient;siteId:string;siteName:string;lang:UiLanguage}){
  const en=lang==='en';
  const [history,setHistory]=useState<SiteVisualisationHistory|null>(null);
  const [selected,setSelected]=useState('');
  const [state,setState]=useState<'loading'|'ready'|'denied'|'site-denied'|'error'>('loading');
  const [revision,setRevision]=useState(0);
  useEffect(()=>{
    if(!siteId)return;
    const abort=new AbortController();
    void api.siteVisualisationHistory(siteId,abort.signal).then(result=>{
      if(abort.signal.aborted)return;
      setHistory(result);const first=result.items.find(item=>item.points.length)||result.items[0];
      setSelected(first?`${first.assetId}:${first.metric}`:'');
      setState('ready');
    }).catch(error=>{if(!abort.signal.aborted)setState(error instanceof GridexApiError&&error.status===403
      ?error.code==='service_not_enabled'?'denied':'site-denied':'error');});
    return()=>abort.abort();
  },[api,siteId,revision]);
  if(!siteId)return <section className="card live-market-empty"><h2>{en?'Select a Site':'Изберете Обект'}</h2>
    <p>{en?'Charts require a Site you are allowed to view.':'Графиките изискват Обект, до който имате достъп.'}</p>
    <a className="secondary-btn" href={sectionHref('sites')}>{en?'My Sites':'Моите обекти'} →</a></section>;
  const item=history?.items.find(row=>`${row.assetId}:${row.metric}`===selected);
  const points=item?.points||[];
  const latest=points.length?points.reduce((a,b)=>a.x>b.x?a:b):null;
  return <div className="site-visualisations" data-no-translate>
    <section className="card live-market-hero"><div><p className="live-market-eyebrow">{en?'SITE · MEASURED HISTORY':'ОБЕКТ · ИЗМЕРЕНА ИСТОРИЯ'}</p>
      <h2>{siteName|| (en?'Site visualisations':'Визуализации на Обект')}</h2>
      <p>{en?'Only measurements recorded for this Site in OpenRemote are shown. No demo or estimated values.':
        'Показват се само измерванията, записани за този Обект в OpenRemote. Няма демо или изчислени стойности.'}</p></div>
      <span className="live-market-provider">OPENREMOTE<br/><small>{en?'Last 24 hours':'Последни 24 часа'}</small></span>
    </section>
    {state==='loading'&&<section className="card live-market-empty" role="status">{en?'Loading measurements…':'Зареждане на измерванията…'}</section>}
    {state==='denied'&&<section className="card live-market-empty" role="status"><h3>{en?'Visualisations are not enabled':'Визуализациите не са разрешени'}</h3>
      <p>{translate(lang,'graphs.serviceDenied')}</p></section>}
    {state==='site-denied'&&<section className="card live-market-empty" role="status"><h3>{translate(lang,'graphs.siteDenied')}</h3>
      <p>{translate(lang,'graphs.siteDeniedHelp')}</p></section>}
    {state==='error'&&<section className="card live-market-empty" role="alert"><h3>{en?'Measurements could not be loaded':'Измерванията не могат да се заредят'}</h3>
      <p>{en?'No stored values are replaced with demo data.':'Не заменяме записаните стойности с демо данни.'}</p>
      <button type="button" className="secondary-btn" onClick={()=>{setHistory(null);setState('loading');setRevision(value=>value+1);}}>{en?'Try again':'Опитайте отново'}</button></section>}
    {state==='ready'&&history&&<section className="card site-chart-card">
      {!history.items.length?<p role="status">{en?'No configured OpenRemote measurements for this Site yet.':'За този Обект още няма настроени измервания в OpenRemote.'}</p>:<>
        <label className="site-chart-select">{en?'Measurement':'Измерване'}<select value={selected} onChange={event=>setSelected(event.target.value)}>
          {history.items.map(row=><option key={`${row.assetId}:${row.metric}`} value={`${row.assetId}:${row.metric}`}>
            {metrics[row.metric]?.[lang]||row.metric}{history.items.filter(item=>item.metric===row.metric).length>1?` · ${row.assetId.slice(-6)}`:''}
          </option>)}
        </select></label>
        {latest?<><div className="site-chart-current"><span>{en?'Last measured':'Последно измерено'}</span>
          <strong>{humanValue(latest.y,item?.unit||'',lang)}</strong><small>{new Date(latest.x).toLocaleString(en?'en-GB':'bg-BG')}</small></div>
          <Chart points={points} unit={item?.unit||''} lang={lang}/></>
          :<p role="status">{en?'No measurements recorded for this period.':'Няма записани измервания за този период.'}</p>}
      </>}
    </section>}
  </div>;
}
