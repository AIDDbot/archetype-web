import { expect, test } from "vite-plus/test";

const identity = {
  displayName: "Test app",
  description: "Test description",
  version: "1.0.0",
  author: { name: "Test author", url: "https://example.com" },
};
import { loadSettings } from "#core/settings/settings.load.ts";
import { createApp } from "./app.compose.ts";
test("composes platform before features and error handler after", () => {
  const logger = { write: (): void => {}, stop: async (): Promise<void> => {} };
  const result = createApp(
    { identity, features: [{ routes: [], migrations: [] }] },
    {
      settings: loadSettings({ environment: {}, directory: "/project" }),
      logger,
      generate: () => "id",
      clock: () => 1,
    },
  );
  expect(result.identity).toBe(identity);
  expect(result.app.router.stack[5]?.route?.path).toBe("/api");
  expect(result.app.router.stack).toHaveLength(8);
});
