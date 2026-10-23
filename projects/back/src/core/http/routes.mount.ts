import type { Express } from "express";
import type { Feature } from "#shared/http/feature.contract.ts";
import { sessionMiddleware } from "#core/session/session.middleware.ts";
import type { SessionResolver } from "#shared/session/session.contract.ts";
export function sessionResolver(features: Feature[]): SessionResolver {
  const resolvers = features.flatMap((feature) =>
    feature.resolveSession ? [feature.resolveSession] : [],
  );
  const resolve: SessionResolver = (authorization) =>
    resolvers.map((read) => read(authorization)).find((value) => value !== undefined);
  return resolve;
}
export function mountRoutes(app: Express, features: Feature[]): void {
  const routes = features.flatMap((feature) => feature.routes);
  const guard = sessionMiddleware(sessionResolver(features));
  const publicRoutes = routes.filter((entry) => entry.public);
  const protectedRoutes = routes.filter((entry) => !entry.public);
  for (const route of publicRoutes) app[route.method](`/api${route.path}`, route.handler);
  for (const route of protectedRoutes) app[route.method](`/api${route.path}`, guard, route.handler);
}
