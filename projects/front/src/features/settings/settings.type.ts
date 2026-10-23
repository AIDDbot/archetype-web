import type { Store } from "#shared/state/store.create.ts";
import type { PreferenceService, Preferences } from "#shared/session/preferences.contract.ts";
export const themes = ["system", "light", "dark"] as const;
export const dateFormats = ["locale", "iso"] as const;
export type SettingsInput = { theme: string; dateFormat: string };
export type SaveResult = {
  preferences: Preferences | null;
  message: string;
  fields: Readonly<Record<string, string>>;
};
export type SettingsData = {
  load: () => Promise<Preferences | null>;
  save: (values: SettingsInput) => Promise<SaveResult>;
};
export type SettingsState = {
  values: SettingsInput | null;
  busy: boolean;
  sending: boolean;
  message: string;
  fields: Readonly<Record<string, string>>;
};
export type SettingsStore = {
  state: Store<SettingsState>;
  load: () => Promise<void>;
  save: (values: SettingsInput) => Promise<void>;
};
export type SettingsLinks = { data: SettingsData; preferences: PreferenceService };
