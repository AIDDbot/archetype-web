import { isText } from "#shared/values/values.check.ts";
export type TextLength = { field: string; min: number; max: number };
export function requireLength(value: unknown, length: TextLength): string {
  const text = isText(value);
  if (!text) throw new Error(`${length.field} needs text`);
  const trimmed = value.trim();
  const short = trimmed.length < length.min;
  const long = trimmed.length > length.max;
  const invalid = short || long;
  if (invalid) throw new Error(`${length.field} has ${length.min} to ${length.max} characters`);
  return trimmed;
}
