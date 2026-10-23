import { expect } from "@playwright/test";
import { isRecord } from "#shared/values/values.check.ts";
export type ErrorBody = { error: string; fields?: Readonly<Record<string, string>> };
export function checkErrorBody(body: unknown): ErrorBody {
  const record = isRecord(body);
  expect(record).toBe(true);
  if (!record) throw new Error("Error body needs an object");
  const message = body.error;
  const text = typeof message === "string";
  expect(text).toBe(true);
  if (!text) throw new Error("Error body needs a message");
  return { error: message, ...checkFields(body.fields) };
}
function checkFields(value: unknown): { fields?: Readonly<Record<string, string>> } {
  const absent = value === undefined;
  if (absent) return {};
  const record = isRecord(value);
  expect(record).toBe(true);
  if (!record) throw new Error("Error fields need an object");
  const fields: Record<string, string> = {};
  for (const [name, message] of Object.entries(value)) {
    const text = typeof message === "string";
    expect(text).toBe(true);
    if (!text) throw new Error("Error field needs a message");
    fields[name] = message;
  }
  return { fields };
}
