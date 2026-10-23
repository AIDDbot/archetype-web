import type { Access, SessionService, TokenStorage } from "#shared/session/session.contract.ts";
import type { ReactElement } from "react";
import type { HttpClient } from "#shared/http/http.contract.ts";
import type { ConsoleLogger } from "#shared/logging/logger.contract.ts";
import type { PreferenceService, PreferenceSource } from "#shared/session/preferences.contract.ts";
export type Navigation = (path: string) => void;
export type PageServices = {
  http: HttpClient;
  logger: ConsoleLogger;
  navigate: Navigation;
  session: SessionService;
  preferences: PreferenceService;
  completeLogin: () => void;
};
export type PathParameters = Readonly<Record<string, string | undefined>>;
export type PageProps = { services: PageServices; parameters: PathParameters };
export type Page = (props: PageProps) => ReactElement;
export type PageLoader = (
  services: Omit<PageServices, "navigate" | "completeLogin">,
  parameters: PathParameters,
) => void;
export type PageRegistration = { path: string; access: Access; page: Page; load?: PageLoader };
export type MenuLink = { path: string; label: string; access: Access };
export type HomeCard = {
  path: string;
  title: string;
  description: string;
  page?: Page;
  load?: PageLoader;
};
export type Feature = {
  pages: PageRegistration[];
  links: MenuLink[];
  cards: HomeCard[];
  session?: (storage: TokenStorage) => SessionService;
  preferences?: PreferenceSource;
};
