import { button, folder, useControls } from "leva";
import {
  AO_QUALITY_MODES,
  TONE_MAPPING_MODES,
} from "./config/postFxDefaults";
import { usePostFxControlsStore } from "../store/postFx";
import { getDeviceTier } from "../lib/deviceTier";
import { getQualityProfile } from "../lib/qualityProfile";

const TONE_MAPPING_OPTIONS = Object.fromEntries(TONE_MAPPING_MODES.map((mode) => [mode, mode]));
const AO_QUALITY_OPTIONS = Object.fromEntries(AO_QUALITY_MODES.map((mode) => [mode, mode]));

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
      deviceTier: {
        value: `tier ${getDeviceTier()} (max DPR ${getQualityProfile().maxDpr})`,
        editable: false,
      },
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
      DepthOfField: folder({
        dofEnabled: {
          label: "enabled",
          value: fx.dof.enabled,
          onChange: (v) => setControl("dof.enabled", v),
        },
        worldFocusDistance: {
          label: "focus distance",
          value: fx.dof.worldFocusDistance,
          min: 0.5,
          max: 40,
          step: 0.1,
          onChange: (v) => setControl("dof.worldFocusDistance", v),
        },
        worldFocusRange: {
          label: "focus range",
          value: fx.dof.worldFocusRange,
          min: 0.5,
          max: 40,
          step: 0.1,
          onChange: (v) => setControl("dof.worldFocusRange", v),
        },
        bokehScale: {
          label: "bokeh scale",
          value: fx.dof.bokehScale,
          min: 0,
          max: 8,
          step: 0.1,
          onChange: (v) => setControl("dof.bokehScale", v),
        },
      }),
      "Main Scene": folder({
        colorGradeEnabled: {
          label: "enabled",
          value: fx.colorGrade.enabled,
          onChange: (v) => setControl("colorGrade.enabled", v),
        },
        "Exposure / Levels": folder({
          exposure: {
            label: "exposure (stops)",
            value: fx.colorGrade.exposure,
            min: -3,
            max: 3,
            step: 0.01,
            onChange: (v) => setControl("colorGrade.exposure", v),
          },
          levelsInLow: {
            label: "in black",
            value: fx.colorGrade.levelsInLow,
            min: 0,
            max: 1,
            step: 0.01,
            onChange: (v) => setControl("colorGrade.levelsInLow", v),
          },
          levelsInHigh: {
            label: "in white",
            value: fx.colorGrade.levelsInHigh,
            min: 0,
            max: 1,
            step: 0.01,
            onChange: (v) => setControl("colorGrade.levelsInHigh", v),
          },
          levelsGamma: {
            label: "gamma",
            value: fx.colorGrade.levelsGamma,
            min: 0.1,
            max: 4,
            step: 0.01,
            onChange: (v) => setControl("colorGrade.levelsGamma", v),
          },
          levelsOutLow: {
            label: "out black",
            value: fx.colorGrade.levelsOutLow,
            min: 0,
            max: 1,
            step: 0.01,
            onChange: (v) => setControl("colorGrade.levelsOutLow", v),
          },
          levelsOutHigh: {
            label: "out white",
            value: fx.colorGrade.levelsOutHigh,
            min: 0,
            max: 1,
            step: 0.01,
            onChange: (v) => setControl("colorGrade.levelsOutHigh", v),
          },
        }),
        "Color Levels": folder({
          brightness: {
            value: fx.colorGrade.brightness,
            min: 0,
            max: 2,
            step: 0.01,
            onChange: (v) => setControl("colorGrade.brightness", v),
          },
          contrast: {
            value: fx.colorGrade.contrast,
            min: 0,
            max: 2,
            step: 0.01,
            onChange: (v) => setControl("colorGrade.contrast", v),
          },
          saturation: {
            value: fx.colorGrade.saturation,
            min: 0,
            max: 2,
            step: 0.01,
            onChange: (v) => setControl("colorGrade.saturation", v),
          },
          hue: {
            label: "hue (°)",
            value: fx.colorGrade.hue,
            min: -180,
            max: 180,
            step: 1,
            onChange: (v) => setControl("colorGrade.hue", v),
          },
          tint: {
            label: "tint (green ↔ magenta)",
            value: fx.colorGrade.tint,
            min: -1,
            max: 1,
            step: 0.01,
            onChange: (v) => setControl("colorGrade.tint", v),
          },
        }),
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
        amount: {
          label: "amount",
          value: fx.toneMapping.amount,
          min: 0,
          max: 1,
          step: 0.01,
          onChange: (v) => setControl("toneMapping.amount", v),
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
          max: 0.02,
          step: 0.0001,
          onChange: (v) => setControl("chromaticAberration.offsetX", v),
        },
        offsetY: {
          value: fx.chromaticAberration.offsetY,
          min: 0,
          max: 0.02,
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
      Dissolve: folder({
        devPreview: {
          label: "dev preview",
          value: fx.dissolve.devPreview,
          onChange: (v) => setControl("dissolve.devPreview", v),
        },
        devProgress: {
          label: "preview progress",
          value: fx.dissolve.devProgress,
          min: 0,
          max: 1.1,
          step: 0.001,
          onChange: (v) => setControl("dissolve.devProgress", v),
        },
        edgeNoiseAmp: {
          label: "spread",
          value: fx.dissolve.edgeNoiseAmp,
          min: 0,
          max: 1,
          step: 0.001,
          onChange: (v) => setControl("dissolve.edgeNoiseAmp", v),
        },
        glowFadeStart: {
          label: "glow fade start",
          value: fx.dissolve.glowFadeStart,
          min: 0,
          max: 1,
          step: 0.01,
          onChange: (v) => setControl("dissolve.glowFadeStart", v),
        },
        glowFadeEnd: {
          label: "glow fade end",
          value: fx.dissolve.glowFadeEnd,
          min: 0,
          max: 1,
          step: 0.01,
          onChange: (v) => setControl("dissolve.glowFadeEnd", v),
        },
        glowWidth: {
          label: "glow width",
          value: fx.dissolve.glowWidth,
          min: 0.01,
          max: 1,
          step: 0.01,
          onChange: (v) => setControl("dissolve.glowWidth", v),
        },
        glowIntensity: {
          label: "glow intensity",
          value: fx.dissolve.glowIntensity,
          min: 0,
          max: 8,
          step: 0.05,
          onChange: (v) => setControl("dissolve.glowIntensity", v),
        },
        ringWidth: {
          label: "ring width",
          value: fx.dissolve.ringWidth,
          min: 0.01,
          max: 0.5,
          step: 0.005,
          onChange: (v) => setControl("dissolve.ringWidth", v),
        },
        radiusScale: {
          label: "radius scale",
          value: fx.dissolve.radiusScale,
          min: 0.5,
          max: 2,
          step: 0.01,
          onChange: (v) => setControl("dissolve.radiusScale", v),
        },
        maskInner: {
          label: "mask inner",
          value: fx.dissolve.maskInner,
          min: 0,
          max: 0.3,
          step: 0.005,
          onChange: (v) => setControl("dissolve.maskInner", v),
        },
        maskOuter: {
          label: "mask outer",
          value: fx.dissolve.maskOuter,
          min: 0,
          max: 0.3,
          step: 0.005,
          onChange: (v) => setControl("dissolve.maskOuter", v),
        },
        ringOuterScale: {
          label: "ring outer scale",
          value: fx.dissolve.ringOuterScale,
          min: 0.1,
          max: 2,
          step: 0.01,
          onChange: (v) => setControl("dissolve.ringOuterScale", v),
        },
        starIntensity: {
          label: "star intensity",
          value: fx.dissolve.starIntensity,
          min: 0,
          max: 10,
          step: 0.1,
          onChange: (v) => setControl("dissolve.starIntensity", v),
        },
        rimTexelOffset: {
          label: "rim texel offset",
          value: fx.dissolve.rimTexelOffset,
          min: 0,
          max: 10,
          step: 0.1,
          onChange: (v) => setControl("dissolve.rimTexelOffset", v),
        },
        rimMix: {
          label: "rim mix",
          value: fx.dissolve.rimMix,
          min: 0,
          max: 1,
          step: 0.01,
          onChange: (v) => setControl("dissolve.rimMix", v),
        },
        outsideDarkness: {
          label: "outside darkness",
          value: fx.dissolve.outsideDarkness,
          min: 0,
          max: 1,
          step: 0.01,
          onChange: (v) => setControl("dissolve.outsideDarkness", v),
        },
        outsideDesat: {
          label: "outside desat",
          value: fx.dissolve.outsideDesat,
          min: 0,
          max: 1,
          step: 0.01,
          onChange: (v) => setControl("dissolve.outsideDesat", v),
        },
        closedThreshold: {
          label: "closed threshold",
          value: fx.dissolve.closedThreshold,
          min: 0,
          max: 0.2,
          step: 0.005,
          onChange: (v) => setControl("dissolve.closedThreshold", v),
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
