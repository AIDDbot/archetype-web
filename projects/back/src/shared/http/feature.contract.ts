import type { RouteHandler } from "./route.contract.ts";
import type { Migration } from "#shared/database/migration.contract.ts";
import type { FeatureServices, SessionResolver } from "#shared/session/session.contract.ts";
export type Route = {
  method: "get" | "post" | "put" | "patch" | "delete";
  path: string;
  handler: RouteHandler;
  public?: true;
};
export type Feature = {
  routes: readonly Route[];
  migrations: readonly Migration[];
  connect?: (services: FeatureServices) => void;
  resolveSession?: SessionResolver;
};
