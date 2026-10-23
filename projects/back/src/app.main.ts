import { start } from "#core/lifecycle/app.start.ts";
import { registerFeatures } from "./features/features.manifest.ts";
import identity from "#package" with { type: "json" };

await start({ features: registerFeatures(identity), identity });
