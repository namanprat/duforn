export const DEFAULT_POST_FX_CONTROLS = {
  enabled: true,
  ao: {
    // Layer 3 — cheap GI approximation; on by default now the room is lit PBR.
    enabled: true,
    intensity: 1.75,
    radius: 3.2,
    distanceFalloff: 0.65,
    aoSamples: 16,
    denoiseSamples: 6,
    denoiseRadius: 12,
    halfRes: true,
    quality: "high" as const,
  },
  bloom: {
    // Layer 5 — bright daylight scene, so a high threshold blooms only sun
    // glints / water sparkle / window highlights, not the whole frame.
    enabled: true,
    intensity: 0.6,
    luminanceThreshold: 0.9,
    luminanceSmoothing: 0.3,
    mipmapBlur: true,
    radius: 0.6,
  },
  toneMapping: {
    enabled: true,
    mode: "ACES_FILMIC" as const,
  },
  vignette: {
    enabled: true,
    offset: 0.32,
    darkness: 0.26,
    eskil: false,
  },
  grain: {
    enabled: true,
    opacity: 0.015,
  },
  chromaticAberration: {
    enabled: true,
    offsetX: 0.0012,
    offsetY: 0.0012,
    radialModulation: true,
    modulationOffset: 0.38,
  },
} as const;

export type PostFxControls = {
  enabled: boolean;
  ao: {
    enabled: boolean;
    intensity: number;
    radius: number;
    distanceFalloff: number;
    aoSamples: number;
    denoiseSamples: number;
    denoiseRadius: number;
    halfRes: boolean;
    quality: "performance" | "low" | "medium" | "high" | "ultra";
  };
  bloom: {
    enabled: boolean;
    intensity: number;
    luminanceThreshold: number;
    luminanceSmoothing: number;
    mipmapBlur: boolean;
    radius: number;
  };
  toneMapping: {
    enabled: boolean;
    mode:
      | "LINEAR"
      | "REINHARD"
      | "REINHARD2"
      | "REINHARD2_ADAPTIVE"
      | "UNCHARTED2"
      | "OPTIMIZED_CINEON"
      | "CINEON"
      | "ACES_FILMIC"
      | "AGX"
      | "NEUTRAL";
  };
  vignette: {
    enabled: boolean;
    offset: number;
    darkness: number;
    eskil: boolean;
  };
  grain: {
    enabled: boolean;
    opacity: number;
  };
  chromaticAberration: {
    enabled: boolean;
    offsetX: number;
    offsetY: number;
    radialModulation: boolean;
    modulationOffset: number;
  };
};
