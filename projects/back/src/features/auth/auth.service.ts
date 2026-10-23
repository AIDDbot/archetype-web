import { ExpectedError } from "#shared/expected.error.ts";
import { readUserId } from "#shared/session/session.parse.ts";
import type { SessionIdentity } from "#shared/session/session.contract.ts";
import type {
  AuthLogic,
  AuthServices,
  PublicUser,
  StoredUser,
  Registration,
  Credentials,
  Login,
  AccountRequest,
  Account,
} from "./auth.type.ts";
export function publicUser(user: StoredUser): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
  };
}
function requireUser(services: AuthServices, session: SessionIdentity): PublicUser {
  const user = services.repository.findUser(session.userId);
  const absent = user === undefined;
  if (absent) throw new ExpectedError({ kind: "unauthorized", message: "Unauthorized" });
  return publicUser(user);
}
function register(services: AuthServices, input: Registration): PublicUser {
  const user: StoredUser = {
    id: readUserId(services.generate()),
    name: input.name,
    email: input.email,
    role: "user",
    passwordHash: services.passwords.hash(input.password),
    createdAt: services.clock().toISOString(),
  };
  const inserted = services.repository.insertUser(user);
  if (!inserted) throw new ExpectedError({ kind: "conflict", message: "Email already registered" });
  return publicUser(user);
}
type LoginInput = { credentials: Credentials; dummyHash: string };
function login(services: AuthServices, input: LoginInput): Login {
  const user = services.repository.findEmail(input.credentials.email);
  const hash = user?.passwordHash ?? input.dummyHash;
  const verified = services.passwords.verify(input.credentials.password, hash);
  const unknown = user === undefined;
  const rejected = unknown || !verified;
  if (rejected) throw new ExpectedError({ kind: "unauthorized", message: "Invalid credentials" });
  const token = services.tokens.create();
  const now = services.clock();
  const expiresAt = new Date(now.getTime() + services.sessionTtlHours * 3600000).toISOString();
  services.repository.saveSession({
    userId: user.id,
    tokenHash: services.tokens.hash(token),
    createdAt: now.toISOString(),
    expiresAt,
  });
  return { token, user: publicUser(user) };
}
function resolve(services: AuthServices, authorization: unknown): SessionIdentity | undefined {
  const notText = typeof authorization !== "string";
  if (notText) return undefined;
  const bearer = /^Bearer (\S+)$/.exec(authorization);
  const token = bearer?.[1];
  const absent = token === undefined;
  if (absent) return undefined;
  return services.repository.findSession(
    services.tokens.hash(token),
    services.clock().toISOString(),
  );
}
function account(services: AuthServices, input: AccountRequest): Account {
  const different = input.id !== input.session.userId;
  if (different) throw new ExpectedError({ kind: "missing", message: "Not found" });
  const user = requireUser(services, input.session);
  return { name: user.name, email: user.email, createdAt: user.createdAt };
}
export function createAuth(services: AuthServices): AuthLogic {
  const dummyHash = services.passwords.hash(services.tokens.create());
  return {
    register: (input) => register(services, input),
    login: (credentials) => login(services, { credentials, dummyHash }),
    me: (session) => requireUser(services, session),
    logout: (session) => {
      services.repository.removeSession(session.tokenHash);
    },
    resolve: (authorization) => resolve(services, authorization),
    account: (input) => account(services, input),
  };
}
