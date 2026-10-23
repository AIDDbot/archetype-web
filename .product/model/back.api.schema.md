# API schema — back

Source of truth inspected: `projects/back/src/features/features.manifest.ts`, `projects/back/src/core/lifecycle/app.compose.ts` and `projects/back/src/core/http/`.

The feature registration list includes `about`, `auth`, `users` and `settings`. The application listens on the configured HOST and PORT after settings checks, migrations and feature connections complete.

## API routes

| Method | Path | Status | Response |
| --- | --- | --- | --- |
| GET | `/api` | 200 | `{ "routes": [ { "method": "METHOD", "path": "/api/path" } ] }` |
| GET | `/api/about` | 200 | `{ "name": "string", "description": "string", "version": "string", "author": { "name": "string", "url": "string" }, "projects": [ { "name": "string", "type": "string", "technologies": [ "string" ] } ] }` |
| POST | `/api/auth/register` | 201 | Public user: `{ id, email, name, role: "user", createdAt }`. |
| POST | `/api/auth/login` | 200 | `{ token, user }`, with a public user. |
| GET | `/api/auth/me` | 200 | Public user. |
| POST | `/api/auth/logout` | 204 | No body. |
| GET | `/api/users/:id` | 200 | Own account: `{ name, email, createdAt }`. |
| GET | `/api/users/me/settings` | 200 | `{ theme, dateFormat }` of the current user, or the defaults `system` and `locale`. |
| PUT | `/api/users/me/settings` | 200 | The kept `{ theme, dateFormat }`. |

The core builds the index from feature route registrations. Each registration supplies its method, path and handler. The core mounts these routes under `/api`. The index includes all registered routes.

The index, about, register and login are public. Other registrations require `Authorization: Bearer <token>`. Missing, invalid or expired sessions return 401 `{ "error": "Unauthorized" }`. The guard keeps the resolved identity in a WeakMap for the request.

Register accepts `{ name, email, password }`. Name has 2 to 64 characters after trimming, email is valid with at most 64 characters and is put in lower case, and password has 8 to 64 characters. Invalid fields return 400 with one fields entry for each invalid field. A duplicate email returns 409 `Email already registered`. The client cannot select a role.

Login accepts `{ email, password }` with the same input limits. Invalid input returns 400. Unknown email and incorrect password return 401 `{ "error": "Invalid credentials" }`. Password hashes are never returned. User createdAt uses ISO 8601 in UTC.

Me returns the current public user. Logout removes only the token used for the request. Users returns account data only when id equals the current user's identifier; all other identifiers return 404 `{ "error": "Not found" }`.

`GET /api/about` is public. Composition supplies the name, description, version and author from the back project's `package.json`. The feature defines the technology summary for `back` (api), `front` (web) and `e2e` (e2e). The route reads no storage and takes no input.

Settings accepts `{ theme, dateFormat }`: theme is `system`, `light` or `dark`, and dateFormat is `locale` or `iso`. An invalid value returns 400 with one fields entry for each invalid field and keeps nothing. Both routes need a session and read or write only the preferences of the current user.

An unknown path under `/api` returns 404 with `{ "error": "Not found" }`.

## Common HTTP contract

- Security headers: X-Content-Type-Options: nosniff; X-Frame-Options: DENY; Referrer-Policy: no-referrer.
- X-Request-Id keeps a received value of 1 to 128 letters, digits or hyphens. Other values cause a new UUID.
- CORS uses CORS_ORIGIN. A preflight OPTIONS request returns 204 with no body. Allowed methods: GET, HEAD, PUT, PATCH, POST, DELETE. Allowed headers: Content-Type, X-Request-Id, Authorization.
- JSON bodies use the configured BODY_LIMIT_KB.

## Error responses

The core error handler returns `{ "error": "message", "fields"?: { "field": "message" } }`. Fields are optional and occur on expected errors.

| Error | Status |
| --- | --- |
| Expected rule or usage error | 400 |
| Missing or invalid session; invalid credentials | 401 |
| Duplicate registration email | 409 |
| Account identifier of a different user | 404 |
| Unknown API path | 404 |
| Invalid JSON body | 400 |
| Body exceeds configured limit | 413 |
| Expected unavailable error | 503 |
| Unexpected error | 500 |

Unexpected errors return Internal server error. The response does not include the internal cause.

---

> last updated: 2026-10-23T08:51:00Z
