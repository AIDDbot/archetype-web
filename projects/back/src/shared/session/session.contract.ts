import type { Database } from "#shared/database/database.contract.ts";
export type UserId = string & { readonly userId: unique symbol };
export type SessionToken = string & { readonly sessionToken: unique symbol };
export type SessionIdentity = { userId: UserId; tokenHash: string };
export type Passwords = {
  hash: (password: string) => string;
  verify: (password: string, hash: string) => boolean;
};
export type Tokens = { create: () => SessionToken; hash: (token: string) => string };
export type SessionResolver = (authorization: unknown) => SessionIdentity | undefined;
export type FeatureServices = {
  database: Database;
  passwords: Passwords;
  tokens: Tokens;
  clock: () => Date;
  generate: () => string;
  sessionTtlHours: number;
};
