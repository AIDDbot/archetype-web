import { browserTokens } from "#core/session/session.adapter.ts";
import { createRoot } from "react-dom/client";
import { createApp } from "./app.compose.tsx";
import type { AppOptions } from "./app.compose.tsx";
import { initialTheme } from "#core/theme/theme.select.ts";
import type { Theme } from "#core/theme/theme.select.ts";
import { connectTheme } from "#core/theme/theme.connect.ts";
import { connectPreferences, syncPreferences } from "#core/session/preferences.connect.ts";
import { createStore } from "#shared/state/store.create.ts";
import type { Store } from "#shared/state/store.create.ts";
import type { SessionService } from "#shared/session/session.contract.ts";
import type { HttpClient } from "#shared/http/http.contract.ts";
import type {
  Preferences,
  PreferenceService,
  PreferenceSource,
} from "#shared/session/preferences.contract.ts";
const noPreferences: PreferenceSource = async () => null;
const prefersDark = (): boolean => matchMedia("(prefers-color-scheme: dark)").matches;
const browserTheme = (): Theme =>
  initialTheme({ selected: localStorage.getItem("theme"), dark: prefersDark() });
import { createHttpClient } from "#core/http/http.create.ts";
import { createConsoleLogger } from "#core/logging/log.create.ts";
function createTheme(): Store<Theme> {
  const theme = createStore<Theme>(browserTheme());
  const showTheme = (): void => {
    document.documentElement.dataset.theme = theme.read();
  };
  showTheme();
  theme.subscribe(showTheme);
  return theme;
}
type PreferenceStart = {
  options: AppOptions;
  theme: Store<Theme>;
  session: SessionService;
  http: HttpClient;
};
async function startPreferences(input: PreferenceStart): Promise<PreferenceService> {
  const preferences = { state: createStore<Preferences | null>(null), locale: navigator.language };
  connectTheme({ preferences, theme: input.theme, browser: browserTheme, dark: prefersDark });
  const source =
    input.options.features.flatMap((feature) =>
      feature.preferences ? [feature.preferences] : [],
    )[0] ?? noPreferences;
  const link = { session: input.session, preferences, source, http: input.http };
  await syncPreferences(link);
  connectPreferences(link);
  return preferences;
}
export async function start(options: AppOptions): Promise<void> {
  const theme = createTheme();
  document.title = options.identity.displayName;
  const storage = browserTokens(localStorage);
  const factory = options.features.flatMap((feature) =>
    feature.session ? [feature.session] : [],
  )[0];
  const absent = factory === undefined;
  if (absent) throw new Error("Session registration is required");
  const session = factory(storage);
  const http = createHttpClient(fetch, storage.read);
  await session.restore(http);
  const preferences = await startPreferences({ options, theme, session, http });
  const pages = {
    http,
    session,
    preferences,
    logger: createConsoleLogger((line) => console.info(line)),
  };
  createRoot(document.body).render(createApp(options, { theme, pages }));
}
