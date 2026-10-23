import { createStore } from "#shared/state/store.create.ts";
import type { Session, SessionService, TokenStorage } from "#shared/session/session.contract.ts";
import type { AuthData } from "./auth.type.ts";
import type { HttpClient } from "#shared/http/http.contract.ts";
import { restoreUser } from "./auth.client.ts";
export function createAuthSession(storage: TokenStorage): SessionService {
  const state = createStore<Session | null>(null);
  function set(session: Session | null): void {
    const absent = session === null;
    if (absent) storage.clear();
    else storage.write(session.token);
    state.set(session);
  }
  async function restore(http: HttpClient): Promise<void> {
    const token = storage.read();
    const absent = token === null;
    if (absent) return;
    const user = await restoreUser(http);
    const missing = user === null;
    set(missing ? null : { token, user });
  }
  return { state, set, restore };
}

export function createAuthOperations(data: AuthData): AuthData {
  return { submit: (operation, values) => data.submit(operation, values) };
}
