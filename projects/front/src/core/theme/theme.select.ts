import type { Preferences } from "#shared/session/preferences.contract.ts";
export type Theme = "light" | "dark";
export type ThemeEnvironment = { selected: string | null; dark: boolean };
export function initialTheme(environment: ThemeEnvironment): Theme {
  const selected = environment.selected;
  const valid = selected === "light" || selected === "dark";
  if (valid) return selected;
  return environment.dark ? "dark" : "light";
}
export function nextTheme(theme: Theme): Theme {
  const dark = theme === "dark";
  return dark ? "light" : "dark";
}
export type ThemeSources = { preferences: Preferences | null; browser: Theme; dark: boolean };
export function appliedTheme(sources: ThemeSources): Theme {
  const account = sources.preferences?.theme;
  const isBrowser = account === undefined;
  if (isBrowser) return sources.browser;
  const isSystem = account === "system";
  if (isSystem) return sources.dark ? "dark" : "light";
  return account;
}
