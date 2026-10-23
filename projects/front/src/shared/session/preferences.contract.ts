import type { Store } from "#shared/state/store.create.ts";
import type { HttpClient } from "#shared/http/http.contract.ts";
export type ThemePreference = "system" | "light" | "dark";
export type DateFormat = "locale" | "iso";
export type Preferences = { theme: ThemePreference; dateFormat: DateFormat };
export type PreferenceService = { state: Store<Preferences | null>; locale: string };
export type PreferenceSource = (http: HttpClient) => Promise<Preferences | null>;
