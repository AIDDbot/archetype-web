import { createStore } from "#shared/state/store.create.ts";
import type { AboutData, AboutState, AboutStore } from "./about.type.ts";
export function createAboutStore(data: AboutData): AboutStore {
  const state = createStore<AboutState>({ status: "busy", about: null });
  async function load(): Promise<void> {
    state.set({ status: "busy", about: null });
    const about = await data.load();
    const unavailable = about === null;
    state.set({ status: unavailable ? "error" : "ready", about });
  }
  return { state, load };
}
