import { randomBytes, createHash, scryptSync, timingSafeEqual } from "node:crypto";
import { createPasswords } from "./passwords.create.ts";
import type { Derivation } from "./passwords.create.ts";
import type { Passwords, Tokens } from "#shared/session/session.contract.ts";
import { readToken } from "#shared/session/session.parse.ts";
export const passwords: Passwords = createPasswords({
  salt: () => randomBytes(16).toString("hex"),
  derive: (input: Derivation): string =>
    scryptSync(input.password, input.salt, 64, input.cost).toString("hex"),
  equal: (left: string, right: string): boolean =>
    timingSafeEqual(Buffer.from(left, "hex"), Buffer.from(right, "hex")),
});
export const tokens: Tokens = {
  create: () => readToken(randomBytes(32).toString("base64url")),
  hash: (token: string): string => createHash("sha256").update(token).digest("hex"),
};
