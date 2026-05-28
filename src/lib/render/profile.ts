export type RenderQualityTier = "desktop" | "mobile" | "mobileReduced";

export type RenderQualityProfile = {
  tier: RenderQualityTier;
  isMobile: boolean;
  isReducedMotion: boolean;
  dprCap: number;
  homeParticles: number;
  shadowMapSize: number;
  projectBgRenderScale: number;
  antialias: boolean;
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
      homeParticles: 60,
      shadowMapSize: 1024,
      projectBgRenderScale: 0.7,
      antialias: false,
    };
  }

  if (mobile) {
    return {
      tier: "mobile",
      isMobile: true,
      isReducedMotion: false,
      dprCap: 1.5,
      homeParticles: 80,
      shadowMapSize: 1024,
      projectBgRenderScale: 0.8,
      antialias: false,
    };
  }

  return {
    tier: "desktop",
    isMobile: false,
    isReducedMotion: false,
    dprCap: 1.75,
    homeParticles: 150,
    shadowMapSize: 1536,
    projectBgRenderScale: 1,
    antialias: true,
  };
}
