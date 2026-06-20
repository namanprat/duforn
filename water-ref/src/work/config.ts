// @ts-nocheck
// Work image strip — static build-time defaults consumed by ClothStrip.tsx.
// Runtime-tunable values (curve radius/amount, strip height, scroll/snap/drag)
// live in the work-scene store (src/store/workScene.ts), not here.

// ── Arc mesh resolution ────────────────────────────────────────────────────
export const COLS = 96;
export const ROWS = 48;

// ── Content layout ─────────────────────────────────────────────────────────
export const DEFAULT_VISIBLE_ITEMS = 7;
export const DEFAULT_GAP_SIZE = 0.08;
export const NUM_UNIQUE_FALLBACK = 6;
