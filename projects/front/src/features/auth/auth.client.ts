import { ExpectedError } from "#shared/expected.error.ts";
import type { HttpClient } from "#shared/http/http.contract.ts";
import type { AuthData, AuthResult, Credentials, Operation } from "./auth.type.ts";
import { readUser, readSession } from "./auth.read.ts";
type Submission = { http: HttpClient; operation: Operation; values: Credentials };
async function submit(input: Submission): Promise<AuthResult> {
  try {
    const answer = await input.http.request({
      path: `/api/auth/${input.operation}`,
      init: {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input.values),
      },
    });
    const login = input.operation === "login";
    return {
      session: login ? readSession(answer) : null,
      message: login ? "" : "Registration complete. You can now log in.",
      fields: {},
    };
  } catch (error) {
    const expected = error instanceof ExpectedError;
    return {
      session: null,
      message: expected ? error.message : "Request failed",
      fields: expected ? (error.fields ?? {}) : {},
    };
  }
}
export function createAuthData(http: HttpClient): AuthData {
  return { submit: (operation, values) => submit({ http, operation, values }) };
}

export async function restoreUser(
  http: HttpClient,
): Promise<import("#shared/session/session.contract.ts").SessionIdentity | null> {
  try {
    return readUser(await http.request({ path: "/api/auth/me" }));
  } catch {
    return null;
  }
}
