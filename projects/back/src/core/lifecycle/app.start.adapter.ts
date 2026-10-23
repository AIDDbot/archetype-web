import { boot } from "./app.boot.ts";
import { runtime } from "./app.runtime.adapter.ts";
import type { AppOptions } from "./app.compose.ts";
export async function start(options: AppOptions): Promise<void> {
  await boot(options, runtime());
}
