import { expect, test } from "vite-plus/test";
import { readPage } from "./page.read.ts";

test("reads pagination defaults and inclusive bounds", () => {
  expect(readPage(undefined)).toEqual({ limit: 20, offset: 0 });
  expect(readPage({ limit: "1", offset: "0" })).toEqual({ limit: 1, offset: 0 });
  expect(readPage({ limit: 100, offset: 10000 })).toEqual({ limit: 100, offset: 10000 });
});

test.each([
  { limit: 0 },
  { limit: 101 },
  { limit: 1.5 },
  { limit: "bad" },
  { offset: -1 },
  { offset: 10001 },
  { offset: 0.5 },
  { offset: "bad" },
])("rejects invalid pagination %j", (input) => {
  expect(() => readPage(input)).toThrow("Invalid fields");
});
