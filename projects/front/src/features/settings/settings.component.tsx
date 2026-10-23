import { useSyncExternalStore } from "react";
import type { FormEvent, ReactElement } from "react";
import type { PageProps } from "#shared/components/page.contract.ts";
import { RecordForm } from "#shared/components/form.component.tsx";
import { settingsForm, settingsInput } from "./settings.model.ts";
import type { SettingsStore } from "./settings.type.ts";
export type SettingsProps = PageProps & { store: SettingsStore };
export function SettingsPage(props: SettingsProps): ReactElement {
  const store = props.store;
  const state = useSyncExternalStore(store.state.subscribe, store.state.read);
  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    await store.save(settingsInput(new FormData(event.currentTarget)));
  }
  if (state.busy) return <output aria-busy="true">Loading settings</output>;
  const values = state.values;
  const isMissing = values === null;
  if (isMissing) return <p role="alert">Settings unavailable</p>;
  return (
    <section>
      <h1>Settings</h1>
      <p role="alert">{state.message}</p>
      <RecordForm
        model={settingsForm(values, state)}
        onSubmit={(event) => {
          void submit(event);
        }}
      />
    </section>
  );
}
