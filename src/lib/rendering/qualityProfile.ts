export type RenderQualityTier = "desktop" | "mobile" | "mobileReduced";

export type RenderQualityProfile = {
  tier: RenderQualityTier;
  isMobile: boolean;
  isReducedMotion: boolean;
  dprCap: number;
  homeParticles: number;
  shadowMapSize: number;
  projectBgRenderScale: number;
  ssaoEnabled: boolean;
  ssaoIntensity: number;
  ssaoRadius: number;
  ssaoResolutionScale: number;
  ssaoSamples: number;
};

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isCoarsePointer(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

export function getRenderQualityProfile(): RenderQualityProfile {
  const mobile = isCoarsePointer();
  const reduced = prefersReducedMotion();

  if (mobile && reduced) {
    return {
      tier: "mobileReduced",
      isMobile: true,
      isReducedMotion: true,
      dprCap: 1.25,
      homeParticles: 88,
      shadowMapSize: 1024,
      projectBgRenderScale: 0.7,
      ssaoEnabled: true,
      ssaoIntensity: 0.62,
      ssaoRadius: 0.18,
      ssaoResolutionScale: 0.55,
      ssaoSamples: 8,
    };
  }

  if (mobile) {
    return {
      tier: "mobile",
      isMobile: true,
      isReducedMotion: false,
      dprCap: 1.5,
      homeParticles: 120,
      shadowMapSize: 1024,
      projectBgRenderScale: 0.8,
      ssaoEnabled: true,
      ssaoIntensity: 0.78,
      ssaoRadius: 0.22,
      ssaoResolutionScale: 0.67,
      ssaoSamples: 12,
    };
  }

  return {
    tier: "desktop",
    isMobile: false,
    isReducedMotion: false,
    dprCap: 2,
    homeParticles: 200,
    shadowMapSize: 2048,
    projectBgRenderScale: 1,
    ssaoEnabled: true,
    ssaoIntensity: 0.95,
    ssaoRadius: 0.28,
    ssaoResolutionScale: 1,
    ssaoSamples: 16,
  };
}
