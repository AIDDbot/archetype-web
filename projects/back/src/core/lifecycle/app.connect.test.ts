import { expect, test, vi } from "vite-plus/test";
import { connectFeatures } from "./app.connect.ts";
import type { FeatureServices } from "#shared/session/session.contract.ts";
import { readToken } from "#shared/session/session.parse.ts";
test("connects explicit feature registrations to platform services", () => {
  const connect = vi.fn<(services: FeatureServices) => void>();
  const services: FeatureServices = {
    database: {
      exec: () => {},
      close: () => {},
      prepare: () => ({
        get: () => undefined,
        all: () => [],
        run: () => ({ changes: 1, lastInsertRowid: 1 }),
      }),
    },
    passwords: { hash: (value) => value, verify: () => true },
    tokens: { create: () => readToken("token"), hash: (value) => value },
    clock: () => new Date(0),
    generate: () => "id",
    sessionTtlHours: 24,
  };
  connectFeatures(
    [
      { routes: [], migrations: [], connect },
      { routes: [], migrations: [] },
    ],
    services,
  );
  expect(connect).toHaveBeenCalledWith(services);
});
