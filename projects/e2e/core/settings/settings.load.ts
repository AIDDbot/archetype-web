import { requireLength } from "#shared/values/text/text.parse.ts";
import { resolve } from "node:path";
import { parseInteger } from "#shared/values/numbers/numbers.parse.ts";
import { isMissing } from "#shared/values/values.check.ts";
export type Environment = Readonly<Record<string, string | undefined>>;
export type SettingsInput = { environment: Environment; directory: string };
export type ProjectSettings = { directory: string; start: string };
export type Settings = { back: ProjectSettings; front: ProjectSettings; startupTimeout: number };
export const defaults = {
  BACK_DIRECTORY: "../back",
  FRONT_DIRECTORY: "../front",
  BACK_START: "npm start",
  FRONT_START: "npm start",
  E2E_STARTUP_TIMEOUT_MS: "30000",
};
function readSetting(environment: Environment, name: keyof typeof defaults): string {
  const raw = environment[name];
  const value = isMissing(raw) ? defaults[name] : raw;
  return requireLength(value, { field: name, min: 1, max: 4096 });
}
export function loadSettings(input: SettingsInput): Settings {
  const read = (name: keyof typeof defaults): string => readSetting(input.environment, name);
  return {
    back: {
      directory: resolve(input.directory, read("BACK_DIRECTORY")),
      start: read("BACK_START"),
    },
    front: {
      directory: resolve(input.directory, read("FRONT_DIRECTORY")),
      start: read("FRONT_START"),
    },
    startupTimeout: parseInteger(read("E2E_STARTUP_TIMEOUT_MS"), {
      field: "E2E_STARTUP_TIMEOUT_MS",
      min: 1,
      max: 600000,
    }),
  };
}
