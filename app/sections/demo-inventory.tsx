"use client";
import type {UiLanguage} from '../i18n/messages';
import {translate,type TranslationKey} from '../i18n/catalog';
import {navigationLabel,navigationCatalogue} from '../lib/navigation';
import {sectionHref} from '../lib/routes';

const samples=[
  {id:'battery',model:'SunStorage PRO STE-261L-125P',value:'261 kWh'},
  {id:'inverter',model:'Sungrow SG125CX-P2',value:'72.4 kW'},
  {id:'evse',model:'ABB Terra AC',value:'11 kW'},
  {id:'loads',model:'',value:'124.3 kW'},
] as const;
export function DemoAssetInventory({lang,view='assets'}:{lang:UiLanguage;view?:string}){
  const t=(key:TranslationKey)=>translate(lang,key);
  return <>
    {view==='assets'&&<DemoSectionLinks view="assets" lang={lang}/>}
    <section className="card config-card energy-register"><h2>{navigationLabel(view,lang)}</h2><p>{t('demo.inventoryNote')}</p>
      <div className="register-scroll"><table><thead><tr>{['demo.asset','demo.type','demo.model','demo.value'].map(key=><th key={key}>{t(key as TranslationKey)}</th>)}</tr></thead>
      <tbody>{samples.filter(item=>view==='assets'||item.id===view).map(item=><tr key={item.id} data-demo-asset={item.id}>
        <td>{navigationLabel(item.id,lang)} 01</td><td>{t(item.id==='battery'?'demo.storage':item.id==='inverter'?'demo.production':'demo.consumption')}</td>
        <td>{item.model||t('demo.load')}</td><td>{item.value}</td>
      </tr>)}</tbody></table></div>
      <p><a href={sectionHref('devices','',true)}>{t('demo.infrastructureRequired')} →</a></p>
    </section>
  </>;
}
export function DemoInfrastructure({lang}:{lang:UiLanguage}){
  const t=(key:TranslationKey)=>translate(lang,key);
  const rows:[TranslationKey,string][]=[
    ['demo.edge','ROCK Pi E'],['demo.node','ESP32 / OLIMEX'],['demo.meter','Janitza UMG 604'],
    ['demo.router','—'],['demo.controller','—'],['demo.sensor','—'],['demo.cloud','—'],
  ];
  return <section className="card config-card energy-register"><h2>{navigationLabel('devices',lang)}</h2><p>{t('demo.infrastructureNote')}</p>
    <div className="register-scroll"><table><thead><tr><th>{t('demo.type')}</th><th>{t('demo.model')}</th><th>{t('demo.status')}</th></tr></thead>
      <tbody>{rows.map(([key,model])=><tr key={key}><td>{t(key)}</td><td>{model}</td><td>{t(model==='—'?'demo.catalogue':'demo.sample')}</td></tr>)}</tbody></table></div>
    <p><a href={sectionHref('assets','',true)}>{navigationLabel('assets',lang)} →</a></p>
  </section>;
}
export function DemoSectionLinks({view,lang}:{view:string;lang:UiLanguage}){
  return <section className="sites-grid">{navigationCatalogue.filter(row=>row.parent_id===view).map(row=><article className="card site-card" key={row.id}>
    <h2>{navigationLabel(row.id,lang)}</h2>
    {row.requirement==='coming_soon'&&<p>{translate(lang,'demo.futureNote')}</p>}
    <a className="secondary-btn" href={sectionHref(row.id,'',true)}>{translate(lang,'demo.open')} →</a>
  </article>)}</section>;
}
