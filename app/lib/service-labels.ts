import type { UiLanguage } from '../i18n/messages';

const labels: Record<string, { bg: string; en: string }> = {
  day_ahead: { bg: 'Цени ден напред', en: 'Day-ahead prices' },
  visualisations: { bg: 'Графики и визуализации', en: 'Charts and visualisations' },
  analysis: { bg: 'Анализ', en: 'Analysis' },
  meteorology: { bg: 'Метеорология', en: 'Meteorology' },
  forecasting: { bg: 'Прогнозиране', en: 'Forecasting' },
};

export function serviceLabel(code: string, lang: UiLanguage, fallback = code): string {
  return labels[code]?.[lang] || fallback;
}
