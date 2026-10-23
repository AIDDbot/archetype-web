import { expect, test, vi } from "vite-plus/test";
import type { Mock } from "vite-plus/test";
import type { HttpRequest as Request, HttpResponse as Response } from "./http.contract.ts";
import { securityMiddleware } from "./security.middleware.ts";
import { identifierMiddleware, requestIdentifier } from "./identifier.middleware.ts";
import { corsMiddleware } from "./cors.middleware.ts";
import { requestMiddleware } from "./request.middleware.ts";
import { errorAnswer, errorMiddleware } from "./error.middleware.ts";
import { bodyMiddleware } from "./body.middleware.ts";
import { ExpectedError } from "#shared/expected.error.ts";
import type { Logger } from "#shared/logging/logger.contract.ts";
type FakeResponse = {
  value: Response;
  set: Mock<(...args: unknown[]) => unknown>;
  vary: Mock<(...args: unknown[]) => unknown>;
  status: Mock<(...args: unknown[]) => Response>;
  json: Mock<(...args: unknown[]) => unknown>;
  end: Mock<(...args: unknown[]) => unknown>;
  once: Mock<(...args: unknown[]) => unknown>;
  statusCode: number;
};
function response(): FakeResponse {
  const result = {
    set: vi.fn<(...args: unknown[]) => unknown>(),
    vary: vi.fn<(...args: unknown[]) => unknown>(),
    status: vi.fn<(...args: unknown[]) => Response>(),
    json: vi.fn<(...args: unknown[]) => unknown>(),
    end: vi.fn<(...args: unknown[]) => unknown>(),
    once: vi.fn<(...args: unknown[]) => unknown>(),
    statusCode: 200,
  };
  result.status.mockReturnValue(result);
  return { ...result, value: result };
}
function logger(): Logger {
  return { write: vi.fn<Logger["write"]>(), stop: vi.fn<Logger["stop"]>() };
}
test("adds security and safe request identifiers", () => {
  const output = response();
  const next = vi.fn<(...args: unknown[]) => unknown>();
  securityMiddleware({ method: "GET", originalUrl: "/", headers: {} }, output.value, next);
  expect(output.set).toHaveBeenCalledWith({
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
  });
  for (const value of ["a", "x".repeat(128), "a-Z-19"])
    expect(requestIdentifier(value, () => "new")).toBe(value);
  for (const value of ["", "x".repeat(129), "bad id", ["a"], undefined])
    expect(requestIdentifier(value, () => "new")).toBe("new");
  identifierMiddleware(() => "generated")(
    { method: "GET", originalUrl: "/", headers: {} },
    output.value,
    next,
  );
  expect(output.set).toHaveBeenCalledWith("X-Request-Id", "generated");
  expect(next).toHaveBeenCalledTimes(2);
});
test("handles wildcard, allowed and refused origins and preflight", () => {
  const output = response();
  const next = vi.fn<(...args: unknown[]) => unknown>();
  corsMiddleware("*")({ headers: {}, method: "GET", originalUrl: "/" }, output.value, next);
  expect(output.set).toHaveBeenCalledWith("Access-Control-Allow-Origin", "*");
  corsMiddleware("https://allowed.com")(
    { headers: { origin: "https://allowed.com" }, method: "GET", originalUrl: "/" },
    output.value,
    next,
  );
  expect(output.set).toHaveBeenCalledWith("Access-Control-Allow-Origin", "https://allowed.com");
  corsMiddleware("https://allowed.com")(
    {
      headers: { origin: "https://other.com", "access-control-request-method": "POST" },
      originalUrl: "/",
      method: "OPTIONS",
    },
    output.value,
    next,
  );
  expect(output.status).toHaveBeenCalledWith(204);
  expect(output.end).toHaveBeenCalled();
  expect(output.set).toHaveBeenCalledWith({
    "Access-Control-Allow-Methods": "GET, HEAD, PUT, PATCH, POST, DELETE",
    "Access-Control-Allow-Headers": "Content-Type, X-Request-Id, Authorization",
  });
  expect(next).toHaveBeenCalledTimes(2);
});
test("logs full original paths and levels without query values", () => {
  for (const [status, level] of [
    [200, "info"],
    [400, "warn"],
    [500, "error"],
  ] as const) {
    const output = response();
    const log = logger();
    const clock = vi.fn<() => number>().mockReturnValueOnce(10).mockReturnValue(22.2);
    const request: Request = { originalUrl: "/api/path?token=secret", method: "GET", headers: {} };
    Object.assign(output.value, {
      statusCode: status,
      once: (_event: string, done: () => void): void => {
        done();
      },
    });
    requestMiddleware({ logger: log, clock })(
      request,
      output.value,
      vi.fn<(...args: unknown[]) => unknown>(),
    );
    expect(log.write).toHaveBeenCalledWith(level, `GET /api/path ${status} 12ms`);
  }
});
test("maps expected errors, malformed and oversized bodies and hides causes", () => {
  const log = logger();
  for (const [kind, status] of [
    ["rule", 400],
    ["usage", 400],
    ["unavailable", 503],
    ["unauthorized", 401],
    ["conflict", 409],
    ["missing", 404],
  ] as const) {
    expect(
      errorAnswer(new ExpectedError({ kind, message: "Safe", fields: { name: "required" } }), log),
    ).toEqual({ status, body: { error: "Safe", fields: { name: "required" } } });
  }
  expect(
    errorAnswer(new ExpectedError({ kind: "rule", message: "Safe" }), log).body.fields,
  ).toBeUndefined();
  expect(errorAnswer({ type: "entity.too.large" }, log).status).toBe(413);
  expect(errorAnswer(new SyntaxError("form value"), log).status).toBe(400);
  expect(errorAnswer(new Error("secret"), log).status).toBe(500);
  expect(errorAnswer("secret", log).status).toBe(500);
  expect(log.write).toHaveBeenCalledWith("error", "Request failed: Error");
  const output = response();
  errorMiddleware(log)(
    new Error("secret"),
    { method: "GET", originalUrl: "/", headers: {} },
    output.value,
    vi.fn<(...args: unknown[]) => unknown>(),
  );
  expect(output.status).toHaveBeenCalledWith(500);
  expect(output.json).toHaveBeenCalledWith({
    error: "Internal server error",
  });
  expect(bodyMiddleware(100)).toBeTypeOf("function");
});
