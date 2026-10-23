import type { IncomingHttpHeaders } from "node:http";
export type HttpRequest = { method: string; originalUrl: string; headers: IncomingHttpHeaders };
export type HttpResponse = {
  set: { (header: string, value: string): unknown; (headers: Record<string, string>): unknown };
  vary: (field: string) => unknown;
  status: (status: number) => HttpResponse;
  json: (body: unknown) => unknown;
  end: () => unknown;
  once: (event: string, listener: () => void) => unknown;
  statusCode: number;
};
