import { readFields } from "./fields.read.ts";
import { parseInteger } from "#shared/values/numbers/numbers.parse.ts";
import { isMissing } from "#shared/values/values.check.ts";

export type PageRequest = { limit: number; offset: number };
export type PageAnswer<Item> = { items: readonly Item[]; total: number };

function readLimit(value: unknown): number {
  const absent = isMissing(value);
  return absent ? 20 : parseInteger(value, { field: "limit", min: 1, max: 100 });
}

function readOffset(value: unknown): number {
  const absent = isMissing(value);
  return absent ? 0 : parseInteger(value, { field: "offset", min: 0, max: 10000 });
}

export function readPage(input: unknown): PageRequest {
  return readFields<PageRequest>(input, { limit: readLimit, offset: readOffset });
}
