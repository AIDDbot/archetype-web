import { defineConfig, devices } from "@playwright/test";
import { fileURLToPath } from "node:url";
import { loadSettings } from "./core/settings/settings.load.ts";

const settings = loadSettings({
  environment: process.env,
  directory: fileURLToPath(new URL(".", import.meta.url)),
});
const chromium = devices["Desktop Chrome"];

export default defineConfig({
  testDir: "./features",
  fullyParallel: true,
  webServer: [
    {
      command: settings.back.start,
      cwd: settings.back.directory,
      port: 3000,
      timeout: settings.startupTimeout,
    },
    {
      command: settings.front.start,
      cwd: settings.front.directory,
      url: "http://localhost:4000",
      timeout: settings.startupTimeout,
    },
  ],
  projects: [{ name: "chromium", use: chromium }],
});
