import { registerUsers } from "./users/users.routes.tsx";
import { registerAuth } from "./auth/auth.routes.tsx";
import type { Feature } from "#shared/components/page.contract.ts";
import type { Identity } from "#shared/identity.type.ts";
import { registerHome } from "./home/home.routes.tsx";
import { registerAbout } from "./about/about.routes.tsx";
import { registerSettings } from "./settings/settings.routes.tsx";
export const features: Feature[] = [];
export function registerFeatures(identity: Identity): Feature[] {
  const registered = [
    registerUsers(),
    registerAuth(),
    registerAbout(identity),
    registerSettings(),
    ...features,
  ];
  const cards = registered.flatMap((feature) => feature.cards);
  return [registerHome({ identity, cards }), ...registered];
}
