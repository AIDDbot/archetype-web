import { readFields } from "#shared/http/fields.read.ts";
import { parseEmail } from "#shared/values/email/email.parse.ts";
import { requireLength } from "#shared/values/text/text.parse.ts";
import { ruleError } from "#shared/expected.error.ts";
import type { Credentials, Registration, Email, UserName, Password } from "./auth.type.ts";
const PASSWORD_LENGTH = { min: 8, max: 64 } as const;
function readEmail(value: unknown): Email {
  return requireLength(parseEmail(value, "email"), { field: "email", min: 1, max: 64 });
}
function readName(value: unknown): UserName {
  return requireLength(value, { field: "name", min: 2, max: 64 });
}
function readPassword(value: unknown): Password {
  const notString = typeof value !== "string";
  if (notString) throw ruleError("password", "needs text");
  const isShort = value.length < PASSWORD_LENGTH.min;
  const isLong = value.length > PASSWORD_LENGTH.max;
  const invalid = isShort || isLong;
  if (invalid)
    throw ruleError("password", `has ${PASSWORD_LENGTH.min} to ${PASSWORD_LENGTH.max} characters`);
  return value;
}
export function readCredentials(value: unknown): Credentials {
  return readFields<Credentials>(value, { email: readEmail, password: readPassword });
}
export function readRegistration(value: unknown): Registration {
  return readFields<Registration>(value, {
    name: readName,
    email: readEmail,
    password: readPassword,
  });
}
