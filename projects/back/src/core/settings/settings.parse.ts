import { parseInteger } from "#shared/values/numbers/numbers.parse.ts";
import { requireLength } from "#shared/values/text/text.parse.ts";
import { isOneOf } from "#shared/values/values.check.ts";
import { ruleError } from "#shared/expected.error.ts";
export type LogLevel = "debug" | "info" | "warn" | "error";
export function parsePort(value: unknown, field: string): number {
  return parseInteger(value, { field, min: 1, max: 65535 });
}
export function parseBodyLimit(value: unknown, field: string): number {
  return parseInteger(value, { field, min: 1, max: 10240 });
}
export function parseSessionTtl(value: unknown, field: string): number {
  return parseInteger(value, { field, min: 1, max: 720 });
}
export function parseLevel(value: unknown, field: string): LogLevel {
  const valid = isOneOf(value, ["debug", "info", "warn", "error"] as const);
  if (!valid) throw ruleError(field, "needs debug, info, warn or error");
  return value;
}
export function parseOrigin(value: unknown, field: string): string {
  const text = parsePath(value, field);
  const wildcard = text === "*";
  if (wildcard) return text;
  for (const item of text.split(",")) checkOrigin(item.trim(), field);
  return text;
}
function checkOrigin(value: string, field: string): void {
  const url = URL.parse(value);
  const supported = url?.protocol === "http:" || url?.protocol === "https:";
  const isOrigin = url?.origin === value;
  const valid = supported && isOrigin;
  if (!valid) throw ruleError(field, "needs a comma list of HTTP origins or *");
}

export function parsePath(value: unknown, field: string): string {
  return requireLength(value, { field, min: 1, max: 4096 });
}
export function parseHost(value: unknown, field: string): string {
  return requireLength(value, { field, min: 1, max: 253 });
}
