import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type { Database } from "#shared/database/database.contract.ts";
export function openDatabase(path: string): Database {
  mkdirSync(dirname(path), { recursive: true });
  return new DatabaseSync(path);
}
