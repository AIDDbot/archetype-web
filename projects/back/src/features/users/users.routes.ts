import type { Feature } from "#shared/http/feature.contract.ts";
import type { AuthFacade } from "#api/auth";
import { readSession } from "#shared/session/session.read.ts";
import { readUserId } from "#shared/session/session.parse.ts";
import { readAccount } from "./users.service.ts";
export function registerUsers(auth: AuthFacade): Feature {
  return {
    migrations: [],
    routes: [
      {
        method: "get",
        path: "/users/:id",
        handler: (request, response) =>
          response.json(
            readAccount(auth, { session: readSession(request), id: readUserId(request.params.id) }),
          ),
      },
    ],
  };
}
