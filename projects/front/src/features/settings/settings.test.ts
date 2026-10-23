import { expect, test } from "vite-plus/test";
import { ExpectedError } from "#shared/expected.error.ts";
import { createStore } from "#shared/state/store.create.ts";
import type { Preferences } from "#shared/session/preferences.contract.ts";
import { createSettingsData, loadPreferences, readPreferences } from "./settings.client.ts";
import { createSettingsStore } from "./settings.store.ts";
import { settingsForm, settingsInput } from "./settings.model.ts";
import type { SettingsData } from "./settings.type.ts";
const saved: Preferences = { theme: "dark", dateFormat: "iso" };
const answer = (value: unknown) => ({ request: async () => value });
const failure = (error: Error) => ({
  request: async () => {
    throw error;
  },
});
test("reads only the preferences of the API", () => {
  expect(readPreferences(saved)).toEqual(saved);
  expect(() => readPreferences(null)).toThrow("Invalid settings response");
  expect(() => readPreferences({ theme: "blue", dateFormat: "iso" })).toThrow("Invalid settings");
  expect(() => readPreferences({ theme: "dark", dateFormat: "short" })).toThrow("Invalid settings");
});
test("loads the preferences, or nothing when the API fails", async () => {
  expect(await loadPreferences(answer(saved))).toEqual(saved);
  expect(await loadPreferences(failure(new Error("down")))).toBeNull();
  expect(await createSettingsData(answer(saved)).load()).toEqual(saved);
});
test("saves the preferences, or gives the error of each field", async () => {
  const values = { theme: "dark", dateFormat: "iso" };
  expect(await createSettingsData(answer(saved)).save(values)).toEqual({
    preferences: saved,
    message: "Settings saved",
    fields: {},
  });
  const rejected = new ExpectedError({
    kind: "rule",
    message: "Invalid input",
    fields: { theme: "must be system, light or dark" },
  });
  expect(await createSettingsData(failure(rejected)).save(values)).toEqual({
    preferences: null,
    message: "Invalid input",
    fields: { theme: "must be system, light or dark" },
  });
  const unexpected = await createSettingsData(failure(new Error("down"))).save(values);
  expect(unexpected).toEqual({ preferences: null, message: "Settings unavailable", fields: {} });
  const plain = new ExpectedError({ kind: "unavailable", message: "Service unavailable" });
  expect((await createSettingsData(failure(plain)).save(values)).fields).toEqual({});
});
function links(data: SettingsData) {
  return { data, preferences: { state: createStore<Preferences | null>(null), locale: "en" } };
}
test("applies saved preferences and keeps the values of a rejected form", async () => {
  const values = { theme: "dark", dateFormat: "iso" };
  const accepted = links({
    load: async () => ({ theme: "system", dateFormat: "locale" }),
    save: async () => ({ preferences: saved, message: "Settings saved", fields: {} }),
  });
  const store = createSettingsStore(accepted);
  expect(store.state.read().busy).toBe(true);
  await store.load();
  expect(store.state.read().values).toEqual({ theme: "system", dateFormat: "locale" });
  await store.save(values);
  expect(store.state.read()).toMatchObject({ values, sending: false, message: "Settings saved" });
  expect(accepted.preferences.state.read()).toEqual(saved);
  const refused = links({
    load: async () => null,
    save: async () => ({ preferences: null, message: "Invalid input", fields: { theme: "bad" } }),
  });
  const kept = createSettingsStore(refused);
  await kept.load();
  expect(kept.state.read()).toMatchObject({ values: null, busy: false });
  await kept.save(values);
  expect(kept.state.read()).toMatchObject({ values, fields: { theme: "bad" } });
  expect(refused.preferences.state.read()).toBeNull();
});
test("shows the current values as choices and reads the sent form", () => {
  const state = { values: null, busy: false, sending: true, message: "", fields: { theme: "bad" } };
  const form = settingsForm({ theme: "light", dateFormat: "iso" }, state);
  expect(form.disabled).toBe(true);
  expect(form.fields.map((field) => [field.label, field.value, field.control])).toEqual([
    ["Theme", "light", "select"],
    ["Date format", "iso", "select"],
  ]);
  expect(form.fields[0]?.error).toBe("bad");
  const sent = new FormData();
  sent.set("theme", "dark");
  expect(settingsInput(sent)).toEqual({ theme: "dark", dateFormat: "" });
});
