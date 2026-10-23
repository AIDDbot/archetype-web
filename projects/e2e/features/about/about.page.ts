import type { Locator, Page } from "@playwright/test";
import { shellPage } from "#shared/page-objects/shell.page.ts";
import type { ShellPage } from "#shared/page-objects/shell.page.ts";
export type AboutPage = { shell: ShellPage; main: Locator; table: Locator; title: Locator };
export type AboutCard = { shell: ShellPage; card: Locator; link: Locator };
export function aboutPage(page: Page): AboutPage {
  const main = page.getByRole("main");
  return {
    shell: shellPage(page),
    main,
    table: main.getByRole("table", { name: "Project technologies" }),
    title: main.getByRole("heading", { level: 1 }),
  };
}
export function aboutCard(page: Page): AboutCard {
  const card = page
    .getByRole("article")
    .filter({ has: page.getByRole("heading", { name: "About", exact: true }) });
  return {
    shell: shellPage(page),
    card,
    link: card.getByRole("link", { name: "About this application" }),
  };
}
