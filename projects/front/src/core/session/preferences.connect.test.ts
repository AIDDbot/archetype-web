import { expect, test } from "vite-plus/test";
import { createStore } from "#shared/state/store.create.ts";
import type { Session } from "#shared/session/session.contract.ts";
import type { Preferences } from "#shared/session/preferences.contract.ts";
import { connectPreferences, syncPreferences } from "./preferences.connect.ts";
const user = {
  id: "preference-user",
  name: "Preference Test",
  email: "preference@test.example",
  role: "user" as const,
  createdAt: "2026-10-01T00:00:00.000Z",
};
const dark: Preferences = { theme: "dark", dateFormat: "iso" };
function link(source: () => Promise<Preferences | null>) {
  const state = createStore<Session | null>(null);
  return {
    session: { state, set: state.set, restore: async (): Promise<void> => {} },
    preferences: { state: createStore<Preferences | null>(dark), locale: "en" },
    source,
    http: { request: async () => null },
  };
}
test("loads the preferences of a session and clears them with no session", async () => {
  const connection = link(async () => dark);
  await syncPreferences(connection);
  expect(connection.preferences.state.read()).toBeNull();
  connection.session.set({ token: "token", user });
  await syncPreferences(connection);
  expect(connection.preferences.state.read()).toEqual(dark);
});
test("follows each change of the session and drops an answer that comes after a logout", async () => {
  const gate = Promise.withResolvers<Preferences | null>();
  const connection = link(() => gate.promise);
  connection.preferences.state.set(null);
  connectPreferences(connection);
  connection.session.set({ token: "token", user });
  connection.session.set(null);
  gate.resolve(dark);
  await gate.promise;
  await Promise.resolve();
  expect(connection.preferences.state.read()).toBeNull();
});
