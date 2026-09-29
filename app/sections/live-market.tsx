"use client";

import { useEffect, useMemo, useState } from 'react';
import type { DayAheadPrices, GridexApiClient, MarketServices } from '../lib/gridex-api';
import type { UiLanguage } from '../i18n/messages';

const nextDay = () => {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Sofia', year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(new Date());
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return new Date(Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day) + 1)).toISOString().slice(0, 10);
};

export function LiveMarket({ api, lang }: { api: GridexApiClient; lang: UiLanguage }) {
  const t = (bg: string, en: string) => lang === 'en' ? en : bg;
  const [catalog, setCatalog] = useState<MarketServices | null>(null);
  const [country, setCountry] = useState('BG');
  const [zone, setZone] = useState('BG');
  const [date, setDate] = useState(nextDay);
  const [prices, setPrices] = useState<DayAheadPrices | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [catalogError, setCatalogError] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const zones = useMemo(() => catalog?.zones.filter(item => item.country === country) || [], [catalog, country]);

  useEffect(() => {
    const abort = new AbortController();
    api.marketServices(abort.signal).then(result => { setCatalog(result); setCatalogError(false); })
      .catch(() => { if (!abort.signal.aborted) setCatalogError(true); });
    return () => abort.abort();
  }, [api]);

  useEffect(() => {
    if (!catalog || !zone) return;
    const abort = new AbortController();
    setState('loading');
    setPrices(null);
    api.dayAheadPrices(country, zone, date, abort.signal)
      .then(result => { setPrices(result); setState('ready'); })
      .catch(() => { if (!abort.signal.aborted) setState('error'); });
    return () => abort.abort();
  }, [api, catalog, country, zone, date, refresh]);

  const number = new Intl.NumberFormat(lang === 'en' ? 'en-GB' : 'bg-BG', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
  const clock = (iso: string) => new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'bg-BG', {
    timeZone: prices?.timezone || 'Europe/Sofia', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).format(new Date(iso));
  const points = prices?.intervals || [];
  const low = points.length ? Math.min(...points.map(point => point.priceEurMwh)) : null;
  const high = points.length ? Math.max(...points.map(point => point.priceEurMwh)) : null;
  const min = Math.min(0, low ?? 0);
  const max = Math.max(0, high ?? 0);
  const span = Math.max(1, max - min);

  return <div className="market-page live-market">
    <div className="market-subnav"><span className="live-market-tag">● {t('РЕАЛНИ ПАЗАРНИ ДАННИ', 'LIVE MARKET DATA')}</span></div>
    <section className="card live-market-hero">
      <div><p className="live-market-eyebrow">{t('ПАЗАР · ДЕН НАПРЕД', 'MARKET · DAY-AHEAD')}</p>
        <h2>{t('Цени на електроенергията', 'Electricity prices')}</h2>
        <p>{t('Публикувани борсови цени по ценова зона. Не включват тарифи, данъци и договорни надбавки.',
          'Published wholesale prices by bidding zone. Grid fees, taxes and contract markups are not included.')}</p></div>
      <span className="live-market-provider">ENTSO-E<br/><small>Transparency Platform</small></span>
    </section>

    <section className="card live-market-controls" aria-label={t('Избор на пазар', 'Market selection')}>
      <label>{t('Държава', 'Country')}<select value={country} disabled={!catalog} onChange={event => {
        const next = event.target.value; setCountry(next); setZone(catalog?.zones.find(item => item.country === next)?.zone || '');
      }}>{[...new Set((catalog?.zones || []).map(item => item.country))].map(value =>
        <option key={value} value={value}>{new Intl.DisplayNames([lang === 'en' ? 'en' : 'bg'], { type: 'region' }).of(value) || value} · {value}</option>)}</select></label>
      <label>{t('Ценова зона', 'Bidding zone')}<select value={zone} disabled={!catalog} onChange={event => setZone(event.target.value)}>
        {zones.map(item => <option key={item.zone} value={item.zone}>{item.zone}</option>)}</select></label>
      <label>{t('Пазарен продукт', 'Market product')}<select value="day_ahead" disabled><option value="day_ahead">{t('Ден напред', 'Day-ahead')}</option></select></label>
      <label>{t('Дата', 'Date')}<input type="date" value={date} onChange={event => setDate(event.target.value)}/></label>
      <button type="button" onClick={() => setRefresh(value => value + 1)} disabled={!catalog || state === 'loading'}>{t('Обнови', 'Refresh')}</button>
    </section>

    {catalogError && <section className="card live-market-empty" role="status"><h3>{t('Пазарният каталог не е достъпен', 'Market catalogue unavailable')}</h3><p>{t('Не показваме примерни стойности. Опитай отново след публикуването на услугата.', 'No sample values are shown. Try again after the service is published.')}</p></section>}
    {!catalogError && state === 'loading' && <section className="card live-market-empty" role="status">{t('Зареждане на публикуваните цени…', 'Loading published prices…')}</section>}
    {!catalogError && state === 'error' && <section className="card live-market-empty" role="status"><h3>{t('Цените временно не са достъпни', 'Prices are temporarily unavailable')}</h3><p>{t('Провери връзката с доставчика или опитай отново. Не показваме стари или демо данни като актуални.', 'Check the provider connection or retry. Old or demo prices are never shown as current.')}</p></section>}
    {!catalogError && state === 'ready' && prices && points.length === 0 && <section className="card live-market-empty" role="status"><h3>{t('Няма публикувани цени за избрания ден', 'No published prices for this date')}</h3><p>{t('Избери друга дата или обнови по-късно.', 'Choose another date or refresh later.')}</p></section>}
    {!catalogError && state === 'ready' && prices?.status === 'partial' && <section className="card live-market-empty" role="status"><h3>{t('Непълни цени за избрания ден', 'Incomplete prices for this date')}</h3><p>{t('Виждат се само получените интервали. Не използвайте тези данни за автоматично планиране.', 'Only received intervals are shown. Do not use these prices for automatic planning.')}</p></section>}
    {!catalogError && state === 'ready' && prices && points.length > 0 && <>
      <section className="live-market-summary"><article className="card"><small>{t('Минимална цена', 'Lowest price')}</small><strong>{number.format(low!)} <em>EUR/MWh</em></strong></article>
        <article className="card"><small>{t('Максимална цена', 'Highest price')}</small><strong>{number.format(high!)} <em>EUR/MWh</em></strong></article>
        <article className="card"><small>{t('Интервали', 'Intervals')}</small><strong>{points.length}</strong><span>{t('Показани в местното време на зоната', 'Shown in zone-local time')}</span></article></section>
      <section className="card live-market-chart-card"><header><div><p className="live-market-eyebrow">{zone} · {date}</p><h3>{t('Цена по интервали', 'Price by interval')}</h3></div><span>EUR/MWh</span></header>
        <div className="live-market-chart" role="img" aria-label={t('Графика на цените', 'Price chart')}>
          {points.map(point => <div className="live-market-column" key={point.startUtc} title={`${clock(point.startUtc)} · ${number.format(point.priceEurMwh)} EUR/MWh`}>
            <span className={point.priceEurMwh < 0 ? 'negative' : ''} style={{ height: `${Math.max(3, Math.abs(point.priceEurMwh) / span * 140)}px` }}/>
          </div>)}
        </div>
        <p className="live-market-meta">{t('Източник', 'Source')}: {prices.provider} · {t('Обновено', 'Fetched')}: {new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'bg-BG', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(prices.fetchedAt))} · {prices.timezone}</p>
      </section>
      <section className="card live-market-table-card"><h3>{t('Всички интервали', 'All intervals')}</h3><div className="live-market-table"><table><thead><tr><th>{t('От', 'From')}</th><th>{t('До', 'To')}</th><th>{t('Цена', 'Price')} · EUR/MWh</th></tr></thead><tbody>
        {points.map(point => <tr key={point.startUtc}><td>{clock(point.startUtc)}</td><td>{clock(point.endUtc)}</td><td>{number.format(point.priceEurMwh)}</td></tr>)}</tbody></table></div>
        <p>{t('При смяна на часовото време един и същ местен час може да се появи два пъти; интервалите се различават по UTC.', 'At daylight-saving transitions a local hour can repeat; intervals are distinct in UTC.')}</p>
      </section>
    </>}
  </div>;
}
