export type RenderQualityTier = "desktop" | "mobile" | "mobileReduced";

function isCoarsePointer() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: coarse)").matches
  );
}

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Pick pool sim / caustics resolution from viewport + motion preferences. */
export function getRenderQualityTier(): RenderQualityTier {
  if (prefersReducedMotion()) return "mobileReduced";
  if (isCoarsePointer()) return "mobile";
  return "desktop";
}

const POOL_SIM_RESOLUTION_BY_TIER: Record<RenderQualityTier, number> = {
  desktop: 192,
  mobile: 128,
  mobileReduced: 96,
};

export function getPoolSimResolutionForTier(tier: RenderQualityTier): number {
  return POOL_SIM_RESOLUTION_BY_TIER[tier] ?? POOL_SIM_RESOLUTION_BY_TIER.desktop;
}

const POOL_CAUSTICS_RT_BY_TIER: Record<RenderQualityTier, number> = {
  desktop: 512,
  mobile: 256,
  mobileReduced: 128,
};

export function getPoolCausticsSizeForTier(tier: RenderQualityTier): number {
  return POOL_CAUSTICS_RT_BY_TIER[tier] ?? POOL_CAUSTICS_RT_BY_TIER.desktop;
}

export function uvToSimGrid(
  uv: { x: number; y: number },
  nw: number,
  nh: number = nw,
): { gx: number; gy: number } {
  return {
    gx: Math.min(Math.max(uv.x, 0), 1) * Math.max(nw - 1, 0),
    gy: Math.min(Math.max(uv.y, 0), 1) * Math.max(nh - 1, 0),
  };
}
