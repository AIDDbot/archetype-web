import type { Feature } from "#shared/http/feature.contract.ts";
import type { Identity } from "#shared/identity.type.ts";
import { registerAbout } from "./about/about.routes.ts";
import { registerAuth } from "./auth/auth.routes.ts";
import { registerUsers } from "./users/users.routes.ts";
import { registerSettings } from "./settings/settings.routes.ts";
export function registerFeatures(identity: Identity): Feature[] {
  const auth = registerAuth();
  return [
    registerAbout(identity),
    auth.feature,
    registerUsers(auth.facade),
    registerSettings(auth.facade),
  ];
}
