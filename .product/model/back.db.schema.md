# Relational database schema — back

Source of truth inspected: `projects/back/src/core/database/database.adapter.ts`, `projects/back/src/core/database/database.migrate.ts` `projects/back/src/features/auth/auth.migration.ts` and `projects/back/src/features/settings/settings.migration.ts`.

The application opens a file SQLite database at DATABASE_URL. Relative paths start at the back project folder. The auth feature registers migration `S0006-users`, and the settings feature registers `S0007-settings`.

## migrations

| Column | SQLite type | Constraint | Meaning |
| --- | --- | --- | --- |
| version | TEXT | PRIMARY KEY | Applied migration version. |
| appliedAt | TEXT | NOT NULL | UTC timestamp from Date.toISOString(). |

Core creates this table before it applies feature migrations. Each migration and its version record use one transaction. An unknown stored version stops startup.

## users

| Column | SQLite type | Constraint | Meaning |
| --- | --- | --- | --- |
| id | TEXT | PRIMARY KEY | Generated user identifier. |
| email | TEXT | NOT NULL, UNIQUE | Validated lower case email. |
| name | TEXT | NOT NULL | Trimmed name. |
| role | TEXT | NOT NULL, CHECK (role = 'user') | Fixed account role. |
| passwordHash | TEXT | NOT NULL | `$scrypt$N$r$p$salt$hash`, with N=16384, r=8 and p=5 for new passwords. |
| createdAt | TEXT | NOT NULL | UTC ISO timestamp. |

## sessions

| Column | SQLite type | Constraint | Meaning |
| --- | --- | --- | --- |
| tokenHash | TEXT | PRIMARY KEY | SHA-256 hash of a random 32-byte opaque token. |
| userId | TEXT | NOT NULL, REFERENCES users(id) | Session owner. |
| createdAt | TEXT | NOT NULL | UTC ISO timestamp. |
| expiresAt | TEXT | NOT NULL | UTC ISO expiry, from SESSION_TTL_HOURS. |

Session lookup requires expiresAt greater than the current UTC timestamp. Logout deletes by tokenHash. Queries bind all input values. No additional indexes exist.

## settings

| Column | SQLite type | Constraint | Meaning |
| --- | --- | --- | --- |
| userId | TEXT | PRIMARY KEY, REFERENCES users(id) | Owner of the preferences: one row for each user. |
| theme | TEXT | NOT NULL, CHECK (theme IN ('system','light','dark')) | Theme of the account. |
| dateFormat | TEXT | NOT NULL, CHECK (dateFormat IN ('locale','iso')) | Date format of the account. |
| updatedAt | TEXT | NOT NULL | UTC ISO timestamp of the last save. |

A save inserts the row or updates it on a conflict of userId, with bound values. A user with no row gets the defaults `system` and `locale`.

---

> last updated: 2026-10-23T08:51:00Z
