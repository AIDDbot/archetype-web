import { expect, test, vi } from "vite-plus/test";
import { registerUsers } from "./users.routes.ts";
import type { AuthFacade } from "#api/auth";
import { createRouteFake } from "#shared/http/route.contract.ts";
import { keepSession } from "#shared/session/session.read.ts";
import { readUserId } from "#shared/session/session.parse.ts";
test("routes the requested identifier with the request session through the facade", () => {
  const value = { name: "Ab", email: "a@b.co", createdAt: "2026-01-01T00:00:00.000Z" };
  const account = vi.fn<AuthFacade["account"]>().mockReturnValue(value);
  const feature = registerUsers({ account });
  const fake = createRouteFake({ body: undefined, params: { id: "id" }, query: {}, headers: {} });
  const session = { userId: readUserId("id"), tokenHash: "digest" };
  keepSession(fake.request, session);
  feature.routes[0]?.handler(fake.request, fake.response);
  expect(account).toHaveBeenCalledWith({ session, id: "id" });
  expect(fake.result()).toEqual({ status: 200, body: value });
});
