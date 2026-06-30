export const COLS = 96;
export const ROWS = 48;
export const DEFAULT_VISIBLE_ITEMS = 7;
export const DEFAULT_GAP_SIZE = 0.08;
export const NUM_UNIQUE_FALLBACK = 6;

export const MOBILE_STRIP_MQ = "(max-width: 768px)";

export function getStripVisibleItems(): number {
  return DEFAULT_VISIBLE_ITEMS;
}
