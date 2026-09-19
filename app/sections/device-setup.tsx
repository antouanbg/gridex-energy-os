"use client";
import { useEffect, useState } from 'react';
import type { GridexApiClient, GridexHardwareTopology, DeviceSetup, DeviceSetupRole } from '../lib/gridex-api';
import type { UiLanguage } from '../i18n/messages';
import { DeviceAccess } from './device-access';

export function DeviceSetupWizard({api, siteId, topology, lang}: {api:GridexApiClient; siteId:string; topology:GridexHardwareTopology; lang:UiLanguage}) {
  const t=(bg:string,en:string)=>lang==='en'?en:bg;
  const [saved,setSaved]=useState<DeviceSetup|null>(null);
  const [selected,setSelected]=useState('');
  const [roles,setRoles]=useState<DeviceSetupRole[]>([]);
  const [notice,setNotice]=useState('');
  const [busy,setBusy]=useState(false);
  const [provision,setProvision]=useState(false);
  const [confirmed,setConfirmed]=useState(false);
  const [editImported,setEditImported]=useState(false);
  useEffect(()=>{
    const abort=new AbortController();
    void api.deviceSetup(siteId,abort.signal).then(value=>{if(!abort.signal.aborted)setSaved(value);}).catch(()=>{if(!abort.signal.aborted)setNotice('failed');});
    return()=>abort.abort();
  },[api,siteId]);
  const gateway=topology.gateways.find(g=>g.id===selected);
  const importedDevice=saved?.imported?.devices?.find(d=>d.gatewayId===selected);
  const update=(index:number,patch:Partial<DeviceSetupRole>)=>{setRoles(items=>items.map((item,i)=>i===index?{...item,...patch}:item));setProvision(false);setConfirmed(false);};
  return <section className="card config-card" data-no-translate>
    <h2>{t('Настройка на устройство','Device setup')}</h2>
    {!!saved?.imported?.devices?.length&&<section aria-label={t('Внесени устройства','Imported devices')}>
      <h3>{t('Запазена тестова конфигурация','Saved test configuration')}</h3>
      <p>{t('Устройствата вече са заведени към този Обект. Не е необходимо да ги добавяте или настройвате повторно. Изберете устройство от менюто за подробности.','These devices already belong to this Site. Do not add or provision them again. Select a device below for details.')}</p>
      <ul>{saved.imported.devices.map(device=>{
        const item=topology.gateways.find(g=>g.id===device.gatewayId);
        return item?<li key={device.gatewayId}>{item.name} · {item.hardwareModel} — {t('конфигурация внесена; връзката не е потвърдена','configuration imported; connectivity unverified')}</li>:null;
      })}</ul>
    </section>}
    <p>{t('1. Устройство → 2. До две роли и партньор → 3. Provisioning','1. Device → 2. Up to two roles and peer → 3. Provisioning')}</p>
    <label>{t('Устройство','Device')}<select aria-label={t('Устройство','Device')} disabled={!saved||busy} value={selected} onChange={event=>{
      const id=event.target.value;setSelected(id);setRoles(saved?.configuration.devices?.find(d=>d.gatewayId===id)?.roles||[]);setProvision(false);setConfirmed(false);setEditImported(false);setNotice('');
    }}><option value="">{t('Избери устройство','Choose device')}</option>{topology.gateways.map(g=><option key={g.id} value={g.id}>{g.name} · {g.hardwareModel}</option>)}</select></label>
    {!saved&&!notice&&<p role="status">{t('Зареждане на настройките…','Loading setup…')}</p>}
    {importedDevice&&<section>
      <h3>{t('Съществуваща тестова конфигурация — внесена','Existing test configuration — imported')}</h3>
      <p>{t('Не е необходим повторен provisioning. Източник: конфигурационният файл на ROCK Pi. Адресите са запазени криптирано.','No repeat provisioning required. Source: ROCK Pi configuration file. Addresses are stored encrypted.')}</p>
      <p>{gateway?.role==='controller'?t('ROCK Pi: polling на нода и локален Modbus listener.','ROCK Pi: node polling and local Modbus listener.'):t('ESP32: Modbus TCP през ROCK Pi; DHCP резервация.','ESP32: Modbus TCP through ROCK Pi; DHCP reservation.')}</p>
      <p>Polling: {saved?.imported?.pollMs} ms · Timeout: {saved?.imported?.timeoutMs} ms</p>
      <p>{t('Live телеметрията не е потвърдена. Одобренията за батерията са изключени. Няма приложени хардуерни промени.','Live telemetry is not verified. Battery commissioning approvals are off. No hardware changes applied.')}</p>
      <button type="button" onClick={()=>setEditImported(v=>!v)}>{editImported?t('Затвори новата чернова','Close new draft'):t('Създай отделна чернова за промяна','Create a separate change draft')}</button>
    </section>}
    {gateway&&(!importedDevice||editImported)&&<form onSubmit={async event=>{
      event.preventDefault();if(!saved||!confirmed||!roles.length||busy)return;
      setBusy(true);setNotice('');
      try {
        const devices=[...(saved.configuration.devices||[]).filter(d=>d.gatewayId!==selected),{gatewayId:selected,roles}];
        const result=await api.saveDeviceSetup(siteId,{devices},saved.revision);
        setSaved({...result,imported:saved.imported});setNotice('saved');setProvision(true);setConfirmed(false);
      } catch {setNotice('failed');setProvision(false);} finally{setBusy(false);}
    }}>
      <fieldset disabled={busy}>
        {roles.map((role,index)=><div key={index} className="config-form">
          <h3>{t('Роля','Role')} {index+1}</h3>
          <label>{t('Предназначение','Purpose')}<select value={role.kind} onChange={e=>update(index,e.target.value==='backend'?{kind:'backend',target:'backend',transport:'ethernet'}:{kind:'equipment',target:'deye-100kw',transport:'rs485'})}>
            <option value="equipment">{t('Комуникация с оборудване','Equipment communication')}</option>
            {gateway.role==='controller'&&<option value="backend">{t('Комуникация с backend','Backend communication')}</option>}
          </select></label>
          <label>{t('Комуникира с','Communicates with')}<select value={role.target} onChange={e=>update(index,{target:e.target.value as DeviceSetupRole['target']})}>
            {role.kind==='backend'?<option value="backend">GrideX backend</option>:<><option value="deye-100kw">Deye 100 kW</option><option value="suntech-261">Suntech 261 (BESS)</option></>}
          </select></label>
          <label>{t('Комуникация','Transport')}<select value={role.transport} onChange={e=>update(index,{transport:e.target.value as DeviceSetupRole['transport']})}>
            {role.kind==='backend'?<option value="ethernet">Ethernet</option>:<><option value="rs485">RS485 / Modbus RTU</option><option value="modbus-tcp">Modbus TCP</option></>}
          </select></label>
          <button type="button" onClick={()=>{setRoles(items=>items.filter((_,i)=>i!==index));setProvision(false);setConfirmed(false);}}>{t('Премахни ролята','Remove role')}</button>
        </div>)}
        <button type="button" disabled={roles.length>=2} onClick={()=>{setRoles(items=>[...items,{kind:'equipment',target:'deye-100kw',transport:'rs485'}]);setProvision(false);setConfirmed(false);}}>{t('Добави роля (макс. 2)','Add role (max. 2)')}</button>
        <p>{t('Това е план, не активен драйвер. Точният модел/протокол ще се проверява преди прилагане. Няма команди към хардуера.','This is a plan, not an active driver. Exact model/protocol must be verified before applying. No hardware commands.')}</p>
        <label><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/>{t('Потвърждавам запис на черновата','Confirm saving the draft')}</label>
        <button className="primary-btn" disabled={!confirmed||!roles.length} type="submit">{t('Запиши и продължи към provisioning','Save and continue to provisioning')}</button>
      </fieldset>
    </form>}
    <p role="status">{notice==='saved'?t('Черновата е записана в backend. Не е приложена към устройството.','Draft saved in backend. Not applied to hardware.'):notice==='failed'?t('Неуспешна операция. При промяна от друг администратор презареди страницата.','Operation failed. Reload if another administrator changed the configuration.'):''}</p>
    {provision&&gateway?.role==='controller'&&<DeviceAccess key={selected} gatewayId={selected} api={api} siteId={siteId} lang={lang}/>}
    {provision&&gateway?.role==='device-node'&&<p>{t('ESP32 provisioning е през ROCK Pi. IP се получава по DHCP; резервацията и driver прилагането предстоят. Не въвеждай SSH ключ за ESP32.','ESP32 provisioning goes through ROCK Pi. IP is assigned by DHCP; reservation and driver application remain pending. Do not enter an SSH key for ESP32.')}</p>}
  </section>;
}
