import { isRecord } from "#shared/values/values.check.ts";
import type { About, Project } from "./about.type.ts";
import type { Author } from "#shared/identity.type.ts";
function record(input: unknown): Record<string, unknown> {
  if (isRecord(input)) return input;
  throw new Error("Expected an object");
}
function text(input: unknown): string {
  const isString = typeof input === "string";
  if (isString) return input;
  throw new Error("Expected text");
}
function list(input: unknown): unknown[] {
  if (Array.isArray(input)) return input;
  throw new Error("Expected a list");
}
function author(input: unknown): Author {
  const value = record(input);
  return { name: text(value.name), url: text(value.url) };
}
function project(input: unknown): Project {
  const value = record(input);
  return {
    name: text(value.name),
    type: text(value.type),
    technologies: list(value.technologies).map(text),
  };
}
export function readAbout(input: unknown): About {
  const value = record(input);
  return {
    name: text(value.name),
    description: text(value.description),
    version: text(value.version),
    author: author(value.author),
    projects: list(value.projects).map(project),
  };
}
