import { expect, test, vi } from "vite-plus/test";
import { createConsoleLogger } from "./log.create.ts";
import type { ConsoleWriter } from "./log.create.ts";
test("writes page and theme actions without form or query values", () => {
  const write = vi.fn<ConsoleWriter>();
  const logger = createConsoleLogger(write);
  logger.page("/account?token=private");
  logger.theme("dark");
  logger.operation("login");
  logger.page("/one\ntwo");
  expect(write.mock.calls).toEqual([
    ["PAGE /account"],
    ["THEME dark"],
    ["AUTH login"],
    ["PAGE /one | two"],
  ]);
});
