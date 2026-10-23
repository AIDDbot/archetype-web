import { expect, test } from "vite-plus/test";
import { appliedTheme, initialTheme, nextTheme } from "./theme.select.ts";
test("selects the stored theme before the system preference", () => {
  expect(initialTheme({ selected: "dark", dark: false })).toBe("dark");
  expect(initialTheme({ selected: "light", dark: true })).toBe("light");
  expect(initialTheme({ selected: null, dark: true })).toBe("dark");
  expect(initialTheme({ selected: "unknown", dark: false })).toBe("light");
  expect(nextTheme("light")).toBe("dark");
  expect(nextTheme("dark")).toBe("light");
});
test("applies the theme of the account, else the theme of the browser", () => {
  const browser = { browser: "light" as const, dark: true };
  expect(appliedTheme({ ...browser, preferences: null })).toBe("light");
  expect(appliedTheme({ ...browser, preferences: { theme: "dark", dateFormat: "locale" } })).toBe(
    "dark",
  );
  expect(appliedTheme({ ...browser, preferences: { theme: "light", dateFormat: "iso" } })).toBe(
    "light",
  );
  expect(appliedTheme({ ...browser, preferences: { theme: "system", dateFormat: "iso" } })).toBe(
    "dark",
  );
  expect(
    appliedTheme({
      browser: "dark",
      dark: false,
      preferences: { theme: "system", dateFormat: "iso" },
    }),
  ).toBe("light");
});
