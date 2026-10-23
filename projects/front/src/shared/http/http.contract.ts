export type RuntimeConfig = { apiBaseUrl: string };
export type HttpRequest = { path: string; init?: RequestInit };
export type HttpClient = { request: (request: HttpRequest) => Promise<unknown> };
export type Fetch = (input: string, init?: RequestInit) => Promise<Response>;
