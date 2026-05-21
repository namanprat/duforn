// @ts-nocheck
import React, { useEffect, useState } from "react";
import { Leva, useControls, folder } from "leva";
import {
  POOL_ENV_DEFAULTS,
  POOL_SIM_DEFAULTS,
  POOL_WATER_DEFAULTS,
} from "../config/poolWaterDefaults";

/**
 * Dev-only Leva panel for the main pool water — covers ocean-style look uniforms
 * and the wave-equation ripple sim parameters.
 */
export default function MainWaterControls({
  materialApi,
  sim,
  breeze,
  enabled = import.meta.env.DEV,
}) {
  const [values] = useControls(
    () => ({
      "Water Appearance": folder({
        shallowWaterColor: POOL_WATER_DEFAULTS.shallowWaterColor,
        deepWaterColor: POOL_WATER_DEFAULTS.deepWaterColor,
        depthFalloff: { value: POOL_WATER_DEFAULTS.depthFalloff, min: 0.5, max: 20, step: 0.1 },
        waterDepth: { value: POOL_WATER_DEFAULTS.waterDepth, min: 0.1, max: 5, step: 0.05 },
        waterClarity: { value: POOL_WATER_DEFAULTS.waterClarity, min: 0, max: 1, step: 0.01 },
        fresnelPower: { value: POOL_WATER_DEFAULTS.fresnelPower, min: 0.5, max: 10, step: 0.1 },
        fresnelNormalStrength: {
          value: POOL_WATER_DEFAULTS.fresnelNormalStrength,
          min: 0,
          max: 1,
          step: 0.01,
        },
        normalStrength: { value: POOL_WATER_DEFAULTS.normalStrength, min: 0, max: 2, step: 0.01 },
        opacity: { value: POOL_WATER_DEFAULTS.opacity, min: 0, max: 1, step: 0.01 },
        sunSpecularIntensity: {
          value: POOL_WATER_DEFAULTS.sunSpecularIntensity,
          min: 0,
          max: 3,
          step: 0.05,
        },
        specularShininess: {
          value: POOL_WATER_DEFAULTS.specularShininess,
          min: 16,
          max: 512,
          step: 1,
        },
      }),
      Subsurface: folder({
        subsurfaceIntensity: {
          value: POOL_WATER_DEFAULTS.subsurfaceIntensity,
          min: 0,
          max: 2,
          step: 0.01,
        },
        subsurfacePower: { value: POOL_WATER_DEFAULTS.subsurfacePower, min: 1, max: 8, step: 0.1 },
        subsurfaceColor: POOL_WATER_DEFAULTS.subsurfaceColor,
      }),
      Refraction: folder({
        refractionStrength: {
          value: POOL_WATER_DEFAULTS.refractionStrength,
          min: 0,
          max: 0.3,
          step: 0.005,
        },
      }),
      Fog: folder({
        fogStartDistance: {
          value: POOL_WATER_DEFAULTS.fogStartDistance,
          min: 0,
          max: 50,
          step: 0.5,
        },
        fogEndDistance: {
          value: POOL_WATER_DEFAULTS.fogEndDistance,
          min: 0,
          max: 100,
          step: 0.5,
        },
        fogIntensity: { value: POOL_WATER_DEFAULTS.fogIntensity, min: 0, max: 1, step: 0.01 },
        fogColor: POOL_WATER_DEFAULTS.fogColor,
      }),
      Foam: folder({
        foamAmount: { value: POOL_WATER_DEFAULTS.foamAmount, min: 0, max: 1, step: 0.01 },
        foamThreshold: { value: POOL_WATER_DEFAULTS.foamThreshold, min: 0, max: 1.5, step: 0.01 },
      }),
      "Ripple Sim": folder({
        modifier: { value: POOL_SIM_DEFAULTS.modifier, min: 0.9, max: 0.999, step: 0.001 },
        impulseRadius: { value: POOL_SIM_DEFAULTS.impulseRadius, min: 1, max: 12, step: 0.5 },
        impulseStrength: {
          value: POOL_SIM_DEFAULTS.impulseStrength,
          min: 0.1,
          max: 4,
          step: 0.05,
        },
      }),
      Breeze: folder({
        breezeStrength: {
          value: POOL_SIM_DEFAULTS.breezeStrength,
          min: 0,
          max: 2,
          step: 0.01,
        },
        rippleFrequencyHz: {
          // Hz = impulses per second. Range 0.2..5 Hz → 5000..200 ms interval.
          value: 1000 / POOL_SIM_DEFAULTS.breezeIntervalMs,
          min: 0.2,
          max: 5,
          step: 0.05,
        },
      }),
      Sun: folder({
        sunElevation: { value: POOL_ENV_DEFAULTS.sunElevation, min: 0, max: 90, step: 1 },
        sunAzimuth: { value: POOL_ENV_DEFAULTS.sunAzimuth, min: 0, max: 360, step: 1 },
      }),
    }),
    { collapsed: false },
  );

  useEffect(() => {
    if (!enabled || !materialApi) return;
    materialApi.updateWaterParams({
      shallowWaterColor: values.shallowWaterColor,
      deepWaterColor: values.deepWaterColor,
      depthFalloff: values.depthFalloff,
      waterDepth: values.waterDepth,
      waterClarity: values.waterClarity,
      fresnelPower: values.fresnelPower,
      fresnelNormalStrength: values.fresnelNormalStrength,
      normalStrength: values.normalStrength,
      opacity: values.opacity,
      sunSpecularIntensity: values.sunSpecularIntensity,
      specularShininess: values.specularShininess,
      subsurfaceIntensity: values.subsurfaceIntensity,
      subsurfacePower: values.subsurfacePower,
      subsurfaceColor: values.subsurfaceColor,
      refractionStrength: values.refractionStrength,
      fogStartDistance: values.fogStartDistance,
      fogEndDistance: values.fogEndDistance,
      fogIntensity: values.fogIntensity,
      fogColor: values.fogColor,
      foamAmount: values.foamAmount,
      foamThreshold: values.foamThreshold,
    });
    materialApi.updateSun(values.sunElevation, values.sunAzimuth);
    sim?.setSimParams?.({
      modifier: values.modifier,
      impulseRadius: values.impulseRadius,
      impulseStrength: values.impulseStrength,
    });
    breeze?.setStrength?.(values.breezeStrength);
    breeze?.setIntervalMs?.(1000 / Math.max(0.05, values.rippleFrequencyHz));
  }, [enabled, materialApi, sim, breeze, values]);

  const [hidden, setHidden] = useState(true);
  useEffect(() => {
    if (!enabled) return undefined;
    const onKey = (e) => {
      if (e.key === "h" || e.key === "H") setHidden((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled]);

  if (!enabled) return null;
  return <Leva hidden={hidden} collapsed={false} />;
}
