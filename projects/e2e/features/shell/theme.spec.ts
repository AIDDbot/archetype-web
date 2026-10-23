import { test, expect } from "@playwright/test";
import { contrast } from "#shared/page-objects/contrast.check.ts";
import { shellPage, homePage } from "#shared/page-objects/shell.page.ts";
for (const preference of ["light", "dark"] as const) {
  test(
    `theme follows ${preference} preference and keeps user selection`,
    { tag: "@S0003-R07" },
    async ({ browser }) => {
      const context = await browser.newContext({ colorScheme: preference });
      const page = await context.newPage();
      await page.goto("http://localhost:4000");
      await expect(page.locator("html")).toHaveAttribute("data-theme", preference);
      const home = homePage(page);
      const shell = shellPage(page);
      for (const text of [shell.header.locator("strong"), shell.home, home.name, home.description])
        expect(await contrast(text)).toBeGreaterThanOrEqual(4.5);
      await shell.theme.click();
      const light = preference === "light";
      const selected = light ? "dark" : "light";
      await expect(page.locator("html")).toHaveAttribute("data-theme", selected);
      await page.reload();
      await expect(page.locator("html")).toHaveAttribute("data-theme", selected);
      await context.close();
    },
  );
}
