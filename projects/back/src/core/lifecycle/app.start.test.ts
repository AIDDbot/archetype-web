import { expect, test, vi } from "vite-plus/test";

import { openMemoryDatabase } from "#shared/database/database.open.ts";
const identity = {
  displayName: "Test app",
  description: "Test description",
  version: "1.0.0",
  author: { name: "Test author", url: "https://example.com" },
};
import { boot } from "./app.boot.ts";
import type { BootServices } from "./app.boot.ts";
import { createStop } from "./app.stop.ts";
import { listeningAddress } from "./app.address.ts";
import { readToken } from "#shared/session/session.parse.ts";
function services(): BootServices {
  return {
    passwords: { hash: (password) => password, verify: (password, hash) => password === hash },
    tokens: { create: () => readToken("token"), hash: (token) => token },
    input: { environment: {}, directory: "/project" },
    logger: {
      write: vi.fn<BootServices["logger"]["write"]>(),
      stop: vi.fn<BootServices["logger"]["stop"]>(),
    },
    database: openMemoryDatabase,
    listen: vi.fn<BootServices["listen"]>().mockResolvedValue(async () => {}),
    onStop: vi.fn<BootServices["onStop"]>(),
    fail: vi.fn<BootServices["fail"]>(),
    console: vi.fn<BootServices["console"]>(),
    clock: () => new Date(),
    milliseconds: () => 0,
    generate: () => "id",
  };
}
test("starts and registers shutdown before showing its address", async () => {
  const runtime = services();
  await boot({ identity, features: [{ routes: [], migrations: [] }] }, runtime);
  expect(runtime.console).toHaveBeenCalledWith("http://localhost:3000");
  expect(runtime.fail).not.toHaveBeenCalled();
  const stop = vi.mocked(runtime.onStop).mock.calls[0]?.[0];
  expect(stop).toBeTypeOf("function");
  await stop?.();
});
test("logs setting failures before listening and closes after listen failure", async () => {
  const runtime = services();
  await boot(
    { identity, features: [] },
    { ...runtime, input: { ...runtime.input, environment: { PORT: "0" } } },
  );
  expect(runtime.logger.write).toHaveBeenCalledWith("error", "PORT is an integer from 1 to 65535");
  expect(runtime.listen).not.toHaveBeenCalled();
  expect(runtime.console).not.toHaveBeenCalled();
  const database = openMemoryDatabase();
  await boot(
    { identity, features: [] },
    {
      ...runtime,
      database: () => database,
      listen: async () => {
        throw new Error("failure");
      },
    },
  );
  expect(runtime.logger.write).toHaveBeenCalledWith("error", "Startup failed");
  expect(() => database.prepare("SELECT 1")).toThrow("database is not open");
});
test("shutdown drains requests then logs then database, only once", async () => {
  const order: string[] = [];
  const { promise: pending, resolve: finish } = Promise.withResolvers<void>();
  const stop = createStop({
    closeServer: async () => {
      await pending;
      order.push("requests");
    },
    logger: {
      write: () => {},
      stop: async () => {
        order.push("logs");
      },
    },
    closeDatabase: () => {
      order.push("database");
    },
  });
  const first = stop();
  expect(stop()).toBe(first);
  expect(order).toEqual([]);
  finish();
  await first;
  expect(order).toEqual(["requests", "logs", "database"]);
});
test("shows configured hosts and IPv6 browser URLs", () => {
  expect(listeningAddress({ host: "127.0.0.1", port: 3000 })).toBe("http://127.0.0.1:3000");
  expect(listeningAddress({ host: "::1", port: 3000 })).toBe("http://[::1]:3000");
  expect(listeningAddress({ host: "::", port: 3000 })).toBe("http://localhost:3000");
});
