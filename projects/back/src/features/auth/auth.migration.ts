import type { Migration } from "#shared/database/migration.contract.ts";
export const migration: Migration = {
  version: "S0006-users",
  apply: (database): void => {
    database.exec(`CREATE TABLE users (
 id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
 role TEXT NOT NULL CHECK (role = 'user'), passwordHash TEXT NOT NULL, createdAt TEXT NOT NULL
 );
 CREATE TABLE sessions (
 tokenHash TEXT PRIMARY KEY, userId TEXT NOT NULL REFERENCES users(id),
 createdAt TEXT NOT NULL, expiresAt TEXT NOT NULL
 );`);
  },
};
