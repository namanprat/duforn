// Local copy of the render quality tiers (the old lib/render/profile module was
// removed in the unified-canvas refactor; this util only needs the literal set).
type RenderQualityTier = "desktop" | "mobile" | "mobileReduced";

const POOL_SIM_RESOLUTION_BY_TIER: Record<RenderQualityTier, number> = {
  desktop: 192,
  mobile: 128,
  mobileReduced: 96,
};

export function getPoolSimResolutionForTier(tier: RenderQualityTier): number {
  return POOL_SIM_RESOLUTION_BY_TIER[tier] ?? POOL_SIM_RESOLUTION_BY_TIER.desktop;
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
