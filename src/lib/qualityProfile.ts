import { getDeviceTier, type DeviceTier } from "./deviceTier";

export type QualityProfile = {
  maxDpr: number;
  waterSimRes: number;
  causticsSize: number;
  waterPassInterval: number;
  waterBackdropInterval: number;
  planarReflectionScale: number;
  waterBackdropScale: number;
  shadowMapSize: number;
  stripCols: number;
  stripRows: number;
};

const PROFILES: Record<DeviceTier, QualityProfile> = {
  0: {
    maxDpr: 1,
    waterSimRes: 0,
    causticsSize: 0,
    waterPassInterval: 4,
    waterBackdropInterval: 2,
    planarReflectionScale: 0.35,
    waterBackdropScale: 0.5,
    shadowMapSize: 1536,
    stripCols: 64,
    stripRows: 32,
  },
  1: {
    maxDpr: 1,
    waterSimRes: 288,
    causticsSize: 0,
    waterPassInterval: 4,
    waterBackdropInterval: 2,
    planarReflectionScale: 0.32,
    waterBackdropScale: 0.52,
    shadowMapSize: 1536,
    stripCols: 64,
    stripRows: 32,
  },
  2: {
    maxDpr: 1.5,
    waterSimRes: 320,
    causticsSize: 448,
    waterPassInterval: 4,
    waterBackdropInterval: 2,
    planarReflectionScale: 0.38,
    waterBackdropScale: 0.55,
    shadowMapSize: 2048,
    stripCols: 80,
    stripRows: 40,
  },
  3: {
    maxDpr: 2,
    waterSimRes: 384,
    causticsSize: 640,
    waterPassInterval: 3,
    waterBackdropInterval: 1,
    planarReflectionScale: 0.46,
    waterBackdropScale: 0.58,
    shadowMapSize: 3072,
    stripCols: 96,
    stripRows: 48,
  },
};

export function getQualityProfile(tier: DeviceTier = getDeviceTier()): QualityProfile {
  return PROFILES[tier];
}
