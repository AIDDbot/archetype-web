import type { Database } from "./database.contract.ts";
export type Migration = { version: string; apply: (database: Database) => void };
