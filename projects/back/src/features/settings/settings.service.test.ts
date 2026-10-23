import { expect, test, vi } from "vite-plus/test";
import type { AuthFacade } from "#api/auth";
import { createSettings } from "./settings.service.ts";
import { readUserId } from "#shared/session/session.parse.ts";
import type { Repository, Preferences } from "./settings.type.ts";
test("uses defaults without writing, keeps owned values and checks the account facade", () => {
  const session = { userId: readUserId("one"), tokenHash: "hash" };
  const preferences: Preferences = { theme: "dark", dateFormat: "iso" };
  const find = vi
    .fn<Repository["find"]>()
    .mockReturnValueOnce(undefined)
    .mockReturnValue(preferences);
  const save = vi.fn<Repository["save"]>();
  const account = vi
    .fn<AuthFacade["account"]>()
    .mockReturnValue({ name: "One", email: "a@b.co", createdAt: "now" });
  const logic = createSettings({
    repository: { find, save },
    auth: { account },
    clock: () => new Date("2026-10-23T00:00:00Z"),
  });
  expect(logic.read(session)).toEqual({ theme: "system", dateFormat: "locale" });
  expect(save).not.toHaveBeenCalled();
  expect(logic.save({ session, preferences })).toEqual(preferences);
  expect(save).toHaveBeenCalledWith({
    ...preferences,
    userId: "one",
    updatedAt: "2026-10-23T00:00:00.000Z",
  });
  expect(logic.read(session)).toEqual(preferences);
  expect(find).toHaveBeenCalledWith("one");
  expect(account).toHaveBeenCalledWith({ session, id: "one" });
});
