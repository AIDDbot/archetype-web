import { ExpectedError } from "#shared/expected.error.ts";
import type { HttpClient } from "#shared/http/http.contract.ts";
import { isOneOf, isRecord } from "#shared/values/values.check.ts";
import type { Preferences, PreferenceSource } from "#shared/session/preferences.contract.ts";
import { dateFormats, themes } from "./settings.type.ts";
import type { SaveResult, SettingsData, SettingsInput } from "./settings.type.ts";
const path = "/api/users/me/settings";
export function readPreferences(value: unknown): Preferences {
  const isObject = isRecord(value);
  if (!isObject) throw new Error("Invalid settings response");
  const theme = value.theme;
  const dateFormat = value.dateFormat;
  const isTheme = isOneOf(theme, themes);
  const isDateFormat = isOneOf(dateFormat, dateFormats);
  const isValid = isTheme && isDateFormat;
  if (!isValid) throw new Error("Invalid settings response");
  return { theme, dateFormat };
}
export const loadPreferences: PreferenceSource = async (http) => {
  try {
    return readPreferences(await http.request({ path }));
  } catch {
    return null;
  }
};
async function save(http: HttpClient, values: SettingsInput): Promise<SaveResult> {
  try {
    const answer = await http.request({
      path,
      init: {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      },
    });
    return { preferences: readPreferences(answer), message: "Settings saved", fields: {} };
  } catch (error) {
    const isExpected = error instanceof ExpectedError;
    return {
      preferences: null,
      message: isExpected ? error.message : "Settings unavailable",
      fields: isExpected ? (error.fields ?? {}) : {},
    };
  }
}
export function createSettingsData(http: HttpClient): SettingsData {
  return { load: () => loadPreferences(http), save: (values) => save(http, values) };
}
