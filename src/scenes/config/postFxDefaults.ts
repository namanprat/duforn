export const DEFAULT_POST_FX_CONTROLS = {
  chromaticAberration: {
    enabled: true,
    offset: 0.002,
    radialModulation: true,
    modulationOffset: 0.25,
  },
} as const;

export type PostFxControls = {
  chromaticAberration: {
    enabled: boolean;
    offset: number;
    radialModulation: boolean;
    modulationOffset: number;
  };
};
