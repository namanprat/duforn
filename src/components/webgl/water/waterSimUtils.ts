import type { RenderQualityTier } from "../../../lib/rendering/qualityProfile";

export const POOL_SIM_RESOLUTION_BY_TIER: Record<RenderQualityTier, number> = {
  desktop: 384,
  mobile: 192,
  mobileReduced: 128,
};

export function getPoolSimResolutionForTier(tier: RenderQualityTier): number {
  return POOL_SIM_RESOLUTION_BY_TIER[tier] ?? POOL_SIM_RESOLUTION_BY_TIER.desktop;
}

export function uvToSimGrid(
  uv: { x: number; y: number },
  resolution: number,
): { gx: number; gy: number } {
  const maxIndex = Math.max(resolution - 1, 0);
  const clampedU = Math.min(Math.max(uv.x, 0), 1);
  const clampedV = Math.min(Math.max(uv.y, 0), 1);

  return {
    gx: clampedU * maxIndex,
    gy: clampedV * maxIndex,
  };
}
