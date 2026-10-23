export type RouteRequest = {
  body: unknown;
  params: Record<string, string | string[]>;
  query: Record<string, unknown>;
  headers: Record<string, string | string[] | undefined>;
};
export type RouteResponse = {
  status: (code: number) => RouteResponse;
  json: (body: unknown) => unknown;
  end: () => unknown;
};
export type RouteHandler = (request: RouteRequest, response: RouteResponse) => unknown;
export type RouteResult = { status: number; body: unknown };
export type RouteFake = {
  request: RouteRequest;
  response: RouteResponse;
  result: () => RouteResult;
};
export function createRouteFake(request: RouteRequest): RouteFake {
  let status = 200;
  let body: unknown;
  const response: RouteResponse = {
    status: (code: number): RouteResponse => {
      status = code;
      return response;
    },
    json: (value: unknown): void => {
      body = value;
    },
    end: (): void => {
      body = undefined;
    },
  };
  return { request, response, result: (): RouteResult => ({ status, body }) };
}
