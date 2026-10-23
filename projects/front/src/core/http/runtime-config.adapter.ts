import type { Plugin } from "vite-plus";
import type { RuntimeConfig } from "#shared/http/http.contract.ts";
import { runtimeConfigMiddleware } from "./runtime-config.middleware.ts";
export function runtimeConfigPlugin(config: RuntimeConfig): Plugin {
  const middleware = runtimeConfigMiddleware(config);
  return {
    name: "runtime-config",
    configureServer(server): void {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server): void {
      server.middlewares.use(middleware);
    },
  };
}
