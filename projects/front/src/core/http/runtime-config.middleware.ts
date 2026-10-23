import type { RuntimeConfig } from "#shared/http/http.contract.ts";
export type RuntimeRequest = { method?: string | undefined; url?: string | undefined };
export type RuntimeResponse = {
  setHeader: (name: string, value: string) => unknown;
  end: (body: string) => unknown;
};
export type RuntimeMiddleware = (
  request: RuntimeRequest,
  response: RuntimeResponse,
  next: () => void,
) => void;
export function runtimeConfigMiddleware(config: RuntimeConfig): RuntimeMiddleware {
  return (request: RuntimeRequest, response: RuntimeResponse, next: () => void): void => {
    const get = request.method === "GET";
    const configuration = request.url === "/runtime-config.json";
    const matches = get && configuration;
    if (!matches) {
      next();
      return;
    }
    response.setHeader("Content-Type", "application/json");
    response.setHeader("Cache-Control", "no-store");
    response.end(JSON.stringify({ apiBaseUrl: config.apiBaseUrl }));
  };
}
