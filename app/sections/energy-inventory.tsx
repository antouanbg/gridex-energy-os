import {useEffect,useState} from 'react';
import type {GridexApiClient,GridexDeviceConfiguration,GridexSite} from '../lib/gridex-api';
import {navigationLabel} from '../lib/navigation';
import type {UiLanguage} from '../i18n/messages';

export type EnergyInventory={key:string;status:'loading'|'ready'|'error';items:GridexDeviceConfiguration[]};
export function useEnergyInventory(api:GridexApiClient,sites:GridexSite[],identityKey:string,enabled:boolean){
  const [state,setState]=useState<EnergyInventory>({key:'',status:'loading',items:[]});
  const scope=sites.map(s=>s.id).sort().join('|');
  const key=identityKey+'|'+scope;
  useEffect(()=>{
    if(!enabled)return;
    const abort=new AbortController();
    void Promise.all(sites.map(site=>api.devices(site.id,abort.signal))).then(results=>{
      if(!abort.signal.aborted)setState({key,status:'ready',items:results.flat().filter(d=>d.type!=='meter')});
    }).catch(()=>{if(!abort.signal.aborted)setState({key,status:'error',items:[]});});
    return()=>abort.abort();
  },[api,sites,key,enabled]);
  return enabled&&state.key===key?state:{key,status:'loading' as const,items:[]};
}
export function EnergyInventoryView({state,sites,view,lang}:{state:EnergyInventory;sites:GridexSite[];view:string;lang:UiLanguage}){
  const en=lang==='en';
  const items=state.items.filter(item=>view==='assets'||item.type===view);
  return <section className="card energy-register">
    <h2>{navigationLabel(view,lang)}</h2>
    <p>{en?'Registered inventory for your authorised Sites. Commands and configuration remain subject to permissions and deployment checks.':'Заведен инвентар за разрешените Ви Обекти. Командите и настройките остават ограничени от правата и проверките за внедряване.'}</p>
    {state.status==='loading'?<p role="status">{en?'Checking inventory…':'Проверка на инвентара…'}</p>:state.status==='error'?<p role="alert">{en?'Inventory could not be verified. No sample data is substituted.':'Инвентарът не може да бъде проверен. Не се подменя с примерни данни.'}</p>:!items.length?<p role="status">{en?'No authorised assets of this type are registered.':'Няма заведени разрешени активи от този тип.'}</p>:<div className="register-scroll"><table><thead><tr>{[en?'Asset':'Актив',en?'Type':'Тип',en?'Site':'Обект',en?'Model':'Модел',en?'Status':'Състояние'].map(text=><th key={text}>{text}</th>)}</tr></thead><tbody>{items.map(item=><tr key={item.id}><td>{item.name}</td><td>{navigationLabel(item.type,lang)}</td><td>{sites.find(site=>site.id===item.siteId)?.name||'—'}</td><td>{item.manufacturer} {item.model}</td><td>{item.status}</td></tr>)}</tbody></table></div>}
  </section>;
}
