import { dateTimeStyle } from "#shared/values/readable/readable.format.ts";
import type { ReadableDate } from "#shared/values/readable/readable.format.ts";
import type { Preferences, PreferenceService } from "./preferences.contract.ts";
export function valueFormat(
  service: PreferenceService,
  preferences: Preferences | null,
): ReadableDate {
  const isIso = preferences?.dateFormat === "iso";
  return { locale: service.locale, style: dateTimeStyle, iso: isIso };
}
