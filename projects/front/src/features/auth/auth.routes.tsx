import type { Feature, PageLoader } from "#shared/components/page.contract.ts";
import { AuthPage, AuthCard } from "./auth.component.tsx";
import { createAuthData } from "./auth.client.ts";
import type { AuthData } from "./auth.type.ts";
import { createAuthSession, createAuthOperations } from "./auth.store.ts";
export function registerAuth(): Feature {
  let operations: AuthData;
  const load: PageLoader = (services) => {
    operations = createAuthOperations(createAuthData(services.http));
  };
  return {
    session: createAuthSession,
    pages: [
      {
        path: "/login",
        access: "anonymous",
        load,
        page: (props) => (
          <AuthPage key="login" {...props} operation="login" submit={operations.submit} />
        ),
      },
      {
        path: "/register",
        access: "anonymous",
        load,
        page: (props) => (
          <AuthPage key="register" {...props} operation="register" submit={operations.submit} />
        ),
      },
    ],
    links: [
      { path: "/login", label: "Login", access: "anonymous" },
      { path: "/register", label: "Register", access: "anonymous" },
    ],
    cards: [{ path: "/login", title: "Account", description: "Your account", page: AuthCard }],
  };
}
