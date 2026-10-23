import { expect, test, vi } from "vite-plus/test";
import { loadSettings, parseApiUrl } from "./settings.load.ts";
import type { EnvironmentReader } from "./settings.load.ts";
test("loads defaults and environment file values through the injected Vite reader", () => {
  expect(loadSettings({ reader: () => ({}), mode: "development", directory: "/front" })).toEqual({
    port: 4000,
    apiBaseUrl: "http://localhost:3000",
  });
  const reader = vi
    .fn<EnvironmentReader>()
    .mockReturnValue({ PORT: "4100", API_BASE_URL: "https://api.example.com" });
  expect(loadSettings({ reader, mode: "development", directory: "/front" })).toEqual({
    port: 4100,
    apiBaseUrl: "https://api.example.com",
  });
  expect(reader).toHaveBeenCalledWith("development", "/front");
});
test("checks each port boundary and URL scheme", () => {
  for (const port of ["1", "65535"])
    expect(
      loadSettings({ reader: () => ({ PORT: port }), mode: "test", directory: "/front" }).port,
    ).toBe(Number(port));
  for (const port of ["0", "65536", "1.5", "", "abc"])
    expect(() =>
      loadSettings({ reader: () => ({ PORT: port }), mode: "test", directory: "/front" }),
    ).toThrow("PORT");
  for (const url of ["", "relative", "ftp://api.example.com"])
    expect(() => parseApiUrl(url)).toThrow("API_BASE_URL");
  expect(parseApiUrl("http://localhost:3000")).toBe("http://localhost:3000");
  expect(parseApiUrl("https://api.example.com")).toBe("https://api.example.com");
});

test("bounds the API URL length", () => {
  const limit = "http://a/" + "a".repeat(4087);
  expect(parseApiUrl(limit)).toBe(limit);
  expect(() => parseApiUrl(limit + "a")).toThrow("API_BASE_URL");
  expect(() => parseApiUrl("a")).toThrow("API_BASE_URL");
});
