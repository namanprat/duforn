export const COLS = 96;
export const ROWS = 48;
export const DEFAULT_VISIBLE_ITEMS = 7;
export const DEFAULT_GAP_SIZE = 0.08;
export const NUM_UNIQUE_FALLBACK = 6;

export const MOBILE_STRIP_MQ = "(max-width: 768px)";
// ponytail: 3-up carousel; bump in Leva if needed
export const MOBILE_VISIBLE_ITEMS = 3;

export function getStripVisibleItems(): number {
  if (typeof window === "undefined") return DEFAULT_VISIBLE_ITEMS;
  return window.matchMedia(MOBILE_STRIP_MQ).matches
    ? MOBILE_VISIBLE_ITEMS
    : DEFAULT_VISIBLE_ITEMS;
}
