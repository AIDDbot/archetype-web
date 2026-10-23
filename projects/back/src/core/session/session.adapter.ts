import { randomBytes, createHash, scryptSync, timingSafeEqual } from "node:crypto";
import { createPasswords } from "./passwords.create.ts";
import type { Derivation } from "./passwords.create.ts";
import type { Passwords, Tokens } from "#shared/session/session.contract.ts";
import { readToken } from "#shared/session/session.parse.ts";
const BYTES = { salt: 16, hash: 64, token: 32 } as const;
export const passwords: Passwords = createPasswords({
  salt: () => randomBytes(BYTES.salt).toString("hex"),
  derive: (input: Derivation): string =>
    scryptSync(input.password, input.salt, BYTES.hash, input.cost).toString("hex"),
  equal: (left: string, right: string): boolean =>
    timingSafeEqual(Buffer.from(left, "hex"), Buffer.from(right, "hex")),
});
export const tokens: Tokens = {
  create: () => readToken(randomBytes(BYTES.token).toString("base64url")),
  hash: (token: string): string => createHash("sha256").update(token).digest("hex"),
};
