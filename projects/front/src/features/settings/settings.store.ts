import { createStore } from "#shared/state/store.create.ts";
import type {
  SettingsInput,
  SettingsLinks,
  SettingsState,
  SettingsStore,
} from "./settings.type.ts";
const initial: SettingsState = {
  values: null,
  busy: true,
  sending: false,
  message: "",
  fields: {},
};
export function createSettingsStore(links: SettingsLinks): SettingsStore {
  const state = createStore<SettingsState>(initial);
  async function load(): Promise<void> {
    state.set(initial);
    state.set({ ...initial, values: await links.data.load(), busy: false });
  }
  async function save(values: SettingsInput): Promise<void> {
    state.set({ ...state.read(), values, sending: true, message: "", fields: {} });
    const result = await links.data.save(values);
    state.set({ ...state.read(), sending: false, message: result.message, fields: result.fields });
    const isSaved = result.preferences !== null;
    if (isSaved) links.preferences.state.set(result.preferences);
  }
  return { state, load, save };
}
