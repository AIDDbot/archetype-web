import type { NextFunction } from "express";
import type { HttpRequest as Request, HttpResponse as Response } from "./http.contract.ts";
export function securityMiddleware(
  _request: Request,
  response: Response,
  next: NextFunction,
): void {
  response.set({
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
  });
  next();
}
