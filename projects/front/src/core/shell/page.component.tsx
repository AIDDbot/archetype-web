import { allows, returnTarget } from "#core/session/access.select.ts";
import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation, Navigate } from "react-router";
import type { PageRegistration, PageServices } from "#shared/components/page.contract.ts";
export type PageAdapterProps = {
  registration: PageRegistration;
  services: Omit<PageServices, "navigate" | "completeLogin">;
  paths: string[];
};
export function PageAdapter(props: PageAdapterProps): ReactElement {
  const navigate = useNavigate();
  const parameters = useParams();
  const location = useLocation();
  useEffect(
    () => props.services.logger.page(location.pathname),
    [props.services.logger, location.pathname],
  );
  const [allowed] = useState(() =>
    allows(props.registration.access, props.services.session.state.read() !== null),
  );
  if (!allowed) {
    const authenticated = props.services.session.state.read() !== null;
    const target = location.pathname + location.search + location.hash;
    return (
      <Navigate
        to={authenticated ? "/" : `/login?returnTo=${encodeURIComponent(target)}`}
        replace
      />
    );
  }
  const Page = props.registration.page;
  return (
    <Page
      services={{
        ...props.services,
        completeLogin: () => {
          void navigate(
            returnTarget({
              value: new URLSearchParams(location.search).get("returnTo"),
              origin: window.location.origin,
              paths: props.paths,
            }),
          );
        },
        navigate: (path) => {
          void navigate(path);
        },
      }}
      parameters={parameters}
    />
  );
}
