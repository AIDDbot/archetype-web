import type { LogSettings } from "./log.settings.ts";
export type FileServices = {
  append: (path: string, line: string) => Promise<void>;
  stderr: (line: string) => void;
};
export function fileWriter(
  settings: LogSettings,
  services: FileServices,
): (day: string, line: string) => Promise<void> {
  return async (day: string, line: string): Promise<void> => {
    const invalid = settings.directory === undefined;
    if (invalid) {
      services.stderr(line);
      return;
    }
    await services.append(`${settings.directory}/${day}.log`, `${line}\n`);
  };
}
