import type { Store } from "#shared/state/store.create.ts";
import type { PreferenceService } from "#shared/session/preferences.contract.ts";
import { appliedTheme } from "./theme.select.ts";
import type { Theme } from "./theme.select.ts";
export type ThemeLink = {
  preferences: PreferenceService;
  theme: Store<Theme>;
  browser: () => Theme;
  dark: () => boolean;
};
export function applyAccountTheme(link: ThemeLink): void {
  link.theme.set(
    appliedTheme({
      preferences: link.preferences.state.read(),
      browser: link.browser(),
      dark: link.dark(),
    }),
  );
}
export function connectTheme(link: ThemeLink): void {
  link.preferences.state.subscribe(() => applyAccountTheme(link));
}
