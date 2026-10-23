import { createStore } from "#shared/state/store.create.ts";
import type { AccountData, AccountState, AccountStore } from "./users.type.ts";
export function createAccountStore(data: AccountData): AccountStore {
  const state = createStore<AccountState>({ account: null, busy: true });
  async function load(id: string): Promise<void> {
    state.set({ account: null, busy: true });
    state.set({ account: await data.load(id), busy: false });
  }
  return { state, load };
}
