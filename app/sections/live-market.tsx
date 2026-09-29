"use client";

import { useEffect, useState } from 'react';
import { GridexApiError, type GridexApiClient, type MarketHealth } from '../lib/gridex-api';
import type { UiLanguage } from '../i18n/messages';

export function LiveMarket({ api, lang, platformAdmin }: { api: GridexApiClient; lang: UiLanguage; platformAdmin: boolean }) {
  const t = (bg: string, en: string) => lang === 'en' ? en : bg;
  const [health, setHealth] = useState<MarketHealth | null>(null);
  const [state, setState] = useState<'loading'|'restricted'|'error'|'ready'>('loading');
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    if (!platformAdmin) return;
    const abort = new AbortController();
    api.marketStatus(abort.signal).then(result => {
      if (!abort.signal.aborted) { setHealth(result); setState('ready'); }
    }).catch(error => {
      if (!abort.signal.aborted) setState(error instanceof GridexApiError && error.status === 403 ? 'restricted' : 'error');
    });
    return () => abort.abort();
  }, [api, refresh, platformAdmin]);
  const stamp = (value: string | null) => value
    ? new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'bg-BG', { dateStyle:'medium',timeStyle:'short' }).format(new Date(value))
    : t('Още няма успешно обновяване', 'No successful refresh yet');
  const latest = health?.zones.reduce<string | null>((date, zone) =>
    zone.lastSuccessAt && (!date || zone.lastSuccessAt > date) ? zone.lastSuccessAt : date, null) || null;
  const live = latest && Date.now() - Date.parse(latest) < 2 * 60 * 60 * 1000;

  return <div className="market-page live-market">
    <section className="card live-market-hero">
      <div><p className="live-market-eyebrow">{t('ПАЗАР · ДЕН НАПРЕД','MARKET · DAY-AHEAD')}</p>
        <h2>{t('Пазарни данни','Market data')}</h2>
        <p>{t('Часовите цени се съхраняват за бъдещ анализ в защитен архив. Достъпът до стойностите засега е само за супер администратора.',
          'Hourly prices are retained in a protected archive for future analysis. Price values are currently restricted to the platform administrator.')}</p></div>
      <span className="live-market-provider">ENTSO-E<br/><small>Transparency Platform</small></span>
    </section>
    {!platformAdmin && <section className="card live-market-empty" role="status"><h3>{t('Услугата е разрешена','Service enabled')}</h3><p>{t('Ценовите стойности и състоянието на източника засега са видими само за супер администратора.','Prices and provider status are currently visible only to the platform administrator.')}</p></section>}
    {platformAdmin && state === 'loading' && <section className="card live-market-empty" role="status">{t('Проверяваме връзката…','Checking the connection…')}</section>}
    {platformAdmin && state === 'restricted' && <section className="card live-market-empty" role="status"><h3>{t('Достъпът до ценовия архив е ограничен','Market archive access is restricted')}</h3><p>{t('Услугите се разрешават първо от супер администратора за организацията, след това от нейния администратор за отделните потребители. Ценовите стойности още не са публикувани за клиентски достъп.',
      'The platform administrator first enables a service for an organisation; its administrator then enables it for individual users. Price values are not yet published for customer access.')}</p></section>}
    {platformAdmin && state === 'error' && <section className="card live-market-empty" role="status"><h3>{t('Състоянието не е достъпно','Status unavailable')}</h3><p>{t('Няма да показваме стари данни като текущи.','Old data will not be presented as current.')}</p></section>}
    {platformAdmin && state === 'ready' && <section className="card live-market-empty" role="status">
      <h3>{live ? t('ENTSO-E API е активно','ENTSO-E API is live') : t('ENTSO-E API не е потвърдено като активно','ENTSO-E API is not confirmed live')}</h3>
      <p>{t('Последно успешно обновяване','Last successful refresh')}: {stamp(latest)}</p>
      <p>{t('Последните публикувани данни по зони','Latest published data by zone')}: {health?.zones.filter(zone => zone.status === 'published').length || 0} / {health?.zones.length || 0}</p>
      <button type="button" className="secondary-btn" onClick={() => { setState('loading'); setRefresh(value => value + 1); }}>{t('Провери отново','Check again')}</button>
    </section>}
  </div>;
}
