import { ExpectedError } from "#shared/expected.error.ts";
import type { SessionIdentity } from "./session.contract.ts";
const sessions = new WeakMap<object, SessionIdentity>();
export function keepSession(request: object, session: SessionIdentity): void {
  sessions.set(request, session);
}
export function readSession(request: object): SessionIdentity {
  const session = sessions.get(request);
  const absent = session === undefined;
  if (absent) throw new ExpectedError({ kind: "unauthorized", message: "Unauthorized" });
  return session;
}
