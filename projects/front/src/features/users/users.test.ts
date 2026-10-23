import { expect, test } from "vite-plus/test";
import { createAccountData, readAccount } from "./users.client.ts";
import { createAccountStore } from "./users.store.ts";
import { accountDetail } from "./users.model.ts";
import { dateTimeStyle } from "#shared/values/readable/readable.format.ts";
const format = { locale: "en", style: dateTimeStyle };
const raw = { name: "Person", email: "a@b.test", createdAt: "2026-10-01T00:00:00.000Z" };
test("loads and prepares the public account", async () => {
  const data = createAccountData({ request: async () => raw });
  const store = createAccountStore(data);
  expect(store.state.read().busy).toBe(true);
  await store.load("one");
  const account = readAccount(raw);
  expect(store.state.read()).toEqual({ account, busy: false });
  const detail = accountDetail(account, format);
  expect(accountDetail(account, { ...format, iso: true }).sections[0]?.facts[1]?.value).toMatch(
    /^2026-10-0[1-2] \d{2}:\d{2}$/,
  );
  expect(detail.title).toBe("Person");
  expect(detail.sections[0]?.facts[0]?.value).toBe("a@b.test");
  expect(detail.sections[0]?.facts[1]?.value).toContain("2026");
});
test("rejects invalid data and records an unavailable account", async () => {
  expect(() => readAccount(null)).toThrow("Invalid account response");
  const data = createAccountData({
    request: async () => {
      throw new Error("Not found");
    },
  });
  const store = createAccountStore(data);
  await store.load("other");
  expect(store.state.read()).toEqual({ account: null, busy: false });
});
