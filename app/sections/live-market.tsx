"use client";

import { useEffect, useState } from 'react';
import { GridexApiError, type GridexApiClient, type MarketHealth, type MarketCollectionZone } from '../lib/gridex-api';
import { formatMarketDeliveryDate } from '../lib/market-date';
import type { UiLanguage } from '../i18n/messages';

export function LiveMarket({ api, lang, platformAdmin, grafanaEnabled }: { api: GridexApiClient; lang: UiLanguage; platformAdmin: boolean; grafanaEnabled: boolean }) {
  const t = (bg: string, en: string) => lang === 'en' ? en : bg;
  const [health, setHealth] = useState<MarketHealth | null>(null);
  const [checkedAt,setCheckedAt] = useState<number | null>(null);
  const [state, setState] = useState<'loading'|'restricted'|'error'|'ready'>('loading');
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    if (!platformAdmin) return;
    const abort = new AbortController();
    api.marketStatus(abort.signal).then(result => {
      if (!abort.signal.aborted) { setHealth(result);setCheckedAt(Date.now()); setState('ready'); }
    }).catch(error => {
      if (!abort.signal.aborted) setState(error instanceof GridexApiError && error.status === 403 ? 'restricted' : 'error');
    });
    return () => abort.abort();
  }, [api, refresh, platformAdmin]);
  const stamp = (value: string | null) => value
    ? new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'bg-BG', { dateStyle:'medium',timeStyle:'short',timeZone:'Europe/Sofia' }).format(new Date(value))
    : t('Още няма успешно обновяване', 'No successful refresh yet');
  const bgZone = health?.zones.find(zone => zone.country === 'BG' && zone.zone === 'BG');
  const deliveryDate = formatMarketDeliveryDate(bgZone?.latestDeliveryDate, lang);
  const latestSuccess = health?.zones.reduce<string | null>((date, zone) =>
    zone.lastSuccessAt && (!date || zone.lastSuccessAt > date) ? zone.lastSuccessAt : date, null) || null;
  const latestAttempt = health?.zones.reduce<string | null>((date, zone) =>
    zone.lastAttemptAt && (!date || zone.lastAttemptAt > date) ? zone.lastAttemptAt : date, null) || null;
  const live = bgZone?.status !== 'error' && latestAttempt && checkedAt !== null
    && checkedAt - Date.parse(latestAttempt) < 2 * 60 * 60 * 1000;

  return <div className="market-page live-market">
    <section className="card live-market-hero">
      <div><p className="live-market-eyebrow">{t('ПАЗАР · ДЕН НАПРЕД','MARKET · DAY-AHEAD')}</p>
        <h2>{t('Пазарни данни','Market data')}</h2>
        <p>{grafanaEnabled
          ? t('Часовите цени за България са достъпни в защитените графики по-долу. Пълният архив остава само за супер администратора.',
            'Bulgarian hourly prices are available in the protected charts below. The full archive remains restricted to the platform administrator.')
          : t('Часовите цени се съхраняват за бъдещ анализ в защитен архив. Достъпът до стойностите засега е само за супер администратора.',
            'Hourly prices are retained in a protected archive for future analysis. Price values are currently restricted to the platform administrator.')}</p></div>
      <span className="live-market-provider">ENTSO-E<br/><small>Transparency Platform</small></span>
    </section>
    {!platformAdmin && <section className="card live-market-empty" role="status"><h3>{t('Услугата е разрешена','Service enabled')}</h3><p>{grafanaEnabled
      ? t('За България можете да отворите графиките по-долу. Подробният архив и състоянието на източника остават достъпни само за супер администратора.',
        'You can open the Bulgarian charts below. The detailed archive and provider status remain available only to the platform administrator.')
      : t('Ценовите стойности и състоянието на източника засега са видими само за супер администратора.',
        'Prices and provider status are currently visible only to the platform administrator.')}</p></section>}
    {platformAdmin && state === 'loading' && <section className="card live-market-empty" role="status">{t('Проверяваме връзката…','Checking the connection…')}</section>}
    {platformAdmin && state === 'restricted' && <section className="card live-market-empty" role="status"><h3>{t('Достъпът до ценовия архив е ограничен','Market archive access is restricted')}</h3><p>{t('Услугите се разрешават първо от супер администратора за организацията, след това от нейния администратор за отделните потребители. Ценовите стойности още не са публикувани за клиентски достъп.',
      'The platform administrator first enables a service for an organisation; its administrator then enables it for individual users. Price values are not yet published for customer access.')}</p></section>}
    {platformAdmin && state === 'error' && <section className="card live-market-empty" role="status"><h3>{t('Състоянието не е достъпно','Status unavailable')}</h3><p>{t('Няма да показваме стари данни като текущи.','Old data will not be presented as current.')}</p></section>}
    {platformAdmin && state === 'ready' && <section className="card live-market-empty" role="status">
      <h3>{live ? t('Проверките към ENTSO-E работят','ENTSO-E checks are running') : t('Проверките към ENTSO-E не са потвърдени','ENTSO-E checks are not confirmed')}</h3>
      <p>{t('Последна проверка (българско време)','Last check (Bulgaria time)')}: {stamp(latestAttempt)}</p>
      <p>{t('Последен напълно получен ден (българско време)','Last complete day received (Bulgaria time)')}: {stamp(latestSuccess)}</p>
      <p>{t('Последна дата с налични BG цени','Latest date with available BG prices')}: {deliveryDate || t('Все още няма публикувани стойности','No published values yet')}</p>
      {bgZone?.status === 'partial' && <p>{t('За следващия ден ENTSO-E връща само част от интервалите. Цените за последния пълен ден са налични; непълният ден не се използва като завършен.',
        'ENTSO-E currently returns only some intervals for the next day. Prices for the last complete day remain available; an incomplete day is not treated as complete.')}</p>}
      {bgZone?.status === 'not_published' && <p>{t('Следващият ден още не е публикуван. Проверяваме отново автоматично веднъж на час.',
        'The next day has not been published yet. We check again automatically once per hour.')}</p>}
      <button type="button" className="secondary-btn" onClick={() => { setState('loading'); setRefresh(value => value + 1); }}>{t('Провери отново','Check again')}</button>
    </section>}
    {platformAdmin && <MarketCollectionControls api={api} lang={lang}/>}
    {grafanaEnabled && <BgDashboard api={api} lang={lang}/>}
  </div>;
}

