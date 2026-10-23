import { expect, test } from "@playwright/test";
import { checkErrorBody } from "#shared/projects/error.check.ts";
import {
  api,
  bearer,
  credentials,
  createSession,
  login,
  logout,
  register,
} from "./users.client.ts";
test(
  "registration returns only public fields and preserves the first account",
  { tag: "@S0006-R01" },
  async ({ request }) => {
    const data = { ...credentials(), name: "  Ab  ", password: "12345678" };
    const response = await register(request, { ...data, role: "admin" });
    expect(response.status()).toBe(201);
    const user = await response.json();
    expect(user).toEqual({
      id: expect.any(String),
      name: "Ab",
      email: data.email,
      role: "user",
      createdAt: expect.any(String),
    });
    expect(new Date(user.createdAt).toISOString()).toBe(user.createdAt);
    expect(
      (
        await register(request, {
          ...data,
          email: data.email.toUpperCase(),
          password: "changedPassword",
        })
      ).status(),
    ).toBe(409);
    expect((await login(request, data)).status()).toBe(200);
  },
);
const invalidInputs = [
  { name: "a", email: "a", password: "a" },
  { name: " ", email: "missing-at.example", password: "1234567" },
  { name: "a".repeat(65), email: `${"a".repeat(53)}@example.com`, password: "a".repeat(65) },
  {},
  { name: 42, email: false, password: [] },
];
test(
  "registration accepts all upper length boundaries",
  { tag: "@S0006-R01" },
  async ({ request }) => {
    const unique = credentials().email.split("@")[0];
    const data = {
      name: "N".repeat(64),
      email: `${unique}${"x".repeat(16)}@example.com`,
      password: "P".repeat(64),
    };
    expect(data.email).toHaveLength(64);
    expect((await register(request, data)).status()).toBe(201);
    expect((await login(request, data)).status()).toBe(200);
  },
);
for (const [index, data] of invalidInputs.entries()) {
  test(
    `invalid registration fields ${index} create no account`,
    { tag: "@S0006-R01" },
    async ({ request }) => {
      const response = await register(request, data);
      expect(response.status()).toBe(400);
      const body = checkErrorBody(await response.json());
      expect(Object.keys(body.fields ?? {}).toSorted()).toEqual(["email", "name", "password"]);
      expect((await login(request, data)).status()).not.toBe(200);
    },
  );
}
test(
  "valid credentials return an opaque token and invalid credentials share a response",
  { tag: "@S0006-R02" },
  async ({ request }) => {
    const data = credentials();
    const session = await createSession(request, data);
    expect(session.token.length).toBeGreaterThan(0);
    expect(session.token).not.toContain(data.password);
    expect(session.user.email).toBe(data.email);
    const wrong = await login(request, { ...data, password: "wrongPassword" });
    const unknown = await login(request, credentials());
    expect(wrong.status()).toBe(401);
    expect(unknown.status()).toBe(401);
    expect(await wrong.json()).toEqual({ error: "Invalid credentials" });
    expect(await unknown.json()).toEqual(await wrong.json());
  },
);
test(
  "protected endpoints require a valid bearer session",
  { tag: "@S0006-R03" },
  async ({ request }) => {
    const session = await createSession(request, credentials());
    const response = await request.get(`${api}/auth/me`, { headers: bearer(session.token) });
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(session.user);
    for (const token of ["", "invalid-token"]) {
      const options = { headers: bearer(token) };
      const results = await Promise.all([
        request.get(`${api}/auth/me`, options),
        request.get(`${api}/users/${session.user.id}`, options),
        request.post(`${api}/auth/logout`, options),
      ]);
      for (const result of results) {
        expect(result.status()).toBe(401);
        expect(Object.keys(checkErrorBody(await result.json()))).toEqual(["error"]);
      }
    }
  },
);
test(
  "own account is public data and other identifiers are not found",
  { tag: "@S0006-R04" },
  async ({ request }) => {
    const session = await createSession(request, credentials());
    const other = await createSession(request, credentials());
    const headers = bearer(session.token);
    const own = await request.get(`${api}/users/${session.user.id}`, { headers });
    expect(own.status()).toBe(200);
    expect(await own.json()).toEqual({
      name: session.user.name,
      email: session.user.email,
      createdAt: session.user.createdAt,
    });
    for (const id of [other.user.id, "no-such-user"]) {
      const response = await request.get(`${api}/users/${id}`, { headers });
      expect(response.status()).toBe(404);
      expect(await response.json()).toEqual({ error: "Not found" });
    }
  },
);
test("logout invalidates only the selected session", { tag: "@S0006-R05" }, async ({ request }) => {
  const data = credentials();
  const first = await createSession(request, data);
  const second = await (await login(request, data)).json();
  const response = await logout(request, first.token);
  expect(response.status()).toBe(204);
  expect(await response.text()).toBe("");
  expect((await request.get(`${api}/auth/me`, { headers: bearer(first.token) })).status()).toBe(
    401,
  );
  expect((await request.get(`${api}/auth/me`, { headers: bearer(second.token) })).status()).toBe(
    200,
  );
});
