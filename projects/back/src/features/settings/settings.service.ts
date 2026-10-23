import type { SessionIdentity } from "#shared/session/session.contract.ts";
import type { Preferences, SettingsServices, SettingsLogic, SaveRequest } from "./settings.type.ts";
const defaults: Preferences = { theme: "system", dateFormat: "locale" };
function read(services: SettingsServices, session: SessionIdentity): Preferences {
  services.auth.account({ session, id: session.userId });
  return services.repository.find(session.userId) ?? { ...defaults };
}
function save(services: SettingsServices, input: SaveRequest): Preferences {
  services.auth.account({ session: input.session, id: input.session.userId });
  services.repository.save({
    ...input.preferences,
    userId: input.session.userId,
    updatedAt: services.clock().toISOString(),
  });
  return input.preferences;
}
export function createSettings(services: SettingsServices): SettingsLogic {
  return { read: (session) => read(services, session), save: (input) => save(services, input) };
}
