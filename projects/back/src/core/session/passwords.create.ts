import type { Passwords } from "#shared/session/session.contract.ts";
import { requireText } from "#shared/values/text/text.parse.ts";
export type PasswordCost = { N: number; r: number; p: number };
export type Derivation = { password: string; salt: string; cost: PasswordCost };
export type PasswordCrypto = {
  salt: () => string;
  derive: (input: Derivation) => string;
  equal: (left: string, right: string) => boolean;
};
type Digest = PasswordCost & { salt: string; hash: string };
const cost: PasswordCost = { N: 16384, r: 8, p: 5 };
function readDigest(encoded: string): Digest {
  const [, , N, r, p, salt, hash] = encoded.split("$");
  return {
    N: Number(N),
    r: Number(r),
    p: Number(p),
    salt: requireText(salt, "password salt"),
    hash: requireText(hash, "password hash"),
  };
}
export function createPasswords(crypto: PasswordCrypto): Passwords {
  return {
    hash: (password: string): string => {
      const salt = crypto.salt();
      const hash = crypto.derive({ password, salt, cost });
      return `$scrypt$${cost.N}$${cost.r}$${cost.p}$${salt}$${hash}`;
    },
    verify: (password: string, encoded: string): boolean => {
      const digest = readDigest(encoded);
      const hash = crypto.derive({ password, salt: digest.salt, cost: digest });
      return crypto.equal(hash, digest.hash);
    },
  };
}
