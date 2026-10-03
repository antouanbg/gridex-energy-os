import bg from './locales/bg.json' with {type:'json'};
import en from './locales/en.json' with {type:'json'};

// BCP 47 identifiers. Register each new locale here with the complete key set.
export const localeCatalogs = {bg, en} satisfies Record<string, Record<keyof typeof bg, string>>;
export type SupportedLocale = keyof typeof localeCatalogs;
export type TranslationKey = keyof typeof bg;
export const defaultLocale: SupportedLocale = 'bg';
export function resolveLocale(value: string): SupportedLocale {
  const normalised = value.toLowerCase().replace('_','-');
  const candidate = Object.keys(localeCatalogs).find(key => key.toLowerCase() === normalised)
    ?? Object.keys(localeCatalogs).find(key => key.toLowerCase() === normalised.split('-')[0]);
  return (candidate as SupportedLocale | undefined) ?? defaultLocale;
}
export function translate(locale: string, key: TranslationKey): string {
  return localeCatalogs[resolveLocale(locale)][key] ?? localeCatalogs[defaultLocale][key];
}
export function formatNumber(value: number, locale: string, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat(resolveLocale(locale), options).format(value);
}
export function formatDate(value: Date, locale: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(resolveLocale(locale), options).format(value);
}
