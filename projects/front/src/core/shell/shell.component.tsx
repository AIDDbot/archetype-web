import { useState, useSyncExternalStore } from "react";
import type { ReactElement } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import type { Identity } from "#shared/identity.type.ts";
import type { MenuLink } from "#shared/components/page.contract.ts";
import type { PageServices } from "#shared/components/page.contract.ts";
import { allows } from "#core/session/access.select.ts";
import { nextTheme } from "#core/theme/theme.select.ts";
import type { Theme } from "#core/theme/theme.select.ts";
import type { Store } from "#shared/state/store.create.ts";
export type ShellProps = {
  identity: Identity;
  links: MenuLink[];
  theme: Store<Theme>;
  services: Omit<PageServices, "navigate" | "completeLogin">;
};
export function Shell(props: ShellProps): ReactElement {
  const session = useSyncExternalStore(
    props.services.session.state.subscribe,
    props.services.session.state.read,
  );
  const navigate = useNavigate();
  const [error, setError] = useState("");
  async function logout(): Promise<void> {
    try {
      await props.services.http.request({ path: "/api/auth/logout", init: { method: "POST" } });
    } catch (failure) {
      const unauthorized = failure instanceof Error && failure.message === "Unauthorized";
      if (!unauthorized) {
        setError("Logout failed");
        return;
      }
    }
    props.services.session.set(null);
    void navigate("/");
  }
  const theme = useSyncExternalStore(props.theme.subscribe, props.theme.read);
  function toggle(): void {
    const selected = nextTheme(theme);
    localStorage.setItem("theme", selected);
    props.services.logger.theme(selected);
    props.theme.set(selected);
  }
  const dark = theme === "dark";
  return (
    <>
      <header className="shell-header">
        <strong>{props.identity.displayName}</strong>
        <nav aria-label="Main menu">
          <ul>
            {props.links
              .filter((link) => allows(link.access, session !== null))
              .map((link) => (
                <li key={link.path}>
                  <NavLink to={link.path} end={link.path === "/"}>
                    {link.label}
                  </NavLink>
                </li>
              ))}
            {session !== null && (
              <>
                <li>
                  <Link to={`/users/${session.user.id}`}>{session.user.name}</Link>
                </li>
                <li>
                  <button
                    onClick={() => {
                      void logout();
                    }}
                  >
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>
        <button id="theme-toggle" onClick={toggle} aria-label="Change theme">
          {dark ? "Light theme" : "Dark theme"}
        </button>
      </header>
      <p role="alert">{error}</p>
      <main>
        <Outlet />
      </main>
    </>
  );
}
export function NotFound(): ReactElement {
  const location = useLocation();
  return (
    <section>
      <h1>Page not found</h1>
      <p>{location.pathname}</p>
      <Link to="/">Home</Link>
    </section>
  );
}
