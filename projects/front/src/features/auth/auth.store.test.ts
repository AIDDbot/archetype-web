import { testUser as user } from "./auth.fixture.ts";
import { expect, test, vi } from "vite-plus/test";
import { createAuthSession, createAuthOperations } from "./auth.store.ts";
import type { HttpClient } from "#shared/http/http.contract.ts";
test("restores a stored token and publishes session changes", async () => {
  const storage = {
    read: () => "secret",
    write: vi.fn<(token: string) => void>(),
    clear: vi.fn<() => void>(),
  };
  const session = createAuthSession(storage);
  const listener = vi.fn<() => void>();
  session.state.subscribe(listener);
  const http: HttpClient = { request: async () => user };
  await session.restore(http);
  expect(session.state.read()).toEqual({ token: "secret", user });
  expect(storage.write).toHaveBeenCalledWith("secret");
  session.set(null);
  expect(storage.clear).toHaveBeenCalledOnce();
  expect(listener).toHaveBeenCalledTimes(2);
});
test("does not restore an absent token and clears a rejected token", async () => {
  const request = vi.fn<HttpClient["request"]>(async () => {
    throw new Error("offline");
  });
  const storage = {
    read: () => null,
    write: vi.fn<(token: string) => void>(),
    clear: vi.fn<() => void>(),
  };
  await createAuthSession(storage).restore({ request });
  expect(request).not.toHaveBeenCalled();
  const session = createAuthSession({ ...storage, read: () => "expired" });
  await session.restore({ request });
  expect(session.state.read()).toBeNull();
  expect(storage.clear).toHaveBeenCalledOnce();
});

test("passes form operations to the data service", async () => {
  const result = { session: null, message: "Registered", fields: {} };
  const submit = vi.fn<import("./auth.type.ts").AuthData["submit"]>(async () => result);
  const operations = createAuthOperations({ submit });
  const values = { name: "Person", email: "a@b.test", password: "password" };
  expect(await operations.submit("register", values)).toBe(result);
  expect(submit).toHaveBeenCalledWith("register", values);
});
