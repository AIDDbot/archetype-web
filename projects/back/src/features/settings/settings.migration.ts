import type { Migration } from "#shared/database/migration.contract.ts";
export const migration: Migration = {
  version: "S0007-settings",
  apply: (database): void => {
    database.exec(`CREATE TABLE settings (
      userId TEXT PRIMARY KEY REFERENCES users(id),
      theme TEXT NOT NULL CHECK (theme IN ('system','light','dark')),
      dateFormat TEXT NOT NULL CHECK (dateFormat IN ('locale','iso')),
      updatedAt TEXT NOT NULL
    );`);
  },
};
