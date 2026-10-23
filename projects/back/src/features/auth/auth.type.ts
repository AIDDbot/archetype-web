import type {
  UserId,
  SessionToken,
  SessionIdentity,
  Passwords,
  Tokens,
} from "#shared/session/session.contract.ts";
export type Email = string;
export type UserName = string;
export type Password = string;
export type PasswordHash = string;
export type CreatedAt = string;
export type UserRole = "user";
export type PublicUser = {
  id: UserId;
  email: Email;
  name: UserName;
  role: UserRole;
  createdAt: CreatedAt;
};
export type StoredUser = PublicUser & { passwordHash: PasswordHash };
export type Credentials = { email: Email; password: Password };
export type Registration = Credentials & { name: UserName };
export type Login = { token: SessionToken; user: PublicUser };
export type StoredSession = SessionIdentity & { createdAt: CreatedAt; expiresAt: string };
export type Account = Pick<PublicUser, "name" | "email" | "createdAt">;
export type AccountRequest = { session: SessionIdentity; id: UserId };
export type Repository = {
  findEmail: (email: Email) => StoredUser | undefined;
  findUser: (id: UserId) => StoredUser | undefined;
  insertUser: (user: StoredUser) => boolean;
  saveSession: (session: StoredSession) => void;
  findSession: (hash: string, now: string) => SessionIdentity | undefined;
  removeSession: (hash: string) => void;
};
export type AuthServices = {
  repository: Repository;
  passwords: Passwords;
  tokens: Tokens;
  clock: () => Date;
  generate: () => string;
  sessionTtlHours: number;
};
export type AuthLogic = {
  register: (input: Registration) => PublicUser;
  login: (input: Credentials) => Login;
  me: (session: SessionIdentity) => PublicUser;
  logout: (session: SessionIdentity) => void;
  resolve: (authorization: unknown) => SessionIdentity | undefined;
  account: (input: AccountRequest) => Account;
};
