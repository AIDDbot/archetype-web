import type { LoaderFunctionArgs } from "react-router";
import type { PageRegistration, PageServices } from "#shared/components/page.contract.ts";
import { allows } from "./access.select.ts";
export type RouteContext = {
  registration: PageRegistration;
  services: Omit<PageServices, "navigate" | "completeLogin">;
};
export type RouteArguments = Pick<LoaderFunctionArgs, "params">;
export type RouteLoader = (args: RouteArguments) => null;
export function createRouteLoader(context: RouteContext): RouteLoader {
  return (args) => {
    const authenticated = context.services.session.state.read() !== null;
    const allowed = allows(context.registration.access, authenticated);
    if (!allowed) return null;
    context.registration.load?.(context.services, args.params);
    return null;
  };
}
