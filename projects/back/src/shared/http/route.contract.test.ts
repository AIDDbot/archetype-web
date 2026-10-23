import { expect, test } from "vite-plus/test";
import { createRouteFake } from "./route.contract.ts";
test("captures public route outputs", () => {
  const request = { body: undefined, params: {}, query: {}, headers: {} };
  const fake = createRouteFake(request);
  expect(fake.request).toBe(request);
  expect(fake.result()).toEqual({ status: 200, body: undefined });
  expect(fake.response.status(400)).toBe(fake.response);
  fake.response.json({ error: "Input error" });
  expect(fake.result()).toEqual({ status: 400, body: { error: "Input error" } });
});
