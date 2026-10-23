import type { NextFunction } from "express";
import type { HttpRequest as Request, HttpResponse as Response } from "./http.contract.ts";
export function requestIdentifier(value: unknown, generate: () => string): string {
  const text = typeof value === "string";
  const valid = text && /^[a-zA-Z0-9-]{1,128}$/.test(value);
  return valid ? value : generate();
}
export function identifierMiddleware(
  generate: () => string,
): (request: Request, response: Response, next: NextFunction) => void {
  return (request: Request, response: Response, next: NextFunction): void => {
    response.set("X-Request-Id", requestIdentifier(request.headers["x-request-id"], generate));
    next();
  };
}
