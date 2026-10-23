import "@picocss/pico/css/pico.min.css";
import "@fontsource/roboto/index.css";
import "@fontsource/audiowide/index.css";
import "@fontsource/anonymous-pro/index.css";
import "./core/theme/theme.css";
import "./core/theme/colors.css";
import "./core/theme/custom.css";
import { start } from "#core/lifecycle/app.start.tsx";

import { registerFeatures } from "./features/features.manifest.ts";
import identity from "#package" with { type: "json" };

await start({ features: registerFeatures(identity), identity });

import "./core/shell/shell.css";
