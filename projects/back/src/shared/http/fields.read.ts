import { ExpectedError } from "#shared/expected.error.ts";
import { isRecord } from "#shared/values/values.check.ts";

export type FieldReaders<Value> = { readonly [Key in keyof Value]: (value: unknown) => Value[Key] };
type ReaderMap = Readonly<Record<string, (value: unknown) => unknown>>;
type FieldResult = { value?: unknown; error?: string };

function readField(value: unknown, read: (input: unknown) => unknown): FieldResult {
  try {
    return { value: read(value) };
  } catch (error) {
    const expected = error instanceof ExpectedError;
    if (expected) return { error: error.message };
    throw error;
  }
}

export function readFields<Value>(input: unknown, readers: FieldReaders<Value>): Value;
export function readFields(input: unknown, readers: ReaderMap): unknown {
  const source = isRecord(input) ? input : {};
  const values: Record<string, unknown> = {};
  const fields: Record<string, string> = {};
  for (const [key, read] of Object.entries(readers)) {
    const result = readField(source[key], read);
    const message = result.error;
    const failed = message !== undefined;
    if (failed) fields[key] = message;
    else values[key] = result.value;
  }
  const invalid = Object.keys(fields).length > 0;
  if (invalid) throw new ExpectedError({ kind: "rule", message: "Invalid fields", fields });
  return values;
}
