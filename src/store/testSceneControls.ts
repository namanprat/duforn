import { create } from "zustand";

export type TestSceneControlsState = {
  modelScale: number;
  modelPosX: number;
  modelPosY: number;
  modelPosZ: number;
  modelRotX: number;
  modelRotY: number;
  modelRotZ: number;
  cameraFov: number;
  orbitCenterX: number;
  orbitCenterY: number;
  orbitCenterZ: number;
  orbitRadius: number;
  exposure: number;
  directionalIntensity: number;
  directionalX: number;
  directionalY: number;
  directionalZ: number;
  ambientIntensity: number;
  fillIntensity: number;
  rimIntensity: number;
  accentIntensity: number;
  roughnessScale: number;
  metalnessScale: number;
  envReflection: number;
  clearcoat: number;
  clearcoatRoughness: number;
  waterRoughness: number;
  waterMetalness: number;
  waterClearcoat: number;
  waterClearcoatRoughness: number;
  waterTransmission: number;
  waterThickness: number;
  waterIor: number;
  waterNormalScale: number;
  waterEnvReflection: number;
  waterDropRadius: number;
  waterInteractionStrength: number;
  patch: (next: Partial<Omit<TestSceneControlsState, "patch" | "reset">>) => void;
  reset: () => void;
};

export const defaultTestSceneControls = (): Omit<TestSceneControlsState, "patch" | "reset"> => ({
  modelScale: 13,
  modelPosX: 0,
  modelPosY: 0,
  modelPosZ: 0,
  modelRotX: 0,
  modelRotY: 0,
  modelRotZ: 0,
  cameraFov: 65,
  orbitCenterX: 0,
  orbitCenterY: 0.5,
  orbitCenterZ: 0,
  orbitRadius: 5,
  exposure: 1,
  directionalIntensity: 2.35,
  directionalX: 6,
  directionalY: 8,
  directionalZ: 4,
  ambientIntensity: 0.22,
  fillIntensity: 0.6,
  rimIntensity: 0.9,
  accentIntensity: 0.45,
  roughnessScale: 0.96,
  metalnessScale: 0.88,
  envReflection: 1.2,
  clearcoat: 0.05,
  clearcoatRoughness: 0.26,
  waterRoughness: 0.08,
  waterMetalness: 0.02,
  waterClearcoat: 1,
  waterClearcoatRoughness: 0.05,
  waterTransmission: 0.92,
  waterThickness: 0.5,
  waterIor: 1.333,
  waterNormalScale: 0.65,
  waterEnvReflection: 1.6,
  waterDropRadius: 0.028,
  waterInteractionStrength: 0.45,
});

export const useTestSceneControlsStore = create<TestSceneControlsState>((set, get) => ({
  ...defaultTestSceneControls(),
  patch: (next) => set((state) => ({ ...state, ...next })),
  reset: () =>
    set({
      ...defaultTestSceneControls(),
      patch: get().patch,
      reset: get().reset,
    }),
}));
