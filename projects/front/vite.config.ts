import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite-plus";
import { fileURLToPath } from "node:url";
import { loadSettings } from "./src/core/settings/settings.load.ts";
import { runtimeConfigPlugin } from "./src/core/http/runtime-config.adapter.ts";

export default defineConfig(({ mode }) => {
  const settings = loadSettings({
    reader: (environmentMode, directory) => loadEnv(environmentMode, directory, ""),
    mode,
    directory: fileURLToPath(new URL(".", import.meta.url)),
  });
  return {
    plugins: [react(), runtimeConfigPlugin(settings)],
    server: { host: true, strictPort: true, port: settings.port },
    preview: { host: true, strictPort: true, port: settings.port },
    test: {
      name: "front",
      include: ["src/**/*.test.ts"],
      passWithNoTests: true,
      coverage: {
        include: ["src/**/*.ts"],
        exclude: ["src/**/*.test.ts", "src/app.main.ts", "src/core/**/*.adapter.ts"],
        thresholds: { lines: 100, functions: 100, perFile: true },
      },
    },
  };
});
