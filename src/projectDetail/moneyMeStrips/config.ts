/** money.me diagonal strip showcase — tunables and asset paths. */

export const STRIP_PATHS = [
  "/money-me/strip-01.png",
  "/money-me/strip-02.png",
  "/money-me/strip-03.png",
  "/money-me/strip-04.png",
  "/money-me/strip-05.png",
] as const;

export const ROTATION_DEG = 30;
export const MONEY_ME_STRIPS_BG = "#3C3C3C";

/** Width:height for initial frame sizing (16:9). */
export const STRIP_FRAME_ASPECT_W = 16;
export const STRIP_FRAME_ASPECT_H = 9;

/** Inset inside the clip rect when solving scale (0–1). */
export const FRAME_PADDING = 0.96;

export const PARALLAX_TRAVEL_RATIO = 0.14;
export const PARALLAX_STAGGER = 0.04;

export const SCROLL_RANGE = {
  start: "top bottom",
  end: "bottom top",
} as const;

export const FRAME_HEIGHT_COLLAPSE = {
  minRatio: 0.38,
  maxCss: "var(--site--viewport-min-height-supporting)",
} as const;

export const DEPTH_STEP = 0.08;
export const MAX_SCALE = 1.35;

export type StripItemConfig = {
  /** Parallax direction along the strip axis (+1 / -1). */
  parallaxDir: 1 | -1;
  z: number;
  opacity: number;
};

export const STRIP_ITEMS: StripItemConfig[] = [
  { parallaxDir: 1, z: 0, opacity: 1 },
  { parallaxDir: -1, z: DEPTH_STEP, opacity: 0.98 },
  { parallaxDir: 1, z: DEPTH_STEP * 2, opacity: 0.96 },
  { parallaxDir: -1, z: DEPTH_STEP * 3, opacity: 0.94 },
  { parallaxDir: 1, z: DEPTH_STEP * 4, opacity: 0.92 },
];
