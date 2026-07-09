import { getQualityProfile } from "../lib/qualityProfile";

export const DEFAULT_VISIBLE_ITEMS = 7;
export const DEFAULT_GAP_SIZE = 0.08;
export const NUM_UNIQUE_FALLBACK = 6;

export const MOBILE_STRIP_MQ = "(max-width: 768px)";

/** Tier-scaled cloth grid — fewer vertices on weak/mobile GPUs. */
export function getStripMeshDensity() {
  const { stripCols, stripRows } = getQualityProfile();
  return { cols: stripCols, rows: stripRows };
}

export function getStripVisibleItems(): number {
  return DEFAULT_VISIBLE_ITEMS;
}
