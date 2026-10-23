import { expect, test } from "vite-plus/test";
import { createStore } from "#shared/state/store.create.ts";
import { dateTimeStyle } from "#shared/values/readable/readable.format.ts";
import type { Preferences } from "./preferences.contract.ts";
import { valueFormat } from "./preferences.select.ts";
const service = { state: createStore<Preferences | null>(null), locale: "en-GB" };
test("reads the date format of the account, or the language of the browser", () => {
  expect(valueFormat(service, null)).toEqual({ locale: "en-GB", style: dateTimeStyle, iso: false });
  expect(valueFormat(service, { theme: "dark", dateFormat: "locale" }).iso).toBe(false);
  expect(valueFormat(service, { theme: "dark", dateFormat: "iso" }).iso).toBe(true);
});
