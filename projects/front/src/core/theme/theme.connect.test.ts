import { expect, test } from "vite-plus/test";
import { createStore } from "#shared/state/store.create.ts";
import type { Preferences } from "#shared/session/preferences.contract.ts";
import { connectTheme } from "./theme.connect.ts";
import type { Theme } from "./theme.select.ts";
test("shows the theme of the account while it exists, then the theme of the browser", () => {
  const preferences = { state: createStore<Preferences | null>(null), locale: "en" };
  const theme = createStore<Theme>("light");
  connectTheme({ preferences, theme, browser: () => "light", dark: () => false });
  preferences.state.set({ theme: "dark", dateFormat: "locale" });
  expect(theme.read()).toBe("dark");
  preferences.state.set(null);
  expect(theme.read()).toBe("light");
});
