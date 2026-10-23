import { expect, test } from "vite-plus/test";
import { allows, returnTarget } from "./access.select.ts";
test("selects access for each session state", () => {
  for (const authenticated of [true, false]) {
    expect(allows("everyone", authenticated)).toBe(true);
    expect(allows("anonymous", authenticated)).toBe(!authenticated);
    expect(allows("session", authenticated)).toBe(authenticated);
  }
});
test("returns only a registered local page with its query and fragment", () => {
  const options = { origin: "http://localhost", paths: ["/users/:id"] };
  for (const value of [null, "https://example.com/", "//example.com", "/missing", "http://["]) {
    expect(returnTarget({ ...options, value })).toBe("/");
  }
  expect(returnTarget({ ...options, value: "/users/one?a=1#b" })).toBe("/users/one?a=1#b");
});
