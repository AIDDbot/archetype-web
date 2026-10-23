import { isRecord } from "#shared/values/values.check.ts";
import { requireText } from "#shared/values/text/text.parse.ts";
import { ExpectedError } from "#shared/expected.error.ts";
import type { Session, SessionIdentity } from "#shared/session/session.contract.ts";
function record(value: unknown): Record<string, unknown> {
  if (!isRecord(value))
    throw new ExpectedError({ kind: "unavailable", message: "Invalid session response" });
  return value;
}
export function readUser(value: unknown): SessionIdentity {
  const user = record(value);
  const role = requireText(user.role, "role");
  const invalid = role !== "user";
  if (invalid) throw new ExpectedError({ kind: "unavailable", message: "Invalid role" });
  return {
    id: requireText(user.id, "id"),
    name: requireText(user.name, "name"),
    email: requireText(user.email, "email"),
    createdAt: requireText(user.createdAt, "createdAt"),
    role,
  };
}
export function readSession(value: unknown): Session {
  const answer = record(value);
  return { token: requireText(answer.token, "token"), user: readUser(answer.user) };
}
