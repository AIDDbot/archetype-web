import { resolve } from "node:path";
import { definitions } from "./settings.definitions.ts";
import { readSetting } from "./settings.read.ts";
import type { Environment } from "./settings.read.ts";
import type { LogLevel } from "./settings.parse.ts";
export type Settings = {
  sessionTtlHours: number;
  port: number;
  host: string;
  database: string;
  origin: string;
  logDirectory: string;
  logLevel: LogLevel;
  bodyLimit: number;
};
export type SettingsInput = { environment: Environment; directory: string };
export function loadSettings(input: SettingsInput): Settings {
  const read = <T>(definition: import("./settings.read.ts").Setting<T>): T =>
    readSetting(input.environment, definition);
  return {
    sessionTtlHours: read(definitions.sessionTtlHours),
    port: read(definitions.port),
    host: read(definitions.host),
    database: resolve(input.directory, read(definitions.database)),
    origin: read(definitions.origin),
    logDirectory: resolve(input.directory, read(definitions.logDirectory)),
    logLevel: read(definitions.logLevel),
    bodyLimit: read(definitions.bodyLimit),
  };
}
