import { formatDate, formatTime } from "#shared/values/dates/dates.format.ts";
import type { LogLevel } from "#shared/logging/logger.contract.ts";
export type LogEvent = { time: Date; source: string; level: LogLevel; message: string };
export type LogLine = { day: string; text: string };
export const priorities: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };
export function formatLine(event: LogEvent): LogLine {
  const message = event.message.replace(/[\r\n]+/g, " | ");
  return {
    day: formatDate(event.time),
    text: `${formatTime(event.time)} ${event.source} ${event.level.toUpperCase()} ${message}`,
  };
}
