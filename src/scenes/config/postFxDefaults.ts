export const TONE_MAPPING_MODES = [
  "LINEAR",
  "REINHARD",
  "REINHARD2",
  "REINHARD2_ADAPTIVE",
  "UNCHARTED2",
  "OPTIMIZED_CINEON",
  "CINEON",
  "ACES_FILMIC",
  "AGX",
  "NEUTRAL",
] as const;

export const AO_QUALITY_MODES = ["performance", "low", "medium", "high", "ultra"] as const;

export const DEFAULT_POST_FX_CONTROLS = {
  enabled: true,
  ao: {
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
    enabled: false,
    worldFocusDistance: 5.0,
    worldFocusRange: 9.0,
    bokehScale: 3.0,
  },
  colorGrade: {
    enabled: true,
    exposure: 0,
    levelsInLow: 0,
    levelsInHigh: 1,
    levelsGamma: 1,
    levelsOutLow: 0,
    levelsOutHigh: 1,
    brightness: 1,
    contrast: 1,
    saturation: 1,
  },
  toneMapping: {
    enabled: true,
    mode: "ACES_FILMIC" as const,
  },
  chromaticAberration: {
    enabled: false,
    offsetX: 0.002,
    offsetY: 0.002,
    radialModulation: true,
    modulationOffset: 0.25,
  },
  vignette: {
    enabled: true,
    offset: 0.32,
    darkness: 0.57,
    eskil: false,
  },
  grain: {
    enabled: true,
    opacity: 0.042,
  },
  dissolve: {
    devPreview: true,
    devProgress: 0,
    edgeNoiseAmp: 0.2622,
    glowFadeStart: 0,
    glowFadeEnd: 1,
    glowWidth: 0.06,
    glowIntensity: 2.6,
    ringWidth: 0.059,
    radiusScale: 1.28,
    maskInner: 0.027,
    maskOuter: 0,
    ringOuterScale: 0.76,
    starIntensity: 0,
    rimTexelOffset: 2.5,
    rimMix: 1,
    outsideDarkness: 0.22,
    outsideDesat: 0.18,
    closedThreshold: 0.035,
  },
} as const;

export type ToneMappingModeName = (typeof TONE_MAPPING_MODES)[number];
export type AoQualityMode = (typeof AO_QUALITY_MODES)[number];

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
    quality: AoQualityMode;
  };
  dof: {
    enabled: boolean;
    worldFocusDistance: number;
    worldFocusRange: number;
    bokehScale: number;
  };
  colorGrade: {
    enabled: boolean;
    exposure: number;
    levelsInLow: number;
    levelsInHigh: number;
    levelsGamma: number;
    levelsOutLow: number;
    levelsOutHigh: number;
    brightness: number;
    contrast: number;
    saturation: number;
  };
  toneMapping: {
    enabled: boolean;
    mode: ToneMappingModeName;
  };
  chromaticAberration: {
    enabled: boolean;
    offsetX: number;
    offsetY: number;
    radialModulation: boolean;
    modulationOffset: number;
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
  dissolve: {
    devPreview: boolean;
    devProgress: number;
    edgeNoiseAmp: number;
    glowFadeStart: number;
    glowFadeEnd: number;
    glowWidth: number;
    glowIntensity: number;
    ringWidth: number;
    radiusScale: number;
    maskInner: number;
    maskOuter: number;
    ringOuterScale: number;
    starIntensity: number;
    rimTexelOffset: number;
    rimMix: number;
    outsideDarkness: number;
    outsideDesat: number;
    closedThreshold: number;
  };
};
