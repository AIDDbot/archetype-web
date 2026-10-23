import type { Store } from "#shared/state/store.create.ts";
import type { HttpClient } from "#shared/http/http.contract.ts";
export type SessionIdentity = {
  id: string;
  name: string;
  email: string;
  role: "user";
  createdAt: string;
};
export type Session = { token: string; user: SessionIdentity };
export type TokenStorage = {
  read: () => string | null;
  write: (token: string) => void;
  clear: () => void;
};
export type SessionService = {
  state: Store<Session | null>;
  restore: (http: HttpClient) => Promise<void>;
  set: (session: Session | null) => void;
};
export type Access = "everyone" | "anonymous" | "session";
