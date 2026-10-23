import type { Fetch, HttpClient, HttpRequest, RuntimeConfig } from "#shared/http/http.contract.ts";
import { isRecord } from "#shared/values/values.check.ts";
import { ExpectedError } from "#shared/expected.error.ts";
import { parseApiUrl } from "#core/settings/settings.load.ts";
import { responseError } from "./http.error.ts";
const NO_CONTENT = 204;
async function configuration(fetch: Fetch): Promise<RuntimeConfig> {
  const response = await fetch("/runtime-config.json");
  const body: unknown = await response.json();
  const valid = response.ok && isRecord(body);
  if (!valid)
    throw new ExpectedError({
      kind: "unavailable",
      message: "Runtime configuration is unavailable",
    });
  return { apiBaseUrl: parseApiUrl(body.apiBaseUrl) };
}
async function send(fetch: Fetch, request: HttpRequest): Promise<unknown> {
  const config = await configuration(fetch);
  const response = await fetch(new URL(request.path, config.apiBaseUrl).href, request.init);
  const empty = response.status === NO_CONTENT;
  const body: unknown = empty ? undefined : await response.json();
  if (!response.ok) throw responseError(body, response.status);
  return body;
}
export type TokenReader = () => string | null;
export function authenticatedRequest(request: HttpRequest, token: string | null): HttpRequest {
  const absent = token === null;
  if (absent) return request;
  const headers = new Headers(request.init?.headers);
  headers.set("Authorization", `Bearer ${token}`);
  return { ...request, init: { ...request.init, headers } };
}
export function createHttpClient(fetch: Fetch, token: TokenReader = () => null): HttpClient {
  return {
    request: (request: HttpRequest): Promise<unknown> =>
      send(fetch, authenticatedRequest(request, token())),
  };
}
