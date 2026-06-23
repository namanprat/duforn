import { button, folder, useControls } from "leva";
import { usePostFxControlsStore } from "../store/postFx";

const TONE_MAPPING_OPTIONS = {
  ACES_FILMIC: "ACES_FILMIC",
  AGX: "AGX",
  NEUTRAL: "NEUTRAL",
  LINEAR: "LINEAR",
  REINHARD: "REINHARD",
  REINHARD2: "REINHARD2",
  REINHARD2_ADAPTIVE: "REINHARD2_ADAPTIVE",
  UNCHARTED2: "UNCHARTED2",
  OPTIMIZED_CINEON: "OPTIMIZED_CINEON",
  CINEON: "CINEON",
} as const;

const AO_QUALITY_OPTIONS = {
  performance: "performance",
  low: "low",
  medium: "medium",
  high: "high",
  ultra: "ultra",
} as const;

/**
 * Dev-only Leva panel for the scene post-processing stack.
 */
export default function ScenePostFXGui() {
  const setControl = usePostFxControlsStore((s) => s.setControl);
  const resetControls = usePostFxControlsStore((s) => s.resetControls);
  const fx = usePostFxControlsStore((s) => s.controls);

  useControls(
    "Post FX",
    {
      enabled: {
        value: fx.enabled,
        onChange: (v) => setControl("enabled", v),
      },
      AO: folder({
        aoEnabled: {
          label: "enabled",
          value: fx.ao.enabled,
          onChange: (v) => setControl("ao.enabled", v),
        },
        aoIntensity: {
          label: "intensity",
          value: fx.ao.intensity,
          min: 0,
          max: 4,
          step: 0.05,
          onChange: (v) => setControl("ao.intensity", v),
        },
        aoRadius: {
          label: "radius",
          value: fx.ao.radius,
          min: 0.5,
          max: 8,
          step: 0.1,
          onChange: (v) => setControl("ao.radius", v),
        },
        aoDistanceFalloff: {
          label: "distance falloff",
          value: fx.ao.distanceFalloff,
          min: 0,
          max: 2,
          step: 0.01,
          onChange: (v) => setControl("ao.distanceFalloff", v),
        },
        aoSamples: {
          label: "samples",
          value: fx.ao.aoSamples,
          min: 4,
          max: 32,
          step: 1,
          onChange: (v) => setControl("ao.aoSamples", v),
        },
        denoiseSamples: {
          value: fx.ao.denoiseSamples,
          min: 1,
          max: 16,
          step: 1,
          onChange: (v) => setControl("ao.denoiseSamples", v),
        },
        denoiseRadius: {
          value: fx.ao.denoiseRadius,
          min: 1,
          max: 32,
          step: 1,
          onChange: (v) => setControl("ao.denoiseRadius", v),
        },
        halfRes: {
          value: fx.ao.halfRes,
          onChange: (v) => setControl("ao.halfRes", v),
        },
        quality: {
          value: fx.ao.quality,
          options: AO_QUALITY_OPTIONS,
          onChange: (v) => setControl("ao.quality", v),
        },
      }),
      Bloom: folder({
        bloomEnabled: {
          label: "enabled",
          value: fx.bloom.enabled,
          onChange: (v) => setControl("bloom.enabled", v),
        },
        bloomIntensity: {
          label: "intensity",
          value: fx.bloom.intensity,
          min: 0,
          max: 3,
          step: 0.05,
          onChange: (v) => setControl("bloom.intensity", v),
        },
        luminanceThreshold: {
          label: "threshold",
          value: fx.bloom.luminanceThreshold,
          min: 0,
          max: 1,
          step: 0.01,
          onChange: (v) => setControl("bloom.luminanceThreshold", v),
        },
        luminanceSmoothing: {
          label: "smoothing",
          value: fx.bloom.luminanceSmoothing,
          min: 0,
          max: 1,
          step: 0.01,
          onChange: (v) => setControl("bloom.luminanceSmoothing", v),
        },
        bloomRadius: {
          label: "radius",
          value: fx.bloom.radius,
          min: 0,
          max: 1,
          step: 0.01,
          onChange: (v) => setControl("bloom.radius", v),
        },
        mipmapBlur: {
          value: fx.bloom.mipmapBlur,
          onChange: (v) => setControl("bloom.mipmapBlur", v),
        },
      }),
      ToneMapping: folder({
        toneEnabled: {
          label: "enabled",
          value: fx.toneMapping.enabled,
          onChange: (v) => setControl("toneMapping.enabled", v),
        },
        mode: {
          value: fx.toneMapping.mode,
          options: TONE_MAPPING_OPTIONS,
          onChange: (v) => setControl("toneMapping.mode", v),
        },
      }),
      ChromaticAberration: folder({
        caEnabled: {
          label: "enabled",
          value: fx.chromaticAberration.enabled,
          onChange: (v) => setControl("chromaticAberration.enabled", v),
        },
        offsetX: {
          value: fx.chromaticAberration.offsetX,
          min: 0,
          max: 0.01,
          step: 0.0001,
          onChange: (v) => setControl("chromaticAberration.offsetX", v),
        },
        offsetY: {
          value: fx.chromaticAberration.offsetY,
          min: 0,
          max: 0.01,
          step: 0.0001,
          onChange: (v) => setControl("chromaticAberration.offsetY", v),
        },
        radialModulation: {
          label: "edge only",
          value: fx.chromaticAberration.radialModulation,
          onChange: (v) => setControl("chromaticAberration.radialModulation", v),
        },
        modulationOffset: {
          label: "edge falloff",
          value: fx.chromaticAberration.modulationOffset,
          min: 0,
          max: 1,
          step: 0.01,
          onChange: (v) => setControl("chromaticAberration.modulationOffset", v),
        },
      }),
      Vignette: folder({
        vignetteEnabled: {
          label: "enabled",
          value: fx.vignette.enabled,
          onChange: (v) => setControl("vignette.enabled", v),
        },
        offset: {
          value: fx.vignette.offset,
          min: 0,
          max: 1,
          step: 0.01,
          onChange: (v) => setControl("vignette.offset", v),
        },
        darkness: {
          value: fx.vignette.darkness,
          min: 0,
          max: 1,
          step: 0.01,
          onChange: (v) => setControl("vignette.darkness", v),
        },
        eskil: {
          value: fx.vignette.eskil,
          onChange: (v) => setControl("vignette.eskil", v),
        },
      }),
      Grain: folder({
        grainEnabled: {
          label: "enabled",
          value: fx.grain.enabled,
          onChange: (v) => setControl("grain.enabled", v),
        },
        opacity: {
          value: fx.grain.opacity,
          min: 0,
          max: 0.08,
          step: 0.001,
          onChange: (v) => setControl("grain.opacity", v),
        },
      }),
      "Reset defaults": button(() => resetControls()),
      "Log values": button(() => {
        const values = usePostFxControlsStore.getState().controls;
        console.info("[Post FX]", JSON.stringify(values, null, 2));
      }),
    },
    { collapsed: false },
  );

  return null;
}