function BgDashboard({api,lang}:{api:GridexApiClient;lang:UiLanguage}) {
  const en=lang==='en';
  const [url,setUrl]=useState('');
  const [state,setState]=useState<'idle'|'loading'|'error'>('idle');
  const [period,setPeriod]=useState<'delivery'|'recent'|'week'|'month'|'custom'>('delivery');
  const [fromDay,setFromDay]=useState('');
  const [toDay,setToDay]=useState('');
  const [rangeError,setRangeError]=useState('');
  const [shownPeriod,setShownPeriod]=useState('');
  async function open() {
    if(period==='custom'&&(!fromDay||!toDay||fromDay>toDay||
      Date.parse(`${toDay}T00:00:00Z`)-Date.parse(`${fromDay}T00:00:00Z`)>30*86400000)) {
      setRangeError(en?'Choose up to 31 delivery days in order.':'Изберете до 31 дни на доставка в правилен ред.');
      return;
    }
    setRangeError('');
    setState('loading');setUrl('');
    try {
      const launch=await api.grafanaLaunch();
      const target=new URL(launch.url);
      target.searchParams.set('range',period);
      if(period==='custom') {
        target.searchParams.set('fromDay',fromDay);
        target.searchParams.set('toDay',toDay);
      }
      setUrl(target.toString());setShownPeriod(period==='custom'?`${fromDay} – ${toDay}`:period);
      setState('idle');
    }
    catch { setState('error'); }
  }
  const labels={delivery:en?'Today and tomorrow':'Днес и утре',recent:en?'Last 48 hours':'Последните 48 часа',
    week:en?'Last 7 days':'Последните 7 дни',month:en?'Last 30 days':'Последните 30 дни',custom:en?'Choose dates':'Избор на дати'};
  return <section className="card live-market-empty" aria-label={en?'BG market dashboard':'BG пазарен дашборд'}>
    <h3>{en?'Bulgaria · day-ahead charts':'България · графики ден напред'}</h3>
    <p>{en?'Protected Grafana dashboard in the GrideX portal. Market prices are wholesale EUR/MWh, not a customer tariff.':
      'Защитен Grafana дашборд в портала на GrideX. Борсовите цени са в EUR/MWh, не са клиентска тарифа.'}</p>
    <p>{en?'Day-ahead means prices for electricity delivered on the indicated date, determined in the preceding day’s auction. The chart uses Bulgaria time (Europe/Sofia). Select a period below; only published prices are shown. “Last successful refresh” is when GrideX received data from ENTSO-E, not the delivery date.':
      '„Ден напред“ означава цени за електроенергия, доставяна на посочената дата, определени на търга през предходния ден. Графиката е по българско време (Europe/Sofia). Изберете период по-долу; показват се само публикувани цени. „Последно успешно обновяване“ е кога GrideX е получил данните от ENTSO-E, не датата на доставка.'}</p>
    <div className="grafana-period-controls">
      <label>{en?'Chart period':'Период на графиката'}
        <select value={period} onChange={event=>{setPeriod(event.target.value as typeof period);setRangeError('');}}>
          {Object.entries(labels).map(([value,label])=><option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      {period==='custom'&&<>
        <label>{en?'From delivery date':'От дата на доставка'}<input type="date" value={fromDay} onChange={event=>setFromDay(event.target.value)}/></label>
        <label>{en?'Through delivery date':'До дата на доставка'}<input type="date" value={toDay} onChange={event=>setToDay(event.target.value)}/></label>
      </>}
    </div>
    {rangeError&&<p role="alert">{rangeError}</p>}
    <button type="button" className="primary-btn" disabled={state==='loading'} onClick={()=>void open()}>
      {state==='loading'?(en?'Opening…':'Отваряме…'):(en?'Show selected period':'Покажи избрания период')}
    </button>
    {url&&<p className="grafana-period-current">{en?'Showing':'Показан период'}: {shownPeriod in labels?labels[shownPeriod as keyof typeof labels]:shownPeriod}</p>}
    {state==='error'&&<p role="alert">{en?'Dashboard access could not be confirmed. No data were shown.':'Достъпът до дашборда не беше потвърден. Данни не са показани.'}</p>}
    {url&&<iframe title={en?'Bulgaria day-ahead Grafana dashboard':'Grafana дашборд за цени ден напред в България'}
      src={url} referrerPolicy="no-referrer" loading="lazy" className="grafana-market-frame"/>}
  </section>;
}

function MarketCollectionControls({api,lang}:{api:GridexApiClient;lang:UiLanguage}) {
  const en=lang==='en';
  const [zones,setZones]=useState<MarketCollectionZone[]|null>(null);
  const [selected,setSelected]=useState<MarketCollectionZone|null>(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  useEffect(()=>{
    const abort=new AbortController();
    api.marketCollectionZones(abort.signal).then(result=>{if(!abort.signal.aborted)setZones(result.zones);})
      .catch(()=>{if(!abort.signal.aborted)setError(en?'Country settings are unavailable.':'Настройките по държави са недостъпни.');});
    return()=>abort.abort();
  },[api,en]);
  async function change(zone:MarketCollectionZone) {
    setBusy(true);setSelected(null);setError('');
    try {
      await api.setMarketCollectionZone(zone.country,zone.zone,!zone.enabled);
      setZones((await api.marketCollectionZones()).zones);
    } catch { setError(en?'Change not confirmed. Reload before retrying.':'Промяната не е потвърдена. Обновете преди нов опит.'); }
    finally {setBusy(false);}
  }
  return <section className="card live-market-empty service-grants">
    <h3>{en?'Price collection by country':'Събиране на цени по държави'}</h3>
    <p>{en?'Only Bulgaria is enabled by default. Other bidding zones are never fetched or stored until you explicitly enable them here. Existing historical records are not deleted.':
      'Само България е включена по подразбиране. Другите ценови зони не се заявяват и записват, докато не ги разрешите изрично тук. Вече съхранените записи не се изтриват.'}</p>
    {error&&<p role="alert">{error}</p>}
    {zones?.map(zone=><div key={zone.zone} className="service-grant-row">
      <span><strong>{zone.country==='BG'?(en?'Bulgaria':'България'):zone.country} · {zone.zone}</strong> · {zone.enabled?(en?'collecting':'събира се'):(en?'off':'изключено')}</span>
      <button type="button" className="secondary-btn" disabled={busy} onClick={()=>setSelected(zone)}>
        {zone.enabled?(en?'Stop collection':'Спри събирането'):(en?'Enable collection':'Разреши събирането')}
      </button>
    </div>)}
    {selected&&<div role="group" aria-label={en?'Confirm country collection':'Потвърди събирането по държава'}>
      <p>{selected.enabled?(en?`Stop new price collection for ${selected.zone}? Historical records remain.`:`Да спрем ли новите цени за ${selected.zone}? Историческите записи остават.`):
        (en?`Explicitly enable collection and storage for ${selected.zone}?`:`Изрично да разрешим заявяване и запис на цени за ${selected.zone}?`)}</p>
      <button type="button" className="primary-btn" disabled={busy} onClick={()=>void change(selected)}>{en?'Confirm':'Потвърди'}</button>
      <button type="button" className="secondary-btn" onClick={()=>setSelected(null)}>{en?'Cancel':'Откажи'}</button>
    </div>}
  </section>;
}
