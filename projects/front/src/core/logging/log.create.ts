import type { ConsoleLogger } from "#shared/logging/logger.contract.ts";
export type ConsoleWriter = (line: string) => void;
function safe(value: string): string {
  return value.replace(/[\r\n]+/g, " | ").replace(/\?.*$/, "");
}
export function createConsoleLogger(write: ConsoleWriter): ConsoleLogger {
  return {
    operation: (name: string): void => write(`AUTH ${safe(name)}`),
    page: (path: string): void => write(`PAGE ${safe(path)}`),
    theme: (theme: string): void => write(`THEME ${safe(theme)}`),
  };
}
