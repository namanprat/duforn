// Work cloth strip — defaults shared by WorkClothStrip

// ── Cloth mesh resolution ──────────────────────────────────────────────────
export const COLS = 144;
export const ROWS = 52;

// ── Content layout ─────────────────────────────────────────────────────────
export const DEFAULT_VISIBLE_ITEMS = 7;
export const DEFAULT_GAP_SIZE = 0.08;
export const NUM_UNIQUE_FALLBACK = 6;

// ── XPBD solver ────────────────────────────────────────────────────────────
export const NUM_SUBSTEPS = 10;

// ── Curved cloth defaults (overridden by store) ───────────────────────────
export const DEFAULT_CURVE_RADIUS = 12.4;
export const DEFAULT_CURVE_AMOUNT = 1.56;
export const DEFAULT_STRIP_HEIGHT = 4.6;
export const DEFAULT_STRIP_Y_OFFSET = -1.05;
export const DEFAULT_BOTTOM_SWAY = 0.36;
export const DEFAULT_DEPTH_OFFSET = -0.2;

// ── Scroll controller ──────────────────────────────────────────────────────
export const SCROLL_LERP = 0.11;
export const SCROLL_DAMPING = 0.9;
export const SCROLL_DAMPING_DRAG = 0.82;
export const SNAP_VELOCITY_THRESHOLD = 0.035;
export const SNAP_LERP = 0.18;
export const SNAP_EPSILON = 0.0025;
export const DRAG_CLICK_THRESHOLD_PX = 8;
export const WHEEL_SENSITIVITY = 0.0028;
export const DRAG_SENSITIVITY = 0.0068;
export const DRAG_VELOCITY_SCALE = 0.0076;
