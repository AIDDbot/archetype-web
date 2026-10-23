import type { Feature, PageLoader } from "#shared/components/page.contract.ts";
import type { Identity } from "#shared/identity.type.ts";
import { AboutCard, AboutPage } from "./about.component.tsx";
import { createAboutData } from "./about.client.ts";
import { createAboutStore } from "./about.store.ts";
import type { AboutStore } from "./about.type.ts";
export function registerAbout(identity: Identity): Feature {
  let store: AboutStore;
  const load: PageLoader = (services) => {
    store = createAboutStore(createAboutData(services.http));
    void store.load();
  };
  return {
    pages: [
      {
        path: "/about",
        access: "everyone",
        load,
        page: () => <AboutPage store={store} identity={identity} />,
      },
    ],
    links: [{ path: "/about", label: "About", access: "everyone" }],
    cards: [
      {
        path: "/about",
        title: "About",
        description: "Application information",
        load,
        page: () => <AboutCard store={store} />,
      },
    ],
  };
}
