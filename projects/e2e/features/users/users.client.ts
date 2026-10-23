import { expect } from "@playwright/test";
import type { APIRequestContext, APIResponse } from "@playwright/test";
import { randomUUID } from "node:crypto";
export type Credentials = { name: string; email: string; password: string };
export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};
export type Session = { token: string; user: PublicUser };
export const api = "http://localhost:3000/api";
export function credentials(): Credentials {
  return { name: "Test User", email: `${randomUUID()}@test.example`, password: "Secret123!" };
}
export function bearer(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}
export function register(request: APIRequestContext, data: unknown): Promise<APIResponse> {
  return request.post(`${api}/auth/register`, { data });
}
export function login(request: APIRequestContext, data: unknown): Promise<APIResponse> {
  return request.post(`${api}/auth/login`, { data });
}
export function logout(request: APIRequestContext, token: string): Promise<APIResponse> {
  return request.post(`${api}/auth/logout`, { headers: bearer(token) });
}
export async function createSession(
  request: APIRequestContext,
  data: Credentials,
): Promise<Session> {
  expect((await register(request, data)).status()).toBe(201);
  const response = await login(request, data);
  expect(response.status()).toBe(200);
  return response.json();
}
