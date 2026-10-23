import { appendFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { createLogger } from "./log.create.ts";
import { fileWriter } from "./log.file.ts";
import { loggingSettings } from "./log.settings.ts";
import type { SettingsInput } from "#core/settings/settings.load.ts";
import type { Logger } from "#shared/logging/logger.contract.ts";
async function append(path: string, line: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await appendFile(path, line);
}
function stderr(line: string): void {
  process.stderr.write(`${line}\n`);
}
export function openLogger(input: SettingsInput): Logger {
  const settings = loggingSettings(input);
  return createLogger({
    source: "back",
    level: settings.level,
    services: { clock: () => new Date(), append: fileWriter(settings, { append, stderr }), stderr },
  });
}
