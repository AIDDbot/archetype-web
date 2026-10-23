import type { Logger, LogLevel } from "#shared/logging/logger.contract.ts";
import { formatLine, priorities } from "./log.format.ts";
export type LogServices = {
  clock: () => Date;
  append: (day: string, line: string) => Promise<void>;
  stderr: (line: string) => void;
};
export type LogOptions = { source: string; level: LogLevel; services: LogServices };
export function createLogger(options: LogOptions): Logger {
  let queue = Promise.resolve();
  const write = (level: LogLevel, message: string): void => {
    const filtered = priorities[level] < priorities[options.level];
    if (filtered) return;
    const line = formatLine({
      time: options.services.clock(),
      source: options.source,
      level,
      message,
    });
    const severe = priorities[level] >= priorities.warn;
    if (severe) options.services.stderr(line.text);
    queue = queue
      .then(() => options.services.append(line.day, line.text))
      .catch(() => options.services.stderr(line.text));
  };
  return { write, stop: () => queue };
}
