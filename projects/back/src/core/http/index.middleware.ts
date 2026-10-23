import type {
  RouteRequest as HttpRequest,
  RouteResponse as HttpResponse,
} from "#shared/http/route.contract.ts";
import type { Feature } from "#shared/http/feature.contract.ts";
const NOT_FOUND = 404;
export type RouteDescription = { method: string; path: string };
export function routeIndex(features: Feature[]): RouteDescription[] {
  return features.flatMap((feature) =>
    feature.routes.map((route) => ({
      method: route.method.toUpperCase(),
      path: `/api${route.path}`,
    })),
  );
}
export function indexHandler(
  features: Feature[],
): (request: HttpRequest, response: HttpResponse) => void {
  const routes = routeIndex(features);
  return (_request: HttpRequest, response: HttpResponse): void => {
    response.json({ routes });
  };
}
export function notFoundHandler(_request: HttpRequest, response: HttpResponse): void {
  response.status(NOT_FOUND).json({ error: "Not found" });
}
