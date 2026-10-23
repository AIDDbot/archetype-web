import type { Database, SqlRow } from "#shared/database/database.contract.ts";
import { readUserId } from "#shared/session/session.parse.ts";
import { requireText } from "#shared/values/text/text.parse.ts";
import type { Repository, StoredUser } from "./auth.type.ts";
function readUser(row: SqlRow | undefined): StoredUser | undefined {
  const absent = row === undefined;
  if (absent) return undefined;
  return {
    id: readUserId(row.id),
    email: requireText(row.email, "email"),
    name: requireText(row.name, "name"),
    role: "user",
    passwordHash: requireText(row.passwordHash, "passwordHash"),
    createdAt: requireText(row.createdAt, "createdAt"),
  };
}
export function createRepository(database: Database): Repository {
  return {
    findEmail: (email) =>
      readUser(database.prepare("SELECT * FROM users WHERE email = ?").get(email)),
    findUser: (id) => readUser(database.prepare("SELECT * FROM users WHERE id = ?").get(id)),
    insertUser: (user) => {
      const result = database
        .prepare(
          "INSERT OR IGNORE INTO users (id,email,name,role,passwordHash,createdAt) VALUES (?,?,?,?,?,?)",
        )
        .run(user.id, user.email, user.name, user.role, user.passwordHash, user.createdAt);
      return Number(result.changes) === 1;
    },
    saveSession: (session) => {
      database
        .prepare("INSERT INTO sessions (tokenHash,userId,createdAt,expiresAt) VALUES (?,?,?,?)")
        .run(session.tokenHash, session.userId, session.createdAt, session.expiresAt);
    },
    findSession: (hash, now) => {
      const row = database
        .prepare("SELECT userId,tokenHash FROM sessions WHERE tokenHash = ? AND expiresAt > ?")
        .get(hash, now);
      const absent = row === undefined;
      if (absent) return undefined;
      return { userId: readUserId(row.userId), tokenHash: requireText(row.tokenHash, "tokenHash") };
    },
    removeSession: (hash) => {
      database.prepare("DELETE FROM sessions WHERE tokenHash = ?").run(hash);
    },
  };
}
