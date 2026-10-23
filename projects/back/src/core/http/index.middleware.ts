import type {
  RouteRequest as HttpRequest,
  RouteResponse as HttpResponse,
} from "#shared/http/route.contract.ts";
import type { Feature } from "#shared/http/feature.contract.ts";
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
  response.status(404).json({ error: "Not found" });
}
