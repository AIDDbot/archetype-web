import express from "express";
import type { RequestHandler } from "express";
const BYTES_PER_KILOBYTE = 1024;
export function bodyMiddleware(kilobytes: number): RequestHandler {
  return express.json({ limit: kilobytes * BYTES_PER_KILOBYTE });
}
