import { expect } from "@playwright/test";
import type { APIRequestContext } from "@playwright/test";
import { randomUUID } from "node:crypto";
export const apiBase = "http://localhost:3000/api";
export const appOrigin = "http://localhost:4000";
export type TestAccount = { name: string; email: string; password: string };
export function newAccount(): TestAccount {
  return {
    name: "Settings User",
    email: `settings-${randomUUID()}@test.example`,
    password: "Secret123!",
  };
}
export function authorization(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}
export async function openSession(
  request: APIRequestContext,
  account: TestAccount,
): Promise<string> {
  expect((await request.post(`${apiBase}/auth/register`, { data: account })).status()).toBe(201);
  const answer = await request.post(`${apiBase}/auth/login`, { data: account });
  expect(answer.status()).toBe(200);
  const body: { token: string } = await answer.json();
  return body.token;
}
