import type { TokenStorage } from "#shared/session/session.contract.ts";
export function browserTokens(storage: Storage): TokenStorage {
  return {
    read: () => storage.getItem("session"),
    write: (token) => storage.setItem("session", token),
    clear: () => storage.removeItem("session"),
  };
}
