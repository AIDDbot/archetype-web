import type { NextFunction } from "express";
import type { HttpRequest as Request, HttpResponse as Response } from "./http.contract.ts";
function allowedOrigin(configured: string, received: string | undefined): string | undefined {
  const wildcard = configured === "*";
  if (wildcard) return "*";
  const allowed = configured
    .split(",")
    .map((origin) => origin.trim())
    .includes(String(received));
  return allowed ? received : undefined;
}
export function corsMiddleware(
  origin: string,
): (request: Request, response: Response, next: NextFunction) => void {
  return (request: Request, response: Response, next: NextFunction): void => {
    const allowed = allowedOrigin(origin, request.headers.origin);
    if (allowed) response.set("Access-Control-Allow-Origin", allowed);
    response.vary("Origin");
    const isOptions = request.method === "OPTIONS";
    const preflight = isOptions && request.headers["access-control-request-method"] !== undefined;
    if (!preflight) {
      next();
      return;
    }
    response.set({
      "Access-Control-Allow-Methods": "GET, HEAD, PUT, PATCH, POST, DELETE",
      "Access-Control-Allow-Headers": "Content-Type, X-Request-Id, Authorization",
    });
    response.status(204).end();
  };
}
