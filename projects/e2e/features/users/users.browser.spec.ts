import { expect, test } from "@playwright/test";
import { readRecord } from "#shared/page-objects/records.page.ts";
import { shellPage } from "#shared/page-objects/shell.page.ts";
import { holdRoute } from "#shared/page-objects/routes.page.ts";
import { credentials, createSession, register } from "./users.client.ts";
import { accountPage, authPage, browserLogin, fillLogin, origin } from "./users.page.ts";
test(
  "account record shows readable facts and a missing account keeps navigation",
  { tag: "@S0006-R04" },
  async ({ page, request }) => {
    const data = credentials();
    const session = await createSession(request, data);
    await browserLogin(page, data);
    await shellPage(page).menu.getByRole("link", { name: data.name, exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(data.name);
    const record = await readRecord(accountPage(page));
    expect(record.title).toBe(data.name);
    expect(record.sections[0]?.facts).toEqual([
      { label: "Email", value: data.email },
      { label: "Created", value: expect.any(String) },
    ]);
    expect(record.sections[0]?.facts[1]?.value).not.toBe(session.user.createdAt);
    await page.goto(`${origin}/users/no-such-user`);
    await expect(page.getByRole("heading", { name: "Account not found" })).toBeVisible();
    await expect(shellPage(page).menu).toBeVisible();
  },
);
test(
  "session survives reload and updates the home card and menu",
  { tag: "@S0006-R07" },
  async ({ page, request }) => {
    const data = credentials();
    await register(request, data);
    await page.goto(origin);
    const menu = shellPage(page).menu;
    await expect(menu.getByRole("link", { name: "Login", exact: true })).toBeVisible();
    await expect(menu.getByRole("link", { name: "Register", exact: true })).toBeVisible();
    await expect(menu.getByRole("button", { name: "Logout" })).toHaveCount(0);
    await browserLogin(page, data);
    await expect(page.getByRole("link", { name: `Hello, ${data.name}` })).toBeVisible();
    await page.reload();
    await expect(menu.getByRole("link", { name: data.name, exact: true })).toBeVisible();
    await expect(menu.getByRole("button", { name: "Logout" })).toBeVisible();
    await expect(menu.getByRole("link", { name: "Login", exact: true })).toHaveCount(0);
    await expect(page.getByRole("link", { name: `Hello, ${data.name}` })).toBeVisible();
  },
);
test(
  "logout keeps a failed session and clears it on success",
  { tag: "@S0006-R05" },
  async ({ page, request }) => {
    const data = credentials();
    await register(request, data);
    await browserLogin(page, data);
    const logout = shellPage(page).menu.getByRole("button", { name: "Logout" });
    await page.route("**/api/auth/logout", (route) =>
      route.fulfill({ status: 500, json: { error: "Logout unavailable" } }),
    );
    await logout.click();
    await expect(page.getByRole("alert")).toContainText("Logout failed");
    await expect(logout).toBeVisible();
    await page.unroute("**/api/auth/logout");
    await logout.click();
    await expect(page).toHaveURL(`${origin}/`);
    await expect(
      shellPage(page).menu.getByRole("link", { name: "Login", exact: true }),
    ).toBeVisible();
    await page.reload();
    await expect(logout).toHaveCount(0);
  },
);
test(
  "register and login send once, log only operations and allow correction",
  { tag: "@S0006-R06" },
  async ({ page }) => {
    const data = credentials();
    const messages: string[] = [];
    const operations: string[] = [];
    page.on("console", (message) => messages.push(message.text()));
    page.on("request", (request) => {
      if (request.url().includes("/api/auth/")) operations.push(request.url());
    });
    await page.goto(`${origin}/register`);
    const view = authPage(page, "Register");
    await view.form.field("Name").fill("   ");
    await view.form.field("Email").fill(data.email);
    await view.form.field("Password").fill(data.password);
    await view.submit.click();
    await expect(view.form.field("Name")).toHaveAccessibleDescription(/.+/);
    await view.form.field("Name").fill(data.name);
    const held = await holdRoute(page, "**/api/auth/register");
    await view.submit.evaluate((button: HTMLButtonElement) => {
      button.click();
      button.click();
    });
    await expect.poll(() => operations.filter((url) => url.endsWith("/register")).length).toBe(2);
    await held.release();
    await expect(view.alert).toContainText("Registration complete");
    await shellPage(page).menu.getByRole("link", { name: "Login", exact: true }).click();
    await fillLogin(page, data);
    const loginHeld = await holdRoute(page, "**/api/auth/login");
    await authPage(page, "Login").submit.evaluate((button: HTMLButtonElement) => {
      button.click();
      button.click();
    });
    await expect.poll(() => operations.filter((url) => url.endsWith("/login")).length).toBe(1);
    await loginHeld.release();
    await expect(
      shellPage(page).menu.getByRole("link", { name: data.name, exact: true }),
    ).toBeVisible();
    expect(operations.filter((url) => url.endsWith("/login"))).toHaveLength(1);
    expect(messages.filter((line) => line === "AUTH register")).toHaveLength(2);
    expect(messages.filter((line) => line === "AUTH login")).toHaveLength(1);
    expect(messages.join(" ")).not.toContain(data.password);
    expect(messages.join(" ")).not.toContain(data.email);
  },
);
for (const failure of ["unauthorized", "network"]) {
  test(`logout handles ${failure}`, { tag: "@S0006-R05" }, async ({ page, request }) => {
    const data = credentials();
    await register(request, data);
    await browserLogin(page, data);
    const logout = shellPage(page).menu.getByRole("button", { name: "Logout" });
    await expect(logout).toBeVisible();
    await page.route("**/api/auth/logout", (route) => {
      const unauthorized = failure === "unauthorized";
      return unauthorized
        ? route.fulfill({ status: 401, json: { error: "Unauthorized" } })
        : route.abort();
    });
    await logout.click();
    const network = failure === "network";
    if (network) {
      await expect(page.getByRole("alert")).toHaveText("Logout failed");
      await expect(logout).toBeVisible();
    } else {
      await expect(logout).toHaveCount(0);
      await expect(
        shellPage(page).menu.getByRole("link", { name: "Login", exact: true }),
      ).toBeVisible();
    }
  });
}
test(
  "guard preserves the requested path, query and fragment without document reload",
  { tag: "@S0006-R08" },
  async ({ page, request }) => {
    const data = credentials();
    await register(request, data);
    await page.goto(`${origin}/users/S0006?a=1#b`);
    await expect(page).toHaveURL(/\/login/);
    await page.evaluate(() => {
      document.documentElement.dataset.navigationCheck = "same";
    });
    await fillLogin(page, data);
    await authPage(page, "Login").submit.click();
    await expect(page).toHaveURL(`${origin}/users/S0006?a=1#b`);
    expect(await page.evaluate(() => document.documentElement.dataset.navigationCheck)).toBe(
      "same",
    );
  },
);
for (const target of ["https://example.com/", "//example.com", "/no-such-page"]) {
  test(
    `login rejects unregistered return target ${target}`,
    { tag: "@S0006-R08" },
    async ({ page, request }) => {
      const data = credentials();
      await register(request, data);
      await page.goto(`${origin}/login?returnTo=${encodeURIComponent(target)}`);
      await fillLogin(page, data);
      await authPage(page, "Login").submit.click();
      await expect(page).toHaveURL(`${origin}/`);
    },
  );
}
