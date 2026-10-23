import { expect, test } from "@playwright/test";
import { aboutPage, aboutCard } from "./about.page.ts";
import { holdRoute, failRoute } from "#shared/page-objects/routes.page.ts";
import { readTable } from "#shared/page-objects/records.page.ts";
const origin = "http://localhost:4000";
test(
  "public API returns identity and technology for every project",
  { tag: "@S0005-R01" },
  async ({ request }) => {
    const response = await request.get("http://localhost:3000/api/about");
    expect(response.status()).toBe(200);
    const answer: unknown = await response.json();
    expect(answer).toMatchObject({
      name: "Archetype Web",
      description: "A web application with its API, its browser screens and its acceptance suite",
      version: expect.any(String),
      author: { name: "Alberto Basalo", url: "https://x.com/albertobasalo" },
      projects: [
        {
          name: "back",
          type: "api",
          technologies: expect.arrayContaining([
            "TypeScript",
            "Node.js",
            "Express",
            "SQLite",
            "Vitest",
          ]),
        },
        {
          name: "front",
          type: "web",
          technologies: expect.arrayContaining([
            "TypeScript",
            "React",
            "Vite",
            "react-router",
            "Pico CSS",
            "Vitest",
          ]),
        },
        {
          name: "e2e",
          type: "e2e",
          technologies: expect.arrayContaining(["TypeScript", "Playwright", "Chromium"]),
        },
      ],
    });
  },
);
test(
  "menu opens record detail and contained technology table at mobile width",
  { tag: "@S0005-R02" },
  async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(origin);
    const view = aboutPage(page);
    await view.shell.menu.getByRole("link", { name: "About", exact: true }).click();
    await expect(view.title).toHaveText("Archetype Web");
    await expect(
      view.main.getByRole("heading", { name: "Application", exact: true }),
    ).toBeVisible();
    await expect(view.main.getByRole("term")).toHaveText([
      "Description",
      "Version",
      "Author",
      "Website",
    ]);
    await expect(view.main.getByRole("definition")).toContainText([
      "A web application with its API, its browser screens and its acceptance suite",
      "0.",
      "Alberto Basalo",
      "https://x.com/albertobasalo",
    ]);
    const website = view.main.getByRole("link", { name: "https://x.com/albertobasalo" });
    await expect(website).toHaveAttribute("target", "_blank");
    await expect(website).toHaveAttribute("rel", "noopener noreferrer");
    await expect(view.table.getByRole("row")).toHaveCount(4);
    const table = await readTable(view.table);
    expect(table.columns).toEqual(["Project", "Type", "Technologies"]);
    expect(table.rows.map((row) => row.slice(0, 2))).toEqual([
      ["back", "api"],
      ["front", "web"],
      ["e2e", "e2e"],
    ]);
    expect(table.rows[0]?.[2]).toContain("Express");
    expect(table.rows[1]?.[2]).toContain("React");
    expect(table.rows[2]?.[2]).toContain("Playwright");
    expect(
      await view.table.evaluate((element) => {
        const area = element.parentElement;
        return (
          area !== null &&
          area.scrollWidth > area.clientWidth &&
          getComputedStyle(area).overflowX === "auto"
        );
      }),
    ).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  },
);
test(
  "home shows version and record card with client navigation on mobile",
  { tag: "@S0005-R03" },
  async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(origin);
    const view = aboutCard(page);
    await expect(view.card.getByRole("definition")).toHaveCount(2);
    const facts = await view.card.getByRole("definition").allTextContents();
    await expect(view.card.getByRole("heading")).toHaveText("About");
    await expect(view.card.getByRole("term")).toHaveText(["Application", "Version"]);
    expect(facts[0]).toBe("Archetype Web");
    const version = facts[1];
    expect(version).toBeTruthy();
    await expect(page.getByRole("main").locator("header").first()).toContainText(
      `Version ${version}`,
    );
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    const cards = await page.getByLabel("Application cards").getByRole("article").all();
    const positions = await Promise.all(cards.map((card) => card.boundingBox()));
    expect(new Set(positions.map((box) => box?.x)).size).toBe(1);
    await page.evaluate(() => {
      document.documentElement.dataset.navigationCheck = "same";
    });
    await view.link.click();
    await expect(page).toHaveURL(`${origin}/about`);
    expect(await page.evaluate(() => document.documentElement.dataset.navigationCheck)).toBe(
      "same",
    );
  },
);
for (const path of ["/about", "/"]) {
  test(
    `loading and unavailable retain navigation and title on ${path}`,
    { tag: "@S0005-R04" },
    async ({ page }) => {
      const isHome = path === "/";
      const held = await holdRoute(page, "**/api/about");
      await page.goto(`${origin}${path}`);
      const view = aboutPage(page);
      await expect(view.main.getByRole("status")).toHaveAttribute("aria-busy", "true");
      await expect(view.main.getByRole("definition")).toHaveCount(0);
      await expect(view.main.getByRole("heading").first()).toBeVisible();
      await expect(view.shell.menu).toBeVisible();
      if (isHome) await expect(aboutCard(page).link).toBeVisible();
      await held.release();
      await expect(view.main.getByRole("definition").first()).toBeVisible();
      const failed = await failRoute(page, "**/api/about");
      await page.reload();
      await expect(view.main.getByRole("alert")).toHaveText("About unavailable");
      await expect(view.main.getByRole("definition")).toHaveCount(0);
      await expect(view.main.getByRole("heading").first()).toBeVisible();
      await expect(view.shell.menu).toBeVisible();
      if (isHome) await expect(aboutCard(page).link).toBeVisible();
      await failed.release();
    },
  );
}
