import { expect, test, vi } from "vite-plus/test";
import { registerAuth } from "./auth.routes.ts";
import { createRouteFake } from "#shared/http/route.contract.ts";
import type { FeatureServices } from "#shared/session/session.contract.ts";
import { readToken, readUserId } from "#shared/session/session.parse.ts";
import { keepSession } from "#shared/session/session.read.ts";
test("registers auth handlers, resolver and account facade with injected services", () => {
  const user = {
    id: "id",
    userId: "id",
    tokenHash: "digest",
    name: "Ab",
    email: "a@b.co",
    passwordHash: "hash",
    createdAt: "2026-01-01T00:00:00.000Z",
    role: "user",
  };
  const run = vi
    .fn<() => { changes: number; lastInsertRowid: number }>()
    .mockReturnValue({ changes: 1, lastInsertRowid: 1 });
  const services: FeatureServices = {
    database: {
      exec: () => {},
      close: () => {},
      prepare: () => ({ get: () => user, all: () => [], run }),
    },
    passwords: { hash: () => "hash", verify: () => true },
    tokens: { create: () => readToken("token"), hash: () => "digest" },
    clock: () => new Date(user.createdAt),
    generate: () => "id",
    sessionTtlHours: 24,
  };
  const registration = registerAuth();
  registration.feature.connect?.(services);
  const identity = { userId: readUserId("id"), tokenHash: "digest" };
  expect(registration.feature.resolveSession?.("Bearer token")).toEqual(identity);
  expect(registration.facade.account({ session: identity, id: readUserId("id") })).toEqual({
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  });
  for (const route of registration.feature.routes) {
    const fake = createRouteFake({
      body: { name: "Ab", email: "a@b.co", password: "password" },
      params: {},
      query: {},
      headers: {},
    });
    keepSession(fake.request, identity);
    route.handler(fake.request, fake.response);
    const statuses: Record<string, number> = {
      "/auth/register": 201,
      "/auth/login": 200,
      "/auth/me": 200,
      "/auth/logout": 204,
    };
    expect(fake.result().status).toBe(statuses[route.path]);
  }
  expect(run).toHaveBeenCalledWith("digest");
});
