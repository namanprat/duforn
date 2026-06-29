import { getDeviceTier, type DeviceTier } from "./deviceTier";

export type PostFxMode = "off" | "grade";

export type QualityProfile = {
  maxDpr: number;
  postFxMode: PostFxMode;
  waterSimRes: number;
  causticsSize: number;
  waterPassInterval: number;
  shadowMapSize: number;
};

const PROFILES: Record<DeviceTier, QualityProfile> = {
  0: {
    maxDpr: 1,
    postFxMode: "off",
    waterSimRes: 0,
    causticsSize: 0,
    waterPassInterval: 4,
    shadowMapSize: 1024,
  },
  1: {
    maxDpr: 1,
    postFxMode: "grade",
    waterSimRes: 256,
    causticsSize: 0,
    waterPassInterval: 4,
    shadowMapSize: 1024,
  },
  2: {
    maxDpr: 1.5,
    postFxMode: "grade",
    waterSimRes: 384,
    causticsSize: 512,
    waterPassInterval: 2,
    shadowMapSize: 1536,
  },
  3: {
    maxDpr: 2,
    postFxMode: "grade",
    waterSimRes: 512,
    causticsSize: 768,
    waterPassInterval: 2,
    shadowMapSize: 2048,
  },
};

export function getQualityProfile(tier: DeviceTier = getDeviceTier()): QualityProfile {
  return PROFILES[tier];
}
