import type { NextFunction } from "express";
import type { HttpRequest as Request, HttpResponse as Response } from "./http.contract.ts";
import type { Logger, LogLevel } from "#shared/logging/logger.contract.ts";
import { formatMilliseconds } from "#shared/values/durations/durations.format.ts";
export type RequestLogging = { logger: Logger; clock: () => number };
function requestLevel(status: number): LogLevel {
  const serverError = status >= 500;
  if (serverError) return "error";
  const clientError = status >= 400;
  return clientError ? "warn" : "info";
}
export function requestMiddleware(
  options: RequestLogging,
): (request: Request, response: Response, next: NextFunction) => void {
  return (request: Request, response: Response, next: NextFunction): void => {
    const start = options.clock();
    const path = request.originalUrl.split("?")[0];
    const method = request.method;
    response.once("finish", (): void => {
      const duration = Math.round(options.clock() - start);
      options.logger.write(
        requestLevel(response.statusCode),
        `${method} ${path} ${response.statusCode} ${formatMilliseconds(duration)}`,
      );
    });
    next();
  };
}
