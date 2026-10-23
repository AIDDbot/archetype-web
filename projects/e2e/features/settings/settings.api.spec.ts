import { expect, test } from "@playwright/test";
import { checkErrorBody } from "#shared/projects/error.check.ts";
import { apiBase, authorization, newAccount, openSession } from "#shared/test-data/session.data.ts";
const path = `${apiBase}/users/me/settings`;
test(
  "settings of a session have the defaults and need a session",
  { tag: "@S0007-R01" },
  async ({ request }) => {
    const token = await openSession(request, newAccount());
    const answer = await request.get(path, { headers: authorization(token) });
    expect(answer.status()).toBe(200);
    expect(await answer.json()).toEqual({ theme: "system", dateFormat: "locale" });
    const anonymous = await request.get(path);
    expect(anonymous.status()).toBe(401);
    checkErrorBody(await anonymous.json());
  },
);
test(
  "settings keep valid values and refuse each invalid field",
  { tag: "@S0007-R02" },
  async ({ request }) => {
    const headers = authorization(await openSession(request, newAccount()));
    const saved = await request.put(path, { headers, data: { theme: "dark", dateFormat: "iso" } });
    expect(saved.status()).toBe(200);
    expect(await saved.json()).toEqual({ theme: "dark", dateFormat: "iso" });
    const refused = await request.put(path, {
      headers,
      data: { theme: "blue", dateFormat: "short" },
    });
    expect(refused.status()).toBe(400);
    const body = checkErrorBody(await refused.json());
    expect(Object.keys(body.fields ?? {}).toSorted()).toEqual(["dateFormat", "theme"]);
    expect(await (await request.get(path, { headers })).json()).toEqual({
      theme: "dark",
      dateFormat: "iso",
    });
    expect(
      (await request.put(path, { data: { theme: "light", dateFormat: "iso" } })).status(),
    ).toBe(401);
  },
);
