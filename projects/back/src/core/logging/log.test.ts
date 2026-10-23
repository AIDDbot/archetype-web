import { expect, test, vi } from "vite-plus/test";
import { createLogger } from "./log.create.ts";
import { formatLine } from "./log.format.ts";
import { loggingSettings } from "./log.settings.ts";
import { fileWriter } from "./log.file.ts";
test("formats local time and replaces line breaks", () => {
  expect(
    formatLine({
      time: new Date(2026, 0, 2, 3, 4, 5, 6),
      source: "back",
      level: "warn",
      message: "one\r\ntwo",
    }),
  ).toEqual({ day: "2026-01-02", text: "03:04:05.006 back WARN one | two" });
});
test("filters, changes daily files, drains and recovers from a write failure", async () => {
  const append = vi
    .fn<(path: string, line: string) => Promise<void>>()
    .mockRejectedValueOnce(new Error("disk"))
    .mockResolvedValue(undefined);
  const stderr = vi.fn<(line: string) => void>();
  const clock = vi
    .fn<() => Date>()
    .mockReturnValueOnce(new Date(2026, 0, 1, 23, 59))
    .mockReturnValue(new Date(2026, 0, 2));
  const logger = createLogger({
    source: "back",
    level: "info",
    services: { append, stderr, clock },
  });
  logger.write("debug", "hidden");
  logger.write("info", "first");
  logger.write("error", "second");
  logger.write("warn", "third");
  await logger.stop();
  expect(append).toHaveBeenCalledTimes(3);
  expect(append.mock.calls[0]?.[0]).toBe("2026-01-01");
  expect(append.mock.calls[1]?.[0]).toBe("2026-01-02");
  expect(stderr).toHaveBeenCalledTimes(3);
});
test("uses definitions before startup and disables an invalid directory", async () => {
  expect(loggingSettings({ environment: {}, directory: "/project" }).level).toBe("info");
  const settings = loggingSettings({
    environment: { LOG_DIR: "", LOG_LEVEL: "bad" },
    directory: "/project",
  });
  expect(settings).toEqual({ directory: undefined, level: "info" });
  const append = vi.fn<(path: string, line: string) => Promise<void>>();
  const stderr = vi.fn<(line: string) => void>();
  await fileWriter(settings, { append, stderr })("day", "line");
  expect(stderr).toHaveBeenCalledWith("line");
  expect(append).not.toHaveBeenCalled();
  await fileWriter({ directory: "/logs", level: "info" }, { append, stderr })("day", "line");
  expect(append).toHaveBeenCalledWith("/logs/day.log", "line\n");
});
