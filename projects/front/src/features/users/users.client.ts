import type { HttpClient } from "#shared/http/http.contract.ts";
import { isRecord } from "#shared/values/values.check.ts";
import { requireText } from "#shared/values/text/text.parse.ts";
import { parseDate } from "#shared/values/dates/dates.parse.ts";
import type { Account, AccountData } from "./users.type.ts";
export function readAccount(value: unknown): Account {
  const record = isRecord(value);
  if (!record) throw new Error("Invalid account response");
  return {
    name: requireText(value.name, "name"),
    email: requireText(value.email, "email"),
    createdAt: parseDate(value.createdAt, "createdAt"),
  };
}
async function load(http: HttpClient, id: string): Promise<Account | null> {
  try {
    return readAccount(await http.request({ path: `/api/users/${encodeURIComponent(id)}` }));
  } catch {
    return null;
  }
}
export function createAccountData(http: HttpClient): AccountData {
  return { load: (id) => load(http, id) };
}
