import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { shellPage, homePage, notFoundPage } from "#shared/page-objects/shell.page.ts";
const front = "http://localhost:4000";
const api = "http://localhost:3000/api";
test("API index has registered route descriptions", { tag: "@S0003-R01" }, async ({ request }) => {
  const response = await request.get(api);
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(Array.isArray(body.routes)).toBe(true);
  for (const route of body.routes)
    expect(route).toEqual({ method: expect.any(String), path: expect.stringMatching(/^\/api\//) });
});
test("API errors are JSON with declared status", { tag: "@S0003-R02" }, async ({ request }) => {
  const unknown = await request.get(`${api}/unknown-${crypto.randomUUID()}`);
  expect(unknown.status()).toBe(404);
  expect(await unknown.json()).toEqual({ error: "Not found" });
  const invalid = await request.post(`${api}/unknown`, {
    data: "{",
    headers: { "Content-Type": "application/json" },
  });
  expect(invalid.status()).toBe(400);
  expect(await invalid.json()).toEqual({ error: expect.any(String) });
  const large = await request.post(`${api}/unknown`, { data: { value: "x".repeat(103000) } });
  expect(large.status()).toBe(413);
  expect(await large.json()).toEqual({ error: expect.any(String) });
});
test(
  "platform headers and request logging are connected",
  { tag: "@S0003-R03" },
  async ({ request }) => {
    const identifier = `shell-${crypto.randomUUID()}`;
    const response = await request.get(api, { headers: { "X-Request-Id": identifier } });
    expect(response.headers()).toMatchObject({
      "x-request-id": identifier,
      "x-content-type-options": "nosniff",
      "x-frame-options": "DENY",
      "referrer-policy": "no-referrer",
    });
    const date = new Date().toISOString().slice(0, 10);
    const log = new URL(`../../../back/logs/${date}.log`, import.meta.url);
    await expect.poll(async () => readFile(log, "utf8")).toMatch(/GET \/api 200/);
    expect(await readFile(log, "utf8")).not.toContain(identifier);
  },
);
test(
  "home shows the application identity and card grid",
  { tag: "@S0003-R04" },
  async ({ page }) => {
    await page.goto(front);
    const home = homePage(page);
    const shell = shellPage(page);
    await expect(home.name).toHaveText(/\S/);
    await expect(home.description).toHaveText(/\S/);
    const name = await home.name.innerText();
    await expect(shell.header).toContainText(name);
    await expect(page).toHaveTitle(name);
    await expect(home.cards).toBeVisible();
    await expect(shell.menu).toBeVisible();
  },
);
test(
  "menu navigation retains the document and wraps on narrow screens",
  { tag: "@S0003-R05" },
  async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${front}/unknown-${crypto.randomUUID()}`);
    await expect(shellPage(page).home).toBeVisible();
    await page.evaluate(() => document.documentElement.setAttribute("data-test-mark", "retained"));
    await shellPage(page).home.click();
    await expect(homePage(page).name).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("data-test-mark", "retained");
    await expect(shellPage(page).home).toHaveAttribute("aria-current", "page");
    await page
      .getByRole("navigation")
      .locator("ul")
      .evaluate((list) => {
        for (let index = 0; index < 12; index++) {
          const item = document.createElement("li");
          item.innerHTML = `<a href="/extra-${index}">Extra menu ${index}</a>`;
          list.append(item);
        }
      });
    expect(
      await page.getByRole("navigation").evaluate((menu) => getComputedStyle(menu).flexWrap),
    ).toBe("wrap");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  },
);
test(
  "direct unknown address shows its path and home link",
  { tag: "@S0003-R06" },
  async ({ page }) => {
    const path = `/unknown-${crypto.randomUUID()}`;
    await page.goto(`${front}${path}`);
    const missing = notFoundPage(page, path);
    await expect(missing.title).toBeVisible();
    await expect(missing.path).toBeVisible();
    await expect(missing.home).toHaveAttribute("href", "/");
  },
);
