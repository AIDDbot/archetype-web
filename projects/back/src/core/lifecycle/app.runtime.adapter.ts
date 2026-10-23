import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import type { Express } from "express";
import type { Settings } from "#core/settings/settings.load.ts";
import { openDatabase } from "#core/database/database.adapter.ts";
import { openLogger } from "#core/logging/log.adapter.ts";
import type { BootServices } from "./app.boot.ts";
import { passwords, tokens } from "#core/session/session.adapter.ts";
function listen(app: Express, settings: Settings): Promise<() => Promise<void>> {
  return new Promise((resolve, reject) => {
    const server = app.listen(settings.port, settings.host, () => {
      resolve(() => new Promise<void>((finish) => server.close(() => finish())));
    });
    server.once("error", reject);
  });
}
function onStop(stop: () => Promise<void>): void {
  const handle = (): void => {
    void stop();
  };
  process.once("SIGINT", handle);
  process.once("SIGTERM", handle);
}
export function runtime(): BootServices {
  const input = {
    environment: process.env,
    directory: fileURLToPath(new URL("../../../", import.meta.url)),
  };
  return {
    passwords,
    tokens,
    input,
    logger: openLogger(input),
    database: openDatabase,
    listen,
    onStop,
    fail: (): void => {
      process.exitCode = 1;
    },
    console: (line: string): void => {
      console.log(line);
    },
    clock: () => new Date(),
    milliseconds: () => performance.now(),
    generate: randomUUID,
  };
}
