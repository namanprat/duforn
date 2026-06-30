import { getDeviceTier, type DeviceTier } from "./deviceTier";

export type QualityProfile = {
  maxDpr: number;
  waterSimRes: number;
  causticsSize: number;
  waterPassInterval: number;
  shadowMapSize: number;
};

const PROFILES: Record<DeviceTier, QualityProfile> = {
  0: {
    maxDpr: 1,
    waterSimRes: 0,
    causticsSize: 0,
    waterPassInterval: 4,
    shadowMapSize: 1536,
  },
  1: {
    maxDpr: 1,
    waterSimRes: 256,
    causticsSize: 0,
    waterPassInterval: 4,
    shadowMapSize: 1536,
  },
  2: {
    maxDpr: 1.5,
    waterSimRes: 384,
    causticsSize: 512,
    waterPassInterval: 2,
    shadowMapSize: 2048,
  },
  3: {
    maxDpr: 2,
    waterSimRes: 512,
    causticsSize: 768,
    waterPassInterval: 2,
    shadowMapSize: 3072,
  },
};

export function getQualityProfile(tier: DeviceTier = getDeviceTier()): QualityProfile {
  return PROFILES[tier];
}
