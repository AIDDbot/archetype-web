import { expect, test, vi } from "vite-plus/test";
import type { Fetch } from "#shared/http/http.contract.ts";
import { runtimeConfigMiddleware } from "./runtime-config.middleware.ts";
import { createHttpClient } from "./http.create.ts";
import { responseError } from "./http.error.ts";
test("serves runtime configuration only for its GET path", () => {
  const output = {
    setHeader: vi.fn<(name: string, value: string) => void>(),
    end: vi.fn<(body: string) => void>(),
  };
  const next = vi.fn<() => void>();
  const settings = { apiBaseUrl: "http://localhost:3000", port: 4000 };
  const middleware = runtimeConfigMiddleware(settings);
  middleware({ method: "GET", url: "/runtime-config.json" }, output, next);
  expect(output.end).toHaveBeenCalledWith('{"apiBaseUrl":"http://localhost:3000"}');
  expect(output.setHeader).toHaveBeenCalledWith("Cache-Control", "no-store");
  middleware({ method: "GET", url: "/other" }, output, next);
  middleware({ method: "POST", url: "/runtime-config.json" }, output, next);
  expect(next).toHaveBeenCalledTimes(2);
});
test("reads API address at runtime and returns data or an empty body", async () => {
  const fetch = vi
    .fn<Fetch>()
    .mockResolvedValueOnce(Response.json({ apiBaseUrl: "https://api.example.com" }))
    .mockResolvedValueOnce(Response.json({ value: 1 }));
  expect(await createHttpClient(fetch).request({ path: "/api", init: { method: "GET" } })).toEqual({
    value: 1,
  });
  expect(fetch).toHaveBeenLastCalledWith("https://api.example.com/api", { method: "GET" });
  fetch
    .mockResolvedValueOnce(Response.json({ apiBaseUrl: "https://api.example.com" }))
    .mockResolvedValueOnce(new Response(null, { status: 204 }));
  expect(await createHttpClient(fetch).request({ path: "/api" })).toBeUndefined();
});
test("changes failed API responses into the expected error with fields", async () => {
  const fetch = vi
    .fn<Fetch>()
    .mockResolvedValueOnce(Response.json({ apiBaseUrl: "http://localhost" }))
    .mockResolvedValueOnce(
      Response.json({ error: "Invalid", fields: { email: "required" } }, { status: 400 }),
    );
  await expect(createHttpClient(fetch).request({ path: "/api" })).rejects.toMatchObject({
    kind: "rule",
    message: "Invalid",
    fields: { email: "required" },
  });
  for (const response of [
    Response.json({ apiBaseUrl: "http://localhost" }, { status: 500 }),
    Response.json(null),
  ]) {
    await expect(createHttpClient(async () => response).request({ path: "/api" })).rejects.toThrow(
      "Runtime configuration is unavailable",
    );
  }
});
test("checks expected error shapes and optional fields", () => {
  for (const value of [null, {}, { error: {} }, { error: 1 }])
    expect(responseError(value, 400).message).toBe("Request failed");
  for (const fields of [undefined, null, { name: 1 }])
    expect(responseError({ error: "Invalid", fields }, 400).fields).toBeUndefined();
  expect(responseError({ error: "Invalid", fields: {} }, 400).kind).toBe("rule");
  expect(responseError({ error: "Retry", fields: { name: "required" } }, 503).fields).toEqual({
    name: "required",
  });
  expect(responseError({ error: "Retry" }, 503).kind).toBe("unavailable");
});

test("adds a bearer token without losing request headers", async () => {
  const calls: RequestInit[] = [];
  const client = createHttpClient(
    async (url, init) => {
      const configuration = url === "/runtime-config.json";
      if (configuration)
        return new Response(JSON.stringify({ apiBaseUrl: "http://localhost:3000" }));
      const hasInit = init !== undefined;
      if (hasInit) calls.push(init);
      return new Response(null, { status: 204 });
    },
    () => "secret",
  );
  await client.request({
    path: "/api/auth/logout",
    init: { headers: { "Content-Type": "application/json" } },
  });
  const headers = new Headers(calls[0]?.headers);
  expect(headers.get("Authorization")).toBe("Bearer secret");
  expect(headers.get("Content-Type")).toBe("application/json");
  await client.request({ path: "/api/auth/me" });
});
