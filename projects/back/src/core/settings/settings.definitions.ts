import {
  parsePort,
  parseBodyLimit,
  parseLevel,
  parseOrigin,
  parsePath,
  parseHost,
  parseSessionTtl,
} from "./settings.parse.ts";
export const definitions = {
  sessionTtlHours: { name: "SESSION_TTL_HOURS", fallback: "24", parse: parseSessionTtl },
  port: { name: "PORT", fallback: "3000", parse: parsePort },
  host: { name: "HOST", fallback: "0.0.0.0", parse: parseHost },
  database: { name: "DATABASE_URL", fallback: "./data/app.sqlite", parse: parsePath },
  origin: { name: "CORS_ORIGIN", fallback: "*", parse: parseOrigin },
  logDirectory: { name: "LOG_DIR", fallback: "./logs", parse: parsePath },
  logLevel: { name: "LOG_LEVEL", fallback: "info", parse: parseLevel },
  bodyLimit: { name: "BODY_LIMIT_KB", fallback: "100", parse: parseBodyLimit },
};
