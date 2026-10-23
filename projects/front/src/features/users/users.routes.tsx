import type { Feature, PageLoader } from "#shared/components/page.contract.ts";
import { AccountPage } from "./users.component.tsx";
import { createAccountData } from "./users.client.ts";
import { createAccountStore } from "./users.store.ts";
import type { AccountStore } from "./users.type.ts";
export function registerUsers(): Feature {
  let store: AccountStore;
  const load: PageLoader = (services, parameters) => {
    store = createAccountStore(createAccountData(services.http));
    void store.load(parameters.id ?? "");
  };
  return {
    pages: [
      {
        path: "/users/:id",
        access: "session",
        load,
        page: (props) => <AccountPage store={store} preferences={props.services.preferences} />,
      },
    ],
    links: [],
    cards: [],
  };
}
