import { createRouteLoader } from "#core/session/route.load.ts";
import { StrictMode } from "react";
import type { ReactElement } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import type { RouteObject } from "react-router";
import type { Identity } from "#shared/identity.type.ts";
import type { Feature, PageServices } from "#shared/components/page.contract.ts";
import { Shell, NotFound } from "#core/shell/shell.component.tsx";
import { PageAdapter } from "#core/shell/page.component.tsx";
import type { Theme } from "#core/theme/theme.select.ts";
import type { Store } from "#shared/state/store.create.ts";
export type AppOptions = { features: Feature[]; identity: Identity };
export type AppServices = {
  theme: Store<Theme>;
  pages: Omit<PageServices, "navigate" | "completeLogin">;
};
export function createApp(options: AppOptions, services: AppServices): ReactElement {
  const children: RouteObject[] = options.features.flatMap((feature) =>
    feature.pages.map((registration) => ({
      path: registration.path,
      loader: createRouteLoader({ registration, services: services.pages }),
      element: (
        <PageAdapter
          key={registration.path}
          registration={registration}
          services={services.pages}
          paths={options.features.flatMap((entry) => entry.pages.map((page) => page.path))}
        />
      ),
    })),
  );
  const links = options.features.flatMap((feature) => feature.links);
  const router = createBrowserRouter([
    {
      element: (
        <Shell
          identity={options.identity}
          links={links}
          theme={services.theme}
          services={services.pages}
        />
      ),
      children: [...children, { path: "*", element: <NotFound /> }],
    },
  ]);
  return (
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  );
}
