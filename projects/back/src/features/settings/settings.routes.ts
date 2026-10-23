import type { Feature } from "#shared/http/feature.contract.ts";
import type { AuthFacade } from "#api/auth";
import { readSession } from "#shared/session/session.read.ts";
import { createSettings } from "./settings.service.ts";
import { createRepository } from "./settings.repository.ts";
import { readPreferences } from "./settings.read.ts";
import { migration } from "./settings.migration.ts";
import type { SettingsLogic } from "./settings.type.ts";
export function registerSettings(auth: AuthFacade): Feature {
  let logic: SettingsLogic;
  return {
    migrations: [migration],
    connect: (services): void => {
      logic = createSettings({
        auth,
        clock: services.clock,
        repository: createRepository(services.database),
      });
    },
    routes: [
      {
        method: "get",
        path: "/users/me/settings",
        handler: (request, response) => response.json(logic.read(readSession(request))),
      },
      {
        method: "put",
        path: "/users/me/settings",
        handler: (request, response) =>
          response.json(
            logic.save({
              session: readSession(request),
              preferences: readPreferences(request.body),
            }),
          ),
      },
    ],
  };
}
