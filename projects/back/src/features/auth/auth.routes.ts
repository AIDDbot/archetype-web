import type { Feature } from "#shared/http/feature.contract.ts";
import { readSession } from "#shared/session/session.read.ts";
import { createAuth } from "./auth.service.ts";
import { createRepository } from "./auth.repository.ts";
import { readRegistration, readCredentials } from "./auth.read.ts";
import { migration } from "./auth.migration.ts";
import { createFacade } from "./auth.api.ts";
import type { AuthFacade } from "./auth.api.ts";
import type { AuthLogic } from "./auth.type.ts";
export type AuthRegistration = { feature: Feature; facade: AuthFacade };
export function registerAuth(): AuthRegistration {
  let logic: AuthLogic;
  const feature: Feature = {
    migrations: [migration],
    connect: (services): void => {
      logic = createAuth({ ...services, repository: createRepository(services.database) });
    },
    resolveSession: (authorization) => logic.resolve(authorization),
    routes: [
      {
        method: "post",
        path: "/auth/register",
        public: true,
        handler: (request, response) =>
          response.status(201).json(logic.register(readRegistration(request.body))),
      },
      {
        method: "post",
        path: "/auth/login",
        public: true,
        handler: (request, response) => response.json(logic.login(readCredentials(request.body))),
      },
      {
        method: "get",
        path: "/auth/me",
        handler: (request, response) => response.json(logic.me(readSession(request))),
      },
      {
        method: "post",
        path: "/auth/logout",
        handler: (request, response) => {
          logic.logout(readSession(request));
          return response.status(204).end();
        },
      },
    ],
  };
  return { feature, facade: createFacade(() => logic) };
}
