import { expect, test } from "vite-plus/test";
import { loadSettings } from "./settings.load.ts";
import { readSetting } from "./settings.read.ts";
import { definitions } from "./settings.definitions.ts";
import { parsePort, parseBodyLimit, parseLevel, parseOrigin } from "./settings.parse.ts";
import { parseSessionTtl } from "./settings.parse.ts";
test("loads defaults and resolves paths from the project", () => {
  const settings = loadSettings({ environment: {}, directory: "/project" });
  expect(settings.port).toBe(3000);
  expect(settings.host).toBe("0.0.0.0");
  expect(settings.database).toContain("project");
  expect(settings.logDirectory).toContain("logs");
  expect(settings.origin).toBe("*");
  expect(settings.logLevel).toBe("info");
  expect(settings.bodyLimit).toBe(100);
  expect(settings.sessionTtlHours).toBe(24);
  expect(readSetting({ PORT: "4001" }, definitions.port)).toBe(4001);
});
test("checks each integer limit and invalid value", () => {
  for (const [parse, max] of [
    [parsePort, 65535],
    [parseBodyLimit, 10240],
    [parseSessionTtl, 720],
  ] as const) {
    expect(parse("1", "VALUE")).toBe(1);
    expect(parse(String(max), "VALUE")).toBe(max);
    for (const value of ["0", "-1", String(max + 1), "1.5", "", "abc", undefined]) {
      expect(() => parse(value, "VALUE")).toThrow("VALUE");
    }
  }
});
test("checks paths, host, log levels and origins", () => {
  for (const name of ["DATABASE_URL", "LOG_DIR", "HOST"]) {
    expect(() => loadSettings({ environment: { [name]: " " }, directory: "/project" })).toThrow(
      name,
    );
  }
  for (const level of ["debug", "info", "warn", "error"])
    expect(parseLevel(level, "LOG_LEVEL")).toBe(level);
  for (const value of ["", "trace", undefined])
    expect(() => parseLevel(value, "LOG_LEVEL")).toThrow("LOG_LEVEL");
  expect(parseOrigin("*", "CORS_ORIGIN")).toBe("*");
  expect(parseOrigin("http://localhost:4000, https://example.com", "CORS_ORIGIN")).toContain(
    "https",
  );
  for (const value of ["", "ftp://example.com", "http://example.com/path", "wrong"]) {
    expect(() => parseOrigin(value, "CORS_ORIGIN")).toThrow("CORS_ORIGIN");
  }
});

test("bounds host, paths and origin list lengths", () => {
  for (const [name, max] of [
    ["HOST", 253],
    ["DATABASE_URL", 4096],
    ["LOG_DIR", 4096],
  ] as const) {
    for (const count of [1, max])
      expect(() =>
        loadSettings({ environment: { [name]: "a".repeat(count) }, directory: "/project" }),
      ).not.toThrow();
    for (const count of [0, max + 1])
      expect(() =>
        loadSettings({ environment: { [name]: "a".repeat(count) }, directory: "/project" }),
      ).toThrow(name);
  }
  expect(parseOrigin("*", "CORS_ORIGIN")).toBe("*");
  const limit = "http://" + "a".repeat(4089);
  expect(parseOrigin(limit, "CORS_ORIGIN")).toBe(limit);
  expect(() => parseOrigin(limit + "a", "CORS_ORIGIN")).toThrow("CORS_ORIGIN");
});
