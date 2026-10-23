import { expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";
import { recordForm } from "#shared/page-objects/records.page.ts";
import type { RecordForm } from "#shared/page-objects/records.page.ts";
import { shellPage } from "#shared/page-objects/shell.page.ts";
import { appOrigin } from "#shared/test-data/session.data.ts";
import type { TestAccount } from "#shared/test-data/session.data.ts";
export type SettingsView = { form: RecordForm; save: Locator; alert: Locator };
function section(page: Page, title: string): Locator {
  return page
    .getByRole("main")
    .locator("section")
    .filter({ has: page.getByRole("heading", { level: 1, name: title, exact: true }) });
}
export function settingsPage(page: Page): SettingsView {
  const scope = section(page, "Settings");
  return {
    form: recordForm(scope),
    save: scope.getByRole("button", { name: "Save", exact: true }),
    alert: scope.getByRole("alert"),
  };
}
export async function signIn(page: Page, account: TestAccount): Promise<void> {
  await page.goto(`${appOrigin}/login`);
  const form = recordForm(section(page, "Login"));
  await form.field("Email").fill(account.email);
  await form.field("Password").fill(account.password);
  await section(page, "Login").getByRole("button", { name: "Login", exact: true }).click();
  await expect(
    shellPage(page).menu.getByRole("link", { name: account.name, exact: true }),
  ).toBeVisible();
}
