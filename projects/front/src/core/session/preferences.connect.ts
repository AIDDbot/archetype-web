import type { HttpClient } from "#shared/http/http.contract.ts";
import type { SessionService } from "#shared/session/session.contract.ts";
import type { PreferenceService, PreferenceSource } from "#shared/session/preferences.contract.ts";
export type PreferenceLink = {
  session: SessionService;
  preferences: PreferenceService;
  source: PreferenceSource;
  http: HttpClient;
};
export async function syncPreferences(link: PreferenceLink): Promise<void> {
  const isAnonymous = link.session.state.read() === null;
  const loaded = isAnonymous ? null : await link.source(link.http);
  const isCurrent = link.session.state.read() !== null;
  link.preferences.state.set(isCurrent ? loaded : null);
}
export function connectPreferences(link: PreferenceLink): void {
  link.session.state.subscribe(() => {
    void syncPreferences(link);
  });
}
