import type { UiLanguage } from '../i18n/messages';

export const rockMetricOrder = [
  'cpuTemperatureC', 'uptimeSeconds', 'load1',
  'memoryAvailableBytes', 'storageDataFreeBytes', 'journalSizeBytes',
] as const;

const descriptions: Record<string, { bg: string; en: string; detailBg: string; detailEn: string }> = {
  cpuTemperatureC: { bg: 'Температура на процесора', en: 'Processor temperature', detailBg: 'Температура на чипа в ROCK Pi', detailEn: 'ROCK Pi chip temperature' },
  uptimeSeconds: { bg: 'Време от последното стартиране', en: 'Time since last restart', detailBg: 'Колко време работи ROCK Pi без рестарт', detailEn: 'How long ROCK Pi has run without a restart' },
  load1: { bg: 'Натоварване за 1 минута', en: 'One-minute system load', detailBg: 'Среден брой задачи, които използват или чакат процесора; не е процент', detailEn: 'Average number of tasks using or waiting for the CPU; not a percentage' },
  memoryAvailableBytes: { bg: 'Налична оперативна памет', en: 'Available memory', detailBg: 'Памет, която системата може да използва', detailEn: 'Memory the system can use' },
  storageDataFreeBytes: { bg: 'Свободно място за данни', en: 'Free data storage', detailBg: 'Свободно пространство за файлове и журнал', detailEn: 'Space available for files and the journal' },
  journalSizeBytes: { bg: 'Локален журнал', en: 'Local journal', detailBg: 'Размер на локално записаните телеметрични данни; не показва сам по себе си дали са доставени', detailEn: 'Size of locally recorded telemetry; does not by itself confirm delivery' },
};

export function rockMetricDescription(metric: string, lang: UiLanguage) {
  const entry = descriptions[metric];
  return entry ? { title: lang === 'en' ? entry.en : entry.bg, detail: lang === 'en' ? entry.detailEn : entry.detailBg }
    : { title: metric, detail: lang === 'en' ? 'Recorded device measurement' : 'Записано измерване от устройството' };
}

export function formatRockMetric(metric: string, value: number, unit: string, lang: UiLanguage) {
  if (!Number.isFinite(value)) return '—';
  const locale = lang === 'en' ? 'en-GB' : 'bg-BG';
  const number = (digits: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(value);
  if (metric === 'uptimeSeconds' && unit === 's') {
    const seconds = Math.max(0, Math.floor(value));
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor(seconds % 86400 / 3600);
    const minutes = Math.floor(seconds % 3600 / 60);
    if (days) return lang === 'en' ? `${days} d ${hours} h ${minutes} min` : `${days} д ${hours} ч ${minutes} мин`;
    if (hours) return lang === 'en' ? `${hours} h ${minutes} min` : `${hours} ч ${minutes} мин`;
    if (minutes) return lang === 'en' ? `${minutes} min` : `${minutes} мин`;
    return lang === 'en' ? `${seconds} sec` : `${seconds} сек`;
  }
  if (unit === 'bytes') {
    const scale = value >= 1e9 ? 1e9 : value >= 1e6 ? 1e6 : value >= 1e3 ? 1e3 : 1;
    const suffix = scale === 1e9 ? (lang === 'en' ? 'GB' : 'ГБ')
      : scale === 1e6 ? (lang === 'en' ? 'MB' : 'МБ')
      : scale === 1e3 ? (lang === 'en' ? 'kB' : 'кБ') : (lang === 'en' ? 'B' : 'Б');
    return `${new Intl.NumberFormat(locale, { maximumFractionDigits: scale === 1 ? 0 : 1 }).format(value / scale)} ${suffix}`;
  }
  if (unit === 'Cel') return `${number(1)} °C`;
  if (unit === 'load') return number(2);
  return `${number(1)}${unit ? ` ${unit}` : ''}`;
}

export function formatRockMetricTime(timestamp: number, lang: UiLanguage) {
  if (!Number.isFinite(timestamp) || timestamp < 1e12 || timestamp > Date.now() + 60000) return null;
  return new Date(timestamp).toLocaleString(lang === 'en' ? 'en-GB' : 'bg-BG', { dateStyle: 'short', timeStyle: 'medium' });
}
