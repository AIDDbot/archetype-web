import type { AccountRequest, Account, AuthLogic } from "./auth.type.ts";
export type { AccountRequest, Account } from "./auth.type.ts";
export type AuthFacade = { account: (input: AccountRequest) => Account };
export function createFacade(logic: () => AuthLogic): AuthFacade {
  return { account: (input) => logic().account(input) };
}
