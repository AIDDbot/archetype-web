import { isMissing } from "#shared/values/values.check.ts";
export type Environment = Readonly<Record<string, string | undefined>>;
export type Setting<T> = {
  name: string;
  fallback: string;
  parse: (value: unknown, field: string) => T;
};
export function readSetting<T>(environment: Environment, setting: Setting<T>): T {
  const value = environment[setting.name];
  return setting.parse(isMissing(value) ? setting.fallback : value, setting.name);
}
