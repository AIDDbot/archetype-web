import type { NextFunction } from "express";
import type { HttpRequest as Request, HttpResponse as Response } from "./http.contract.ts";
import { ExpectedError } from "#shared/expected.error.ts";
import type { ErrorKind } from "#shared/expected.error.ts";
import type { Logger } from "#shared/logging/logger.contract.ts";
import { isRecord } from "#shared/values/values.check.ts";
export const errorStatuses: Record<ErrorKind, number> = {
  rule: 400,
  usage: 400,
  unavailable: 503,
  unauthorized: 401,
  conflict: 409,
  missing: 404,
};
export type ErrorAnswer = {
  status: number;
  body: { error: string; fields?: Readonly<Record<string, string>> };
};
export function errorAnswer(error: unknown, logger: Logger): ErrorAnswer {
  const expected = error instanceof ExpectedError;
  if (expected)
    return {
      status: errorStatuses[error.kind],
      body: { error: error.message, ...fieldsOf(error) },
    };
  const bodyFailure = isRecord(error) && error.type === "entity.too.large";
  if (bodyFailure)
    return {
      status: 413,
      body: { error: "Request body is too large" },
    };
  const syntax = error instanceof SyntaxError;
  if (syntax) return { status: 400, body: { error: "Invalid request body" } };
  const isError = error instanceof Error;
  const cause = isError ? error.name : "Unknown failure";
  logger.write("error", `Request failed: ${cause}`);
  return {
    status: 500,
    body: { error: "Internal server error" },
  };
}
function fieldsOf(error: ExpectedError): { fields?: Readonly<Record<string, string>> } {
  const absent = error.fields === undefined;
  return absent ? {} : { fields: error.fields };
}
export function errorMiddleware(
  logger: Logger,
): (error: unknown, request: Request, response: Response, next: NextFunction) => void {
  return (error: unknown, _request: Request, response: Response, _next: NextFunction): void => {
    const answer = errorAnswer(error, logger);
    response.status(answer.status).json(answer.body);
  };
}
