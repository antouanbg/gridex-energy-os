import type { UiLanguage } from "./messages";

export const LANGUAGE_PREFERENCE_STORAGE_KEY = "gridex-ui-language";

/**
 * A static portal has no trustworthy server-side country signal. Europe/Sofia
 * is Bulgaria's dedicated IANA time zone and is available without requesting
 * precise device location or sending an IP address to a third party.
 */
export function languageForTimeZone(timeZone?: string): UiLanguage {
  return timeZone === "Europe/Sofia" ? "bg" : "en";
}

export function resolveUiLanguage(input: {
  pathname?: string;
  savedPreference?: string | null;
  timeZone?: string;
}): UiLanguage {
  if (input.pathname?.startsWith("/en")) return "en";
  if (input.savedPreference === "bg" || input.savedPreference === "en") return input.savedPreference;
  return languageForTimeZone(input.timeZone);
}
