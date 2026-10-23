import express from "express";
import type { RequestHandler } from "express";
export function bodyMiddleware(kilobytes: number): RequestHandler {
  return express.json({ limit: kilobytes * 1024 });
}
