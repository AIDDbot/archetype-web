import { useSyncExternalStore } from "react";
import type { ReactElement } from "react";
import { RecordDetail } from "#shared/components/record.component.tsx";
import type { AccountStore } from "./users.type.ts";
import { accountDetail } from "./users.model.ts";
import { valueFormat } from "#shared/session/preferences.select.ts";
import type { PreferenceService } from "#shared/session/preferences.contract.ts";
export type AccountProps = { store: AccountStore; preferences: PreferenceService };
export function AccountPage(props: AccountProps): ReactElement {
  const store = props.store;
  const state = useSyncExternalStore(store.state.subscribe, store.state.read);
  const preferences = useSyncExternalStore(
    props.preferences.state.subscribe,
    props.preferences.state.read,
  );
  if (state.busy) return <output>Loading account</output>;
  const account = state.account;
  const missing = account === null;
  if (missing) return <h1>Account not found</h1>;
  return (
    <RecordDetail model={accountDetail(account, valueFormat(props.preferences, preferences))} />
  );
}
