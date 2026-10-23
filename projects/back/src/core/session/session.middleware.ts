import type { SessionResolver } from "#shared/session/session.contract.ts";
import { keepSession } from "#shared/session/session.read.ts";
import { ExpectedError } from "#shared/expected.error.ts";
type SessionRequest = { headers: { authorization?: string | undefined } };
type SessionMiddleware = (request: SessionRequest, response: unknown, next: () => void) => void;
export function sessionMiddleware(resolve: SessionResolver): SessionMiddleware {
  return (request, _response, next): void => {
    const session = resolve(request.headers.authorization);
    const absent = session === undefined;
    if (absent) throw new ExpectedError({ kind: "unauthorized", message: "Unauthorized" });
    keepSession(request, session);
    next();
  };
}
