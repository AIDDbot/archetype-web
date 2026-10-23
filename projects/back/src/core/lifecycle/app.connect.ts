import type { Feature } from "#shared/http/feature.contract.ts";
import type { FeatureServices } from "#shared/session/session.contract.ts";
export function connectFeatures(features: Feature[], services: FeatureServices): void {
  for (const feature of features) feature.connect?.(services);
}
