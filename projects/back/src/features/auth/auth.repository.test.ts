import { expect, test, vi } from "vite-plus/test";
import { createRepository } from "./auth.repository.ts";
import { migration } from "./auth.migration.ts";
import type { Database, Statement } from "#shared/database/database.contract.ts";
import { readUserId } from "#shared/session/session.parse.ts";
test("maps database records and uses bound parameters for users and sessions", () => {
  const user = {
    id: readUserId("id"),
    email: "a@b.co",
    name: "Ab",
    role: "user" as const,
    createdAt: "2026-01-01T00:00:00.000Z",
    passwordHash: "hash",
  };
  const get = vi.fn<Statement["get"]>().mockReturnValue(user);
  const run = vi.fn<Statement["run"]>().mockReturnValue({ changes: 1, lastInsertRowid: 1 });
  const prepare = vi.fn<Database["prepare"]>().mockReturnValue({ get, run, all: () => [] });
  const exec = vi.fn<Database["exec"]>();
  const database: Database = { prepare, exec, close: () => {} };
  const repository = createRepository(database);
  expect(repository.findEmail(user.email)).toEqual(user);
  expect(get).toHaveBeenCalledWith(user.email);
  expect(repository.findUser(user.id)).toEqual(user);
  expect(get).toHaveBeenCalledWith(user.id);
  expect(repository.insertUser(user)).toBe(true);
  expect(run).toHaveBeenCalledWith(user.id, user.email, user.name, "user", "hash", user.createdAt);
  run.mockReturnValue({ changes: 0, lastInsertRowid: 1 });
  expect(repository.insertUser(user)).toBe(false);
  repository.saveSession({
    userId: user.id,
    tokenHash: "digest",
    createdAt: user.createdAt,
    expiresAt: "later",
  });
  expect(run).toHaveBeenCalledWith("digest", user.id, user.createdAt, "later");
  get.mockReturnValue({ userId: user.id, tokenHash: "digest" });
  expect(repository.findSession("digest", "now")).toEqual({ userId: user.id, tokenHash: "digest" });
  expect(prepare).toHaveBeenCalledWith(
    "SELECT userId,tokenHash FROM sessions WHERE tokenHash = ? AND expiresAt > ?",
  );
  expect(get).toHaveBeenCalledWith("digest", "now");
  repository.removeSession("digest");
  expect(run).toHaveBeenCalledWith("digest");
  get.mockReturnValue(undefined);
  expect(repository.findEmail("missing")).toBeUndefined();
  expect(repository.findSession("missing", "now")).toBeUndefined();
  migration.apply(database);
  expect(exec).toHaveBeenCalledWith(expect.stringContaining("CREATE TABLE sessions"));
});
