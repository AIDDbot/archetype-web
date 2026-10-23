import type { Feature, PageLoader } from "#shared/components/page.contract.ts";
import { SettingsPage } from "./settings.component.tsx";
import { createSettingsData, loadPreferences } from "./settings.client.ts";
import { createSettingsStore } from "./settings.store.ts";
import type { SettingsStore } from "./settings.type.ts";
export function registerSettings(): Feature {
  let store: SettingsStore;
  const load: PageLoader = (services) => {
    store = createSettingsStore({
      data: createSettingsData(services.http),
      preferences: services.preferences,
    });
    void store.load();
  };
  return {
    preferences: loadPreferences,
    pages: [
      {
        path: "/settings",
        access: "session",
        load,
        page: (props) => <SettingsPage {...props} store={store} />,
      },
    ],
    links: [{ path: "/settings", label: "Settings", access: "session" }],
    cards: [],
  };
}
