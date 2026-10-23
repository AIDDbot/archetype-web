import { testUser as user } from "./auth.fixture.ts";
import { expect, test } from "vite-plus/test";
import { readSession, readUser } from "./auth.read.ts";
test("reads the public identity and token", () => {
  expect(readUser(user)).toEqual(user);
  expect(readSession({ token: "secret", user })).toEqual({ token: "secret", user });
});
test("rejects a malformed session or identity", () => {
  for (const value of [null, [], { ...user, role: "admin" }, { ...user, name: null }])
    expect(() => readUser(value)).toThrow(/Invalid|needs text/);
  expect(() => readSession(null)).toThrow(/Invalid|needs text/);
  expect(() => readSession({ token: null, user })).toThrow(/Invalid|needs text/);
});
