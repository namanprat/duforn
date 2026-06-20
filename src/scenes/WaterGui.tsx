import { folder, useControls } from "leva";
import { POOL_CAUSTICS_DEFAULTS, POOL_SIM_DEFAULTS, POOL_WATER_DEFAULTS } from "./water/config/poolWaterDefaults";

/** Dev-only Leva panel — mutates POOL_* defaults read back each frame in WaterRipples. */
export default function WaterGui() {
  const w = POOL_WATER_DEFAULTS;
  const c = POOL_CAUSTICS_DEFAULTS;
  const s = POOL_SIM_DEFAULTS;

  useControls("Water", {
    Surface: folder(
      {
        hdrReflection: {
          label: "HDR reflection",
          value: w.hdrReflection,
          onChange: (v: boolean) => {
            w.hdrReflection = v;
          },
        },
        tintR: {
          value: w.aboveWaterTint[0],
          min: 0,
          max: 2,
          step: 0.01,
          onChange: (v: number) => {
            w.aboveWaterTint[0] = v;
          },
        },
        tintG: {
          value: w.aboveWaterTint[1],
          min: 0,
          max: 2,
          step: 0.01,
          onChange: (v: number) => {
            w.aboveWaterTint[1] = v;
          },
        },
        tintB: {
          value: w.aboveWaterTint[2],
          min: 0,
          max: 2,
          step: 0.01,
          onChange: (v: number) => {
            w.aboveWaterTint[2] = v;
          },
        },
        fresnelBase: {
          value: w.fresnelBase,
          min: 0,
          max: 1,
          step: 0.01,
          onChange: (v: number) => {
            w.fresnelBase = v;
          },
        },
        opacity: {
          value: w.opacity,
          min: 0,
          max: 1,
          step: 0.01,
          onChange: (v: number) => {
            w.opacity = v;
          },
        },
        exposure: {
          value: w.exposure,
          min: 0,
          max: 2,
          step: 0.01,
          onChange: (v: number) => {
            w.exposure = v;
          },
        },
        waterClarity: {
          value: w.waterClarity,
          min: 0,
          max: 2,
          step: 0.01,
          onChange: (v: number) => {
            w.waterClarity = v;
          },
        },
        breezeStrength: {
          value: w.breezeStrength,
          min: 0,
          max: 2,
          step: 0.01,
          onChange: (v: number) => {
            w.breezeStrength = v;
          },
        },
        breezeMix: {
          value: w.breezeMix,
          min: 0,
          max: 1,
          step: 0.01,
          onChange: (v: number) => {
            w.breezeMix = v;
          },
        },
        rippleNormalScale: {
          label: "ripple normal scale",
          value: s.normalScale,
          min: 0,
          max: 24,
          step: 0.1,
          onChange: (v: number) => {
            s.normalScale = v;
          },
        },
      },
      { collapsed: false },
    ),
    Caustics: folder(
      {
        causticsEnabled: {
          value: c.enabled,
          onChange: (v: boolean) => {
            c.enabled = v;
          },
        },
        causticsStrength: {
          value: c.strength,
          min: 0,
          max: 2,
          step: 0.01,
          onChange: (v: number) => {
            c.strength = v;
          },
        },
        depth: {
          value: c.depth,
          min: 0.02,
          max: 1,
          step: 0.01,
          onChange: (v: number) => {
            c.depth = v;
          },
        },
        normalScale: {
          value: c.normalScale,
          min: 0,
          max: 800,
          step: 10,
          onChange: (v: number) => {
            c.normalScale = v;
          },
        },
        maxIntensity: {
          value: c.maxIntensity,
          min: 1,
          max: 10,
          step: 0.1,
          onChange: (v: number) => {
            c.maxIntensity = v;
          },
        },
        gain: {
          value: c.gain,
          min: 0,
          max: 4,
          step: 0.05,
          onChange: (v: number) => {
            c.gain = v;
          },
        },
        lightElevationDeg: {
          value: c.lightElevationDeg,
          min: 5,
          max: 85,
          step: 1,
          onChange: (v: number) => {
            c.lightElevationDeg = v;
          },
        },
        lightAzimuthDeg: {
          value: c.lightAzimuthDeg,
          min: 0,
          max: 360,
          step: 1,
          onChange: (v: number) => {
            c.lightAzimuthDeg = v;
          },
        },
      },
      { collapsed: true },
    ),
  });

  return null;
}
