export const DEFAULT_POST_FX_CONTROLS = {
  enabled: true,
  ao: {
    // Off — stack is CA + grain + tone mapping only. Toggle in the Leva panel.
    enabled: false,
    intensity: 1.75,
    radius: 3.2,
    distanceFalloff: 0.65,
    aoSamples: 16,
    denoiseSamples: 6,
    denoiseRadius: 12,
    halfRes: true,
    quality: "high" as const,
  },
  dof: {
    // Off — stack is CA + grain + tone mapping only. Toggle in the Leva panel.
    enabled: false,
    worldFocusDistance: 5.0,
    worldFocusRange: 9.0,
    bokehScale: 3.0,
  },
  toneMapping: {
    enabled: true,
    mode: "ACES_FILMIC" as const,
  },
  vignette: {
    enabled: false,
    offset: 0.32,
    darkness: 0.26,
    eskil: false,
  },
  grain: {
    enabled: true,
    opacity: 0.03,
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
  dof: {
    enabled: boolean;
    worldFocusDistance: number;
    worldFocusRange: number;
    bokehScale: number;
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
