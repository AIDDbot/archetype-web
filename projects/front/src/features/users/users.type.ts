import type { Store } from "#shared/state/store.create.ts";
export type Account = { name: string; email: string; createdAt: Date };
export type AccountData = { load: (id: string) => Promise<Account | null> };
export type AccountState = { account: Account | null; busy: boolean };
export type AccountStore = { state: Store<AccountState>; load: (id: string) => Promise<void> };
