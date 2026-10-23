import type { Locator, Page } from "@playwright/test";
import { recordForm } from "#shared/page-objects/records.page.ts";
import type { RecordForm } from "#shared/page-objects/records.page.ts";
import type { Credentials } from "./users.client.ts";
export const origin = "http://localhost:4000";
export type AuthPage = { form: RecordForm; submit: Locator; alert: Locator };
export function authPage(page: Page, operation: string): AuthPage {
  const scope = page
    .getByRole("main")
    .locator("section")
    .filter({
      has: page.getByRole("heading", { level: 1, name: operation, exact: true }),
    });
  return {
    form: recordForm(scope),
    submit: scope.getByRole("button", { name: operation, exact: true }),
    alert: scope.getByRole("alert"),
  };
}
export async function fillLogin(page: Page, data: Credentials): Promise<void> {
  const view = authPage(page, "Login");
  await view.form.field("Email").fill(data.email);
  await view.form.field("Password").fill(data.password);
}
export async function browserLogin(page: Page, data: Credentials): Promise<void> {
  await page.goto(`${origin}/login`);
  await fillLogin(page, data);
  await authPage(page, "Login").submit.click();
}
export function accountPage(page: Page): Locator {
  return page.getByRole("main").locator(":scope > div");
}
