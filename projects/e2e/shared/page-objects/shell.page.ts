import type { Locator, Page } from "@playwright/test";
export type ShellPage = { header: Locator; menu: Locator; home: Locator; theme: Locator };
export function shellPage(page: Page): ShellPage {
  return {
    header: page.locator(".shell-header"),
    menu: page.getByRole("navigation", { name: "Main menu" }),
    home: page.getByRole("navigation").getByRole("link", { name: "Home" }),
    theme: page.getByRole("button", { name: "Change theme" }),
  };
}
export type HomePage = { header: Locator; name: Locator; description: Locator; cards: Locator };
export function homePage(page: Page): HomePage {
  const header = page.locator(".home-header");
  return {
    header,
    name: header.getByRole("heading", { level: 1 }),
    description: header.locator("h1 + p"),
    cards: page.getByLabel("Application cards"),
  };
}
export type NotFoundPage = { title: Locator; path: Locator; home: Locator };
export function notFoundPage(page: Page, path: string): NotFoundPage {
  return {
    title: page.getByRole("heading", { name: "Page not found" }),
    path: page.getByText(path, { exact: true }),
    home: page.getByRole("main").getByRole("link", { name: "Home" }),
  };
}
