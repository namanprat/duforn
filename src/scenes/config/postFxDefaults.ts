export const DEFAULT_POST_FX_CONTROLS = {
  enabled: true,
  toneMapping: {
    enabled: true,
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
  toneMapping: {
    enabled: boolean;
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
