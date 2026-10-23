import { matchPath } from "react-router";
import type { Access } from "#shared/session/session.contract.ts";
export function allows(access: Access, authenticated: boolean): boolean {
  const marks = { everyone: true, anonymous: !authenticated, session: authenticated };
  return marks[access];
}
export type ReturnTarget = { value: string | null; origin: string; paths: readonly string[] };
export function returnTarget(input: ReturnTarget): string {
  const value = input.value;
  const absent = value === null;
  if (absent) return "/";
  const parseable = URL.canParse(value, input.origin);
  if (!parseable) return "/";
  const url = new URL(value, input.origin);
  const sameOrigin = url.origin === input.origin;
  const registered = input.paths.some((path) => matchPath(path, url.pathname) !== null);
  const valid = sameOrigin && registered;
  return valid ? `${url.pathname}${url.search}${url.hash}` : "/";
}
