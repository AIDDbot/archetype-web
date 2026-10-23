import { expect, test, vi } from "vite-plus/test";
import { createAuth } from "./auth.service.ts";
import type { AuthServices, Repository, StoredUser } from "./auth.type.ts";
import { readUserId, readToken } from "#shared/session/session.parse.ts";
const user: StoredUser = {
  id: readUserId("id"),
  email: "a@b.co",
  name: "Ab",
  role: "user",
  createdAt: "2026-01-01T00:00:00.000Z",
  passwordHash: "hash",
};
const session = { userId: user.id, tokenHash: "digest" };
function services(): AuthServices {
  const repository: Repository = {
    findEmail: vi.fn<Repository["findEmail"]>().mockReturnValue(user),
    findUser: vi.fn<Repository["findUser"]>().mockReturnValue(user),
    insertUser: vi.fn<Repository["insertUser"]>().mockReturnValue(true),
    saveSession: vi.fn<Repository["saveSession"]>(),
    findSession: vi.fn<Repository["findSession"]>().mockReturnValue(session),
    removeSession: vi.fn<Repository["removeSession"]>(),
  };
  return {
    repository,
    passwords: {
      hash: vi.fn<(value: string) => string>().mockReturnValue("hash"),
      verify: vi.fn<(value: string, hash: string) => boolean>().mockReturnValue(true),
    },
    tokens: { create: () => readToken("token"), hash: (value) => `hash:${value}` },
    clock: () => new Date(user.createdAt),
    generate: () => "id",
    sessionTtlHours: 24,
  };
}
test("registers public fixed-role users and preserves an existing account", () => {
  const input = services();
  const auth = createAuth(input);
  expect(auth.register({ name: user.name, email: user.email, password: "password" })).toEqual({
    id: user.id,
    name: user.name,
    email: user.email,
    role: "user",
    createdAt: user.createdAt,
  });
  expect(input.repository.insertUser).toHaveBeenCalledWith(user);
  vi.mocked(input.repository.insertUser).mockReturnValue(false);
  expect(() =>
    auth.register({ name: user.name, email: user.email, password: "otherpass" }),
  ).toThrow("Email already registered");
});
test("creates a hashed expiring session and never returns a password hash", () => {
  const input = services();
  const auth = createAuth(input);
  const answer = auth.login({ email: user.email, password: "password" });
  expect(answer.token).toBe("token");
  expect(answer.user).not.toHaveProperty("passwordHash");
  expect(input.repository.saveSession).toHaveBeenCalledWith({
    userId: user.id,
    tokenHash: "hash:token",
    createdAt: user.createdAt,
    expiresAt: "2026-01-02T00:00:00.000Z",
  });
  expect(auth.me(session)).toEqual(answer.user);
  expect(auth.account({ session, id: user.id })).toEqual({
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  });
  auth.logout(session);
  expect(input.repository.removeSession).toHaveBeenCalledWith("digest");
  expect(() => auth.account({ session, id: readUserId("other") })).toThrow("Not found");
  vi.mocked(input.repository.findUser).mockReturnValue(undefined);
  expect(() => auth.me(session)).toThrow("Unauthorized");
});
test("does a verification for wrong credentials and unknown email with the same error", () => {
  const input = services();
  const auth = createAuth(input);
  vi.mocked(input.passwords.verify).mockReturnValue(false);
  expect(() => auth.login({ email: user.email, password: "wrong" })).toThrow("Invalid credentials");
  vi.mocked(input.repository.findEmail).mockReturnValue(undefined);
  expect(() => auth.login({ email: "unknown@b.co", password: "wrong" })).toThrow(
    "Invalid credentials",
  );
  expect(input.passwords.verify).toHaveBeenCalledTimes(2);
  expect(input.repository.saveSession).not.toHaveBeenCalled();
});
test("resolves only opaque bearer tokens and passes the current expiry boundary to storage", () => {
  const input = services();
  const auth = createAuth(input);
  for (const value of [undefined, [], "", "Basic token", "Bearer ", "Bearer a b"])
    expect(auth.resolve(value)).toBeUndefined();
  expect(auth.resolve("Bearer token")).toEqual(session);
  expect(input.repository.findSession).toHaveBeenCalledWith("hash:token", user.createdAt);
  vi.mocked(input.repository.findSession).mockReturnValue(undefined);
  expect(auth.resolve("Bearer expired")).toBeUndefined();
});
