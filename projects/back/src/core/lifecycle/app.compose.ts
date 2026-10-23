import express from "express";
import type { Express } from "express";
import type { Identity } from "#shared/identity.type.ts";
import type { Feature } from "#shared/http/feature.contract.ts";
import type { Settings } from "#core/settings/settings.load.ts";
import type { Logger } from "#shared/logging/logger.contract.ts";
import { securityMiddleware } from "#core/http/security.middleware.ts";
import { identifierMiddleware } from "#core/http/identifier.middleware.ts";
import { requestMiddleware } from "#core/http/request.middleware.ts";
import { corsMiddleware } from "#core/http/cors.middleware.ts";
import { bodyMiddleware } from "#core/http/body.middleware.ts";
import { errorMiddleware } from "#core/http/error.middleware.ts";
import { indexHandler, notFoundHandler } from "#core/http/index.middleware.ts";
import { mountRoutes } from "#core/http/routes.mount.ts";
export type AppOptions = { features: Feature[]; identity: Identity };
export type AppServices = {
  settings: Settings;
  logger: Logger;
  generate: () => string;
  clock: () => number;
};
export type AppComposition = { app: Express; identity: Identity };
export function createApp(options: AppOptions, services: AppServices): AppComposition {
  const app = express();
  app.disable("x-powered-by");
  app.use(requestMiddleware(services), securityMiddleware, identifierMiddleware(services.generate));
  app.use(corsMiddleware(services.settings.origin), bodyMiddleware(services.settings.bodyLimit));
  app.get("/api", indexHandler(options.features));
  mountRoutes(app, options.features);
  app.use("/api", notFoundHandler);
  app.use(errorMiddleware(services.logger));
  return { app, identity: options.identity };
}
