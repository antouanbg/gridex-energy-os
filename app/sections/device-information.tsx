"use client";

import { useEffect, useState } from 'react';
import type { DeviceHeartbeat, GridexApiClient, GridexHardwareTopology } from '../lib/gridex-api';
import type { UiLanguage } from '../i18n/messages';
import { DeviceSetupWizard } from './device-setup';

export function DeviceInformation({ api, siteId, lang, configure = false }: { api: GridexApiClient; siteId: string; lang: UiLanguage; configure?: boolean }) {
  const t = (bg: string, en: string) => lang === 'en' ? en : bg;
  const [loaded, setTopology] = useState<{ siteId: string; value: GridexHardwareTopology } | null>(null);
  const [status, setStatus] = useState('loading');
  const [refresh, setRefresh] = useState(0);
  const [health, setHealth] = useState<{ siteId: string; items: DeviceHeartbeat[] } | null>(null);
  const [healthError, setHealthError] = useState(false);
  const topology = loaded?.siteId === siteId && status === 'ready' ? loaded.value : null;
  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const result = await api.deviceHeartbeats(siteId, controller.signal);
        if (!controller.signal.aborted) { setHealth({ siteId, items: result.items }); setHealthError(false); }
      } catch {
        if (!controller.signal.aborted) { setHealth(null); setHealthError(true); }
      }
      if (!controller.signal.aborted) timer = setTimeout(poll, 10000);
    };
    if (siteId) void poll();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [api, siteId, refresh]);
  const time = (value?: string | null) => value ? new Date(value).toLocaleString(lang === 'en' ? 'en-GB' : 'bg-BG') : t('Няма потвърдено съобщение', 'No confirmed message');
  const healthLabel = (item?: DeviceHeartbeat) => healthError ? t('Проверката е недостъпна', 'Status check unavailable')
    : item?.status === 'online' ? t('Има връзка', 'Connected')
    : item?.status === 'offline' ? t('Няма скорошен контакт', 'No recent contact')
    : item?.status === 'stale' ? t('Остарял статус — чакаме ново съобщение', 'Stale — waiting for a new message')
    : t('Връзката още не е потвърдена', 'Connection not yet confirmed');
  useEffect(() => {
    const controller = new AbortController();
    if (siteId) void api.hardware(siteId, controller.signal).then(result => {
      if (!controller.signal.aborted) { setTopology({siteId,value:result}); setStatus('ready'); }
    }).catch((error: { status?: number }) => {
      if (!controller.signal.aborted) { setTopology(null); setStatus(error.status === 409 ? 'unprovisioned' : error.status === 403 || error.status === 404 ? 'denied' : 'failed'); }
    });
    return () => controller.abort();
  }, [api, siteId, refresh]);

  return <section className="card config-card device-inventory" data-no-translate>
    <h2>{t('Информация за устройствата', 'Device information')}</h2>
    <p>{t('Инвентар от OpenRemote през backend за избрания Обект. Само за потвърден администратор. Регистрацията не доказва работеща връзка.', 'OpenRemote inventory through the backend for the selected Site. Verified administrators only. Registration does not prove connectivity.')}</p>
    {!siteId ? <p>{t('Изберете Обект.', 'Select a Site.')}</p> : <>
      <button className="primary-btn" type="button" disabled={status === 'loading'} onClick={() => { setTopology(null); setStatus('loading'); setRefresh(value => value + 1); }}>{t('Обнови', 'Refresh')}</button>
      <p role="status">{status === 'loading' ? t('Зареждане…', 'Loading…') : status === 'denied' ? t('Нямате администраторски достъп до устройствата на този Обект.', 'You do not have administrator access to this Site inventory.') : status === 'unprovisioned' ? t('Инвентарът изисква завършено провизиране и права в OpenRemote.', 'Inventory requires completed provisioning and access in OpenRemote.') : status === 'failed' ? t('OpenRemote инвентарът е недостъпен. Опитайте отново.', 'OpenRemote inventory is unavailable. Please retry.') : ''}</p>
      {topology && <>
        {configure && <DeviceSetupWizard key={siteId} api={api} siteId={siteId} topology={topology} lang={lang} connectionLabel={id => healthLabel(health?.siteId === siteId ? health.items.find(item => item.gatewayId === id) : undefined)}/>}
        <p>{t('Конфигурация', 'Configuration')}: {topology.configuration ? `${topology.configuration.revision} · ${topology.configuration.status}` : t('Няма записана ревизия', 'No saved revision')}</p>
        {!topology.gateways.length && <p>{t('Няма регистрирани шлюзове или нодове.', 'No registered gateways or nodes.')}</p>}
        {topology.gateways.map((gateway, index) => {
          const item = health?.siteId === siteId ? health.items.find(value => value.gatewayId === gateway.id) : undefined;
          return <article key={gateway.id || index}>
          <h3>{gateway.name}</h3>
          <dl>
            <dt>{t('Модел', 'Model')}</dt><dd>{gateway.hardwareModel}</dd>
            <dt>{t('Роля', 'Role')}</dt><dd>{gateway.role === 'controller' ? t('Edge шлюз / контролер', 'Edge gateway / controller') : t('Нод зад Edge шлюза', 'Node behind the Edge gateway')}</dd>
            <dt>{t('Идентификатор', 'Identifier')}</dt><dd>{gateway.id || '—'}</dd>
            <dt>{t('Интерфейси', 'Interfaces')}</dt><dd>{gateway.ports.map(port => `${port.name} (${port.transport})`).join(', ') || '—'}</dd>
            <dt>{t('Връзка', 'Connection')}</dt><dd>{healthLabel(item)}</dd>
            {gateway.role === 'controller' ? <>
              <dt>{t('Последно съобщение от ROCK Pi в backend', 'Last ROCK Pi message received by backend')}</dt><dd>{time(item?.receivedAt)}</dd>
            </> : <>
              <dt>{t('Последен успешен контакт с ESP32 през ROCK Pi', 'Last successful ESP32 contact through ROCK Pi')}</dt><dd>{time(item?.lastSuccessfulContactAt)}</dd>
              <dt>{t('ESP32 heartbeat брояч', 'ESP32 heartbeat counter')}</dt><dd>{item?.heartbeat ?? '—'}</dd>
            </>}
          </dl>
        </article>; })}
        <h3>{t('Свързани устройства', 'Attached devices')}</h3>
        {!topology.devices.length && <p>{t('Няма регистрирани допълнителни устройства.', 'No additional devices registered.')}</p>}
        {topology.devices.map(device => <article key={device.id}><h4>{device.name}</h4><p>{device.manufacturer} · {device.model} · {device.protocol}</p><p>{t('Драйвер', 'Driver')}: {device.driverKey || '—'} · {t('Статус на конфигурацията', 'Configuration status')}: {device.status}</p></article>)}
        <p>{t('Само преглед. Тук не се изпращат команди, OTA или Modbus записи към батерията.', 'Read only. No commands, OTA or battery Modbus writes are sent here.')}</p>
      </>}
    </>}
  </section>;
}
