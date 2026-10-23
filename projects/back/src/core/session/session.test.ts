import { expect, test, vi } from "vite-plus/test";
import { createPasswords } from "./passwords.create.ts";
import { sessionMiddleware } from "./session.middleware.ts";
import { readSession } from "#shared/session/session.read.ts";
import { readUserId } from "#shared/session/session.parse.ts";
import type { Derivation } from "./passwords.create.ts";
test("stores scrypt costs with the salt and verifies with stored costs", () => {
  const derive = vi.fn<(input: Derivation) => string>().mockReturnValue("digest");
  const equal = vi.fn<(left: string, right: string) => boolean>().mockReturnValue(true);
  const passwords = createPasswords({ salt: () => "salt", derive, equal });
  expect(passwords.hash("secret")).toBe("$scrypt$16384$8$5$salt$digest");
  expect(passwords.verify("secret", "$scrypt$16384$8$5$salt$digest")).toBe(true);
  expect(derive).toHaveBeenLastCalledWith({
    password: "secret",
    salt: "salt",
    cost: { N: 16384, r: 8, p: 5, salt: "salt", hash: "digest" },
  });
  equal.mockReturnValue(false);
  expect(passwords.verify("wrong", "$scrypt$16384$8$5$salt$digest")).toBe(false);
  expect(() => passwords.verify("wrong", "")).toThrow("password salt");
});
test("rejects an unresolved identity and keeps a resolved session on the request", () => {
  const request = { headers: {} };
  const next = vi.fn<() => void>();
  expect(() => sessionMiddleware(() => undefined)(request, {}, next)).toThrow("Unauthorized");
  const identity = { userId: readUserId("id"), tokenHash: "hash" };
  sessionMiddleware(() => identity)(request, {}, next);
  expect(readSession(request)).toBe(identity);
  expect(next).toHaveBeenCalledOnce();
  expect(request).toEqual({ headers: {} });
});
