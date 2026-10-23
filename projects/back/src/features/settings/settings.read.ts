import { ruleError } from "#shared/expected.error.ts";
import { readFields } from "#shared/http/fields.read.ts";
import { isOneOf } from "#shared/values/values.check.ts";
import type { Preferences, Theme, DateFormat } from "./settings.type.ts";
export function readTheme(value: unknown): Theme {
  const valid = isOneOf(value, ["system", "light", "dark"] as const);
  if (!valid) throw ruleError("theme", "must be system, light or dark");
  return value;
}
export function readDateFormat(value: unknown): DateFormat {
  const valid = isOneOf(value, ["locale", "iso"] as const);
  if (!valid) throw ruleError("dateFormat", "must be locale or iso");
  return value;
}
export function readPreferences(input: unknown): Preferences {
  return readFields<Preferences>(input, { theme: readTheme, dateFormat: readDateFormat });
}
