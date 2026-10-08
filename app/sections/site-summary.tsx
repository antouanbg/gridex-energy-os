import {useEffect,useState} from 'react';
import type {GridexApiClient,GridexSite} from '../lib/gridex-api';
import type {UiLanguage} from '../i18n/messages';
import {translate} from '../i18n/catalog';
import {serviceLabel} from '../lib/service-labels';

export function SiteSummary({api,site,lang}:{api:GridexApiClient;site:GridexSite;lang:UiLanguage}){
  const [inventory,setInventory]=useState<string[]|null>(null);
  const [services,setServices]=useState<string[]|null>(null);
  const [failed,setFailed]=useState(false);
  useEffect(()=>{
    const abort=new AbortController();
    void api.hardware(site.id,abort.signal).then(value=>{
      if(!abort.signal.aborted)setInventory([...value.gateways.map(item=>item.name),...value.devices.map(item=>item.name)]);
    }).catch(()=>{if(!abort.signal.aborted)setFailed(true);});
    void Promise.all([api.me(abort.signal),api.myServices(abort.signal)]).then(([user,grants])=>{
      if(!abort.signal.aborted)setServices(user.permissions.includes('platform:manage')?['day_ahead','visualisations']:
        [...new Set(grants.services.filter(item=>item.organisationId===site.organisationId).map(item=>item.code))]);
    }).catch(()=>{if(!abort.signal.aborted)setFailed(true);});
    return()=>abort.abort();
  },[api,site.id,site.organisationId]);
  return <div className="site-summary">
    <strong>{translate(lang,'sites.inventory')}</strong>
    <p>{inventory===null?translate(lang,failed?'sites.unavailable':'sites.checking'):inventory.join(' · ')||translate(lang,'sites.emptyInventory')}</p>
    <strong>{translate(lang,'sites.services')}</strong>
    <p>{services===null?translate(lang,failed?'sites.unavailable':'sites.checking'):services.map(code=>serviceLabel(code,lang)).join(' · ')||translate(lang,'sites.emptyServices')}</p>
    <small>{translate(lang,'sites.summaryScope')}</small>
  </div>;
}
