import type {
  Session,
  SessionIdentity,
  SessionService,
  TokenStorage,
} from "#shared/session/session.contract.ts";
import type { HttpClient } from "#shared/http/http.contract.ts";
export type Operation = "register" | "login";
export type Credentials = { name: string; email: string; password: string };
export type AuthResult = {
  session: Session | null;
  message: string;
  fields: Readonly<Record<string, string>>;
};
export type AuthData = {
  submit: (operation: Operation, values: Credentials) => Promise<AuthResult>;
};
export type SessionOptions = { storage: TokenStorage; http: HttpClient };
export type AuthSession = SessionService;
export type PublicUser = SessionIdentity;
