"use client";
import {useEffect,useState} from 'react';
import type {GridexApiClient} from '../lib/gridex-api';
import type {UiLanguage} from '../i18n/messages';
export function DeviceAccess({api,siteId,lang,gatewayId=''}:{api:GridexApiClient;siteId:string;lang:UiLanguage;gatewayId?:string}) {
 const t=(bg:string,en:string)=>lang==='en'?en:bg;
 const [gateways,setGateways]=useState<{id:string;name:string;role:string}[]>([]);
 const [gateway,setGateway]=useState(gatewayId);const [version,setVersion]=useState<number|null>(null);
 const [notice,setNotice]=useState('');const [busy,setBusy]=useState(false);
 useEffect(()=>{let active=true;
  if(siteId)void api.deviceAccessTopology(siteId).then(r=>{if(active)setGateways(r.gateways.filter(g=>g.role==='controller'));}).catch(()=>{if(active)setNotice('denied');});
  return()=>{active=false;};},[api,siteId]);
 useEffect(()=>{let active=true;if(gateway)void api.deviceAccessStatus(siteId,gateway).then(r=>{if(active){setVersion(r.version);setNotice(r.configured?'configured':'empty');}}).catch(()=>{if(active)setNotice('failed');});return()=>{active=false;};},[api,siteId,gateway]);
 if(!siteId||!gateways.length)return null;
 return <section className="card config-card" data-no-translate><h2>{t('Защитен достъп до ROCK Pi','Protected ROCK Pi access')}</h2>
 <p>{t('Само администратор. Ключът не се показва обратно. ESP32 се управлява през ROCK Pi. Записът НЕ тества връзката и НЕ изпълнява OTA.','Administrator only. Keys are never returned. ESP32 is managed through ROCK Pi. Saving does NOT test connectivity or perform OTA.')}</p>
 <p role="status">{notice==='configured'?t('Има записан ключ.','A key is configured.'):notice==='empty'?t('Няма записан ключ.','No key configured.'):notice==='saved'?t('Криптирано и записано.','Encrypted and saved.'):notice==='failed'?t('Операцията не успя. Презаредете преди повторен опит.','Operation failed. Reload before retrying.'):''}</p>
 <form onSubmit={async event=>{event.preventDefault();if(version===null||busy)return;const form=event.currentTarget;const data=new FormData(form);setBusy(true);
 const privateKey=String(data.get('privateKey')||'');const secretField=form.elements.namedItem('privateKey') as HTMLTextAreaElement;secretField.value='';
 try{const r=await api.saveDeviceAccess(siteId,gateway,{kind:'ssh-key',host:String(data.get('host')),port:Number(data.get('port')),username:String(data.get('username')),hostFingerprint:String(data.get('fingerprint')),privateKey,confirmed:data.get('confirm')==='on',expectedVersion:version},version);setVersion(r.version);setNotice('saved');form.reset();}catch{setNotice('failed');setVersion(null);}finally{setBusy(false);}}}>
 <fieldset className="config-form" disabled={busy}>
 <label>{t('Контролер','Controller')}<select required disabled={Boolean(gatewayId)} value={gateway} onChange={e=>{setVersion(null);setGateway(e.target.value);}}><option value="">—</option>{gateways.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></label>
 <label>Host<input name="host" required autoComplete="off"/></label>
 <label>SSH port<input name="port" type="number" min="1" max="65535" defaultValue="22" required/></label>
 <label>{t('Служебен потребител','Service user')}<input name="username" required autoComplete="off"/></label>
 <label>Host fingerprint (SHA256)<input name="fingerprint" required autoComplete="off"/></label>
 <label>{t('Частен SSH ключ — само за запис','Private SSH key — write only')}<textarea name="privateKey" required maxLength={16384} autoComplete="off" spellCheck={false}/></label>
 <label><input name="confirm" type="checkbox" required/>{t('Потвърждавам запис/замяна на достъпа за този контролер.','I confirm storing/replacing access for this controller.')}</label>
 <button className="primary-btn" disabled={version===null} type="submit">{t('Запиши защитено','Save securely')}</button>
 </fieldset></form></section>;
}
