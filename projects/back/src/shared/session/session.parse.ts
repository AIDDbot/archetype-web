import { ruleError } from "#shared/expected.error.ts";
import type { UserId, SessionToken } from "./session.contract.ts";
function isUserId(value: unknown): value is UserId {
  return typeof value === "string";
}
function isToken(value: unknown): value is SessionToken {
  return typeof value === "string";
}
export function readUserId(value: unknown): UserId {
  if (!isUserId(value)) throw ruleError("id", "needs text");
  return value;
}
export function readToken(value: unknown): SessionToken {
  if (!isToken(value)) throw ruleError("token", "needs text");
  return value;
}
