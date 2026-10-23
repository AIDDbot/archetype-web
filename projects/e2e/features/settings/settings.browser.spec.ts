import { expect, test } from "@playwright/test";
import { readRecord } from "#shared/page-objects/records.page.ts";
import { shellPage } from "#shared/page-objects/shell.page.ts";
import {
  apiBase,
  appOrigin,
  authorization,
  newAccount,
  openSession,
} from "#shared/test-data/session.data.ts";
import { settingsPage, signIn } from "./settings.page.ts";
const isoDate = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
test(
  "settings show the current values, apply a saved theme and date format, and keep a failed form",
  { tag: "@S0007-R03" },
  async ({ page, request }) => {
    const account = newAccount();
    await openSession(request, account);
    await signIn(page, account);
    const menu = shellPage(page).menu;
    await menu.getByRole("link", { name: "Settings", exact: true }).click();
    const view = settingsPage(page);
    await expect(view.form.field("Theme")).toHaveValue("system");
    await expect(view.form.field("Date format")).toHaveValue("locale");
    await view.form.field("Theme").selectOption("dark");
    await view.form.field("Date format").selectOption("iso");
    await view.save.click();
    await expect(view.alert).toHaveText("Settings saved");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await menu.getByRole("link", { name: account.name, exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(account.name);
    const record = await readRecord(page.getByRole("main").locator(":scope > div"));
    expect(record.sections[0]?.facts[1]?.value).toMatch(isoDate);
    await menu.getByRole("link", { name: "Settings", exact: true }).click();
    await expect(view.form.field("Theme")).toHaveValue("dark");
    for (const failure of ["unavailable", "no answer"]) {
      await page.route("**/api/users/me/settings", (route) => {
        const isRead = route.request().method() === "GET";
        if (isRead) return route.continue();
        const isUnavailable = failure === "unavailable";
        return isUnavailable
          ? route.fulfill({ status: 503, json: { error: "Service unavailable" } })
          : route.abort();
      });
      await view.form.field("Theme").selectOption("light");
      await view.save.click();
      await expect(view.alert).not.toHaveText(/^(Settings saved)?$/);
      await expect(view.form.field("Theme")).toHaveValue("light");
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
      await page.unroute("**/api/users/me/settings");
    }
  },
);
for (const browserTheme of ["light", "dark"] as const) {
  test(
    `a login applies the theme of the account over the ${browserTheme} browser theme, and keeps it over the theme control after a reload, and a logout gives the browser theme back`,
    { tag: "@S0007-R04" },
    async ({ browser, request }) => {
      const isLight = browserTheme === "light";
      const accountTheme = isLight ? "dark" : "light";
      const account = newAccount();
      const headers = authorization(await openSession(request, account));
      const data = { theme: accountTheme, dateFormat: "locale" };
      expect((await request.put(`${apiBase}/users/me/settings`, { headers, data })).status()).toBe(
        200,
      );
      const context = await browser.newContext({ colorScheme: browserTheme });
      const page = await context.newPage();
      await page.goto(appOrigin);
      await expect(page.locator("html")).toHaveAttribute("data-theme", browserTheme);
      await signIn(page, account);
      await expect(page.locator("html")).toHaveAttribute("data-theme", accountTheme);
      await shellPage(page).theme.click();
      await expect(page.locator("html")).toHaveAttribute("data-theme", browserTheme);
      await page.reload();
      await expect(page.locator("html")).toHaveAttribute("data-theme", accountTheme);
      await shellPage(page).menu.getByRole("button", { name: "Logout" }).click();
      await expect(page.locator("html")).toHaveAttribute("data-theme", browserTheme);
      await context.close();
    },
  );
}
