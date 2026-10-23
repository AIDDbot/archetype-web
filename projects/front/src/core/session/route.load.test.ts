import { expect, test, vi } from "vite-plus/test";
import type { PageRegistration, PageServices } from "#shared/components/page.contract.ts";
import { createStore } from "#shared/state/store.create.ts";
import type { Session } from "#shared/session/session.contract.ts";
import type { Preferences } from "#shared/session/preferences.contract.ts";
import { createRouteLoader } from "./route.load.ts";
const testUser = {
  id: "route-user",
  name: "Route Test",
  email: "route@test.example",
  role: "user" as const,
  createdAt: "2026-10-01T00:00:00.000Z",
};
test("loads allowed pages and keeps protected data out of anonymous navigation", () => {
  const load = vi.fn<NonNullable<PageRegistration["load"]>>();
  const session = {
    state: createStore<Session | null>(null),
    set: (): void => {},
    restore: async (): Promise<void> => {},
  };
  const services: Omit<PageServices, "navigate" | "completeLogin"> = {
    session,
    preferences: { state: createStore<Preferences | null>(null), locale: "en" },
    http: { request: async () => null },
    logger: { page: (): void => {}, theme: (): void => {}, operation: (): void => {} },
  };
  const registration: PageRegistration = {
    path: "/users/:id",
    access: "session",
    load,
    page: () => {
      throw new Error("Not rendered");
    },
  };
  const args = {
    params: { id: "one" },
    request: new Request("http://localhost/users/one"),
    context: {},
  };
  expect(createRouteLoader({ registration, services })(args)).toBeNull();
  expect(load).not.toHaveBeenCalled();
  session.state.set({ token: "secret", user: testUser });
  expect(createRouteLoader({ registration, services })(args)).toBeNull();
  expect(load).toHaveBeenCalledWith(services, { id: "one" });
  expect(
    createRouteLoader({
      registration: {
        path: registration.path,
        access: registration.access,
        page: registration.page,
      },
      services,
    })(args),
  ).toBeNull();
});
