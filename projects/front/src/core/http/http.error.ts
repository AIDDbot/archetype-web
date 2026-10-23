import { ExpectedError } from "#shared/expected.error.ts";
import type { ErrorKind, ErrorFields } from "#shared/expected.error.ts";
import { isRecord } from "#shared/values/values.check.ts";
const FIRST_SERVER_ERROR = 500;
export function responseError(body: unknown, status: number): ExpectedError {
  const record = isRecord(body);
  if (!record) return invalidError();
  const invalid = typeof body.error !== "string";
  if (invalid) return invalidError();
  const serverError = status >= FIRST_SERVER_ERROR;
  const kind = serverError ? "unavailable" : "rule";
  return expected({ kind, message: String(body.error), fields: body.fields });
}
type ErrorInput = { kind: ErrorKind; message: string; fields: unknown };
function expected(input: ErrorInput): ExpectedError {
  const fields = parseFields(input.fields);
  return new ExpectedError({ kind: input.kind, message: input.message, ...fields });
}
function parseFields(value: unknown): { fields?: ErrorFields } {
  const record = isRecord(value);
  if (!record) return {};
  const fields: Record<string, string> = {};
  for (const [field, message] of Object.entries(value)) {
    const invalid = typeof message !== "string";
    if (invalid) return {};
    fields[field] = message;
  }
  return { fields };
}
function invalidError(): ExpectedError {
  return new ExpectedError({ kind: "unavailable", message: "Request failed" });
}
