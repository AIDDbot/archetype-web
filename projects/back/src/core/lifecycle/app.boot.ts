import type { Express } from "express";
import type { Database } from "#shared/database/database.contract.ts";
import type { Logger } from "#shared/logging/logger.contract.ts";
import type { SettingsInput, Settings } from "#core/settings/settings.load.ts";
import { loadSettings } from "#core/settings/settings.load.ts";
import { migrate } from "#core/database/database.migrate.ts";
import { ExpectedError } from "#shared/expected.error.ts";
import { createApp } from "./app.compose.ts";
import type { AppOptions } from "./app.compose.ts";
import { createStop } from "./app.stop.ts";
import { listeningAddress } from "./app.address.ts";
import { connectFeatures } from "./app.connect.ts";
import type { Passwords, Tokens } from "#shared/session/session.contract.ts";
export type BootServices = {
  passwords: Passwords;
  tokens: Tokens;
  input: SettingsInput;
  logger: Logger;
  database: (path: string) => Database;
  listen: (app: Express, settings: Settings) => Promise<() => Promise<void>>;
  onStop: (stop: () => Promise<void>) => void;
  fail: () => void;
  console: (line: string) => void;
  clock: () => Date;
  milliseconds: () => number;
  generate: () => string;
};
async function launch(options: AppOptions, services: BootServices): Promise<void> {
  const settings = loadSettings(services.input);
  const database = services.database(settings.database);
  try {
    migrate({
      database,
      migrations: options.features.flatMap((feature) => feature.migrations),
      clock: services.clock,
    });
    connectFeatures(options.features, {
      database,
      passwords: services.passwords,
      tokens: services.tokens,
      clock: services.clock,
      generate: services.generate,
      sessionTtlHours: settings.sessionTtlHours,
    });
    const composition = createApp(options, {
      settings,
      logger: services.logger,
      generate: services.generate,
      clock: services.milliseconds,
    });
    const closeServer = await services.listen(composition.app, settings);
    services.onStop(
      createStop({ closeServer, logger: services.logger, closeDatabase: () => database.close() }),
    );
    services.console(listeningAddress(settings));
  } catch (error) {
    database.close();
    throw error;
  }
}
export async function boot(options: AppOptions, services: BootServices): Promise<void> {
  try {
    await launch(options, services);
  } catch (error) {
    const expected = error instanceof ExpectedError;
    const message = expected ? error.message : "Startup failed";
    services.logger.write("error", message);
    await services.logger.stop();
    services.fail();
  }
}
