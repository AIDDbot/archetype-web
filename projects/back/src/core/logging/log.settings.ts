import { resolve } from "node:path";
import { definitions } from "#core/settings/settings.definitions.ts";
import { readSetting } from "#core/settings/settings.read.ts";
import type { SettingsInput } from "#core/settings/settings.load.ts";
import type { LogLevel } from "#shared/logging/logger.contract.ts";
export type LogSettings = { directory: string | undefined; level: LogLevel };
function logDirectory(input: SettingsInput): string | undefined {
  try {
    return resolve(input.directory, readSetting(input.environment, definitions.logDirectory));
  } catch {
    return undefined;
  }
}
function logLevel(input: SettingsInput): LogLevel {
  try {
    return readSetting(input.environment, definitions.logLevel);
  } catch {
    return definitions.logLevel.parse(definitions.logLevel.fallback, definitions.logLevel.name);
  }
}
export function loggingSettings(input: SettingsInput): LogSettings {
  return { directory: logDirectory(input), level: logLevel(input) };
}
