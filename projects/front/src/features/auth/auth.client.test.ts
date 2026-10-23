import { testUser as user } from "./auth.fixture.ts";
import { expect, test } from "vite-plus/test";
import { createAuthData, restoreUser } from "./auth.client.ts";
import { ExpectedError } from "#shared/expected.error.ts";
const values = { name: "Person", email: "a@b.test", password: "password" };
test("submits each operation and reads login", async () => {
  const data = createAuthData({ request: async () => ({ token: "secret", user }) });
  expect((await data.submit("login", values)).session?.user).toEqual(user);
  expect((await data.submit("register", values)).message).toContain("Registration complete");
  expect(await restoreUser({ request: async () => user })).toEqual(user);
});
test("maps field errors and unknown failures", async () => {
  for (const failure of [
    new Error("offline"),
    new ExpectedError({ kind: "rule", message: "No" }),
    new ExpectedError({ kind: "rule", message: "Invalid", fields: { name: "Too short" } }),
  ]) {
    const http = {
      request: async (): Promise<unknown> => {
        throw failure;
      },
    };
    const result = await createAuthData(http).submit("login", values);
    expect(result.session).toBeNull();
    const expected = failure instanceof ExpectedError;
    expect(result.message).toBe(expected ? failure.message : "Request failed");
    expect(await restoreUser(http)).toBeNull();
  }
});
