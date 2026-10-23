import { expect, test } from "vite-plus/test";
import { keepSession, readSession } from "./session.read.ts";
import { readUserId, readToken } from "./session.parse.ts";
test("keeps identity by request without changing the request", () => {
  const request = {};
  const identity = { userId: readUserId("id"), tokenHash: "hash" };
  expect(() => readSession(request)).toThrow("Unauthorized");
  keepSession(request, identity);
  expect(readSession(request)).toBe(identity);
  expect(request).toEqual({});
});
test("reads identifiers and opaque tokens at the edge", () => {
  expect(readToken("token")).toBe("token");
  expect(() => readToken(null)).toThrow("token");
  expect(() => readUserId(null)).toThrow("id");
});
