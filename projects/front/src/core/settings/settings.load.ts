import { parseInteger } from "#shared/values/numbers/numbers.parse.ts";
import { requireLength } from "#shared/values/text/text.parse.ts";
import { isMissing } from "#shared/values/values.check.ts";
import { ruleError } from "#shared/expected.error.ts";
export type Environment = Readonly<Record<string, string | undefined>>;
export type EnvironmentReader = (mode: string, directory: string) => Environment;
export type SettingsInput = { reader: EnvironmentReader; mode: string; directory: string };
export type Settings = { port: number; apiBaseUrl: string };
export const defaults = { PORT: "4000", API_BASE_URL: "http://localhost:3000" };
function readSetting(environment: Environment, name: keyof typeof defaults): string {
  const value = environment[name];
  return isMissing(value) ? defaults[name] : value;
}
export function parseApiUrl(value: unknown): string {
  const text = requireLength(value, { field: "API_BASE_URL", min: 1, max: 4096 });
  const url = URL.parse(text);
  const valid = url?.protocol === "http:" || url?.protocol === "https:";
  if (!valid) throw ruleError("API_BASE_URL", "needs an absolute HTTP or HTTPS URL");
  return text;
}
export function loadSettings(input: SettingsInput): Settings {
  const environment = input.reader(input.mode, input.directory);
  return {
    port: parseInteger(readSetting(environment, "PORT"), { field: "PORT", min: 1, max: 65535 }),
    apiBaseUrl: parseApiUrl(readSetting(environment, "API_BASE_URL")),
  };
}
