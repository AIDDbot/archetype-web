import type { Page, Route } from "@playwright/test";
export type RoutePattern = string | RegExp;
export type HeldRoute = { release: () => Promise<void> };
export async function holdRoute(page: Page, pattern: RoutePattern): Promise<HeldRoute> {
  const gate = Promise.withResolvers<void>();
  const pending: Promise<void>[] = [];
  const handler = async (route: Route): Promise<void> => {
    const answer = gate.promise.then(() => route.continue());
    pending.push(answer);
    await answer;
  };
  await page.route(pattern, handler);
  return {
    release: async () => {
      gate.resolve();
      await Promise.all(pending);
      await page.unroute(pattern, handler);
    },
  };
}
async function failAnswer(route: Route): Promise<void> {
  await route.fulfill({
    status: 503,
    contentType: "application/json",
    body: JSON.stringify({ error: "Service unavailable" }),
  });
}
export async function failRoute(page: Page, pattern: RoutePattern): Promise<HeldRoute> {
  await page.route(pattern, failAnswer);
  return { release: () => page.unroute(pattern, failAnswer) };
}
