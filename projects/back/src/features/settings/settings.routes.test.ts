import type { Statement, Database } from "#shared/database/database.contract.ts";
import { expect, test, vi } from "vite-plus/test";
import { registerSettings } from "./settings.routes.ts";
import { createRouteFake } from "#shared/http/route.contract.ts";
import { keepSession } from "#shared/session/session.read.ts";
import { readUserId, readToken } from "#shared/session/session.parse.ts";
import type { FeatureServices } from "#shared/session/session.contract.ts";
test("connects settings routes and migration with injected storage", () => {
  const preferences = { theme: "dark", dateFormat: "iso" };
  const get = vi.fn<Statement["get"]>().mockReturnValueOnce(undefined).mockReturnValue(preferences);
  const run = vi.fn<Statement["run"]>().mockReturnValue({ changes: 1, lastInsertRowid: 1 });
  const exec = vi.fn<Database["exec"]>();
  const services: FeatureServices = {
    database: { exec, close: () => {}, prepare: () => ({ get, all: () => [], run }) },
    passwords: { hash: () => "hash", verify: () => true },
    tokens: { create: () => readToken("token"), hash: () => "digest" },
    clock: () => new Date("2026-10-23T00:00:00Z"),
    generate: () => "id",
    sessionTtlHours: 24,
  };
  const feature = registerSettings({
    account: () => ({ name: "Ab", email: "a@b.co", createdAt: "now" }),
  });
  feature.connect?.(services);
  feature.migrations[0]?.apply(services.database);
  expect(exec).toHaveBeenCalledWith(expect.stringContaining("CREATE TABLE settings"));
  for (const route of feature.routes) {
    const fake = createRouteFake({ body: preferences, params: {}, query: {}, headers: {} });
    keepSession(fake.request, { userId: readUserId("id"), tokenHash: "digest" });
    route.handler(fake.request, fake.response);
    expect(fake.result().status).toBe(200);
  }
  const fake = createRouteFake({ body: undefined, params: {}, query: {}, headers: {} });
  keepSession(fake.request, { userId: readUserId("id"), tokenHash: "digest" });
  feature.routes[0]?.handler(fake.request, fake.response);
  expect(fake.result().body).toEqual(preferences);
  expect(run).toHaveBeenCalledWith("id", "dark", "iso", "2026-10-23T00:00:00.000Z");
});
