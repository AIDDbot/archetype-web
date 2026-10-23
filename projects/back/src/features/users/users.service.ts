import type { AuthFacade, AccountRequest, Account } from "#api/auth";
export function readAccount(auth: AuthFacade, input: AccountRequest): Account {
  return auth.account(input);
}
