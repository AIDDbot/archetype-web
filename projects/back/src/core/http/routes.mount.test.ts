import express from "express";
import { expect, test } from "vite-plus/test";
import { mountRoutes, sessionResolver } from "./routes.mount.ts";
import type { Feature } from "#shared/http/feature.contract.ts";
import { readUserId } from "#shared/session/session.parse.ts";
test("mounts public registrations first and adds a guard to protected ones", () => {
  const app = express();
  const feature: Feature = {
    migrations: [],
    routes: [
      { method: "get", path: "/private", handler: () => undefined },
      { method: "get", path: "/public", public: true, handler: () => undefined },
    ],
  };
  mountRoutes(app, [feature]);
  expect(app.router.stack[0]?.route?.path).toBe("/api/public");

  expect(app.router.stack[1]?.route?.path).toBe("/api/private");
  expect(app.router.stack.map((entry) => entry.route?.stack.length)).toEqual([1, 2]);
});
test("resolves identities from feature registrations and refuses no resolver", () => {
  const identity = { userId: readUserId("id"), tokenHash: "hash" };
  const feature: Feature = { routes: [], migrations: [], resolveSession: () => identity };
  expect(sessionResolver([feature])("token")).toBe(identity);
  expect(sessionResolver([{ routes: [], migrations: [] }])(undefined)).toBeUndefined();
  expect(
    sessionResolver([{ ...feature, resolveSession: () => undefined }])(undefined),
  ).toBeUndefined();
});
