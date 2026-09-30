import type { UiLanguage } from '../i18n/messages';

// PostgreSQL DATE may arrive as YYYY-MM-DD or as an ISO timestamp for
// midnight in the database timezone. Both must display as the Sofia date.
export function formatMarketDeliveryDate(value: unknown, lang: UiLanguage): string | null {
  if (typeof value !== 'string' || !value) return null;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T12:00:00Z`)
    : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'bg-BG', {
    dateStyle: 'long', timeZone: 'Europe/Sofia',
  }).format(date);
}
