/** Tunable glass-pane material params (dev Glass panel + applySceneGlass). */
export const DEFAULT_GLASS_CONTROLS = {
  color: "#243b45",
  transmission: 0.85,
  roughness: 0.05,
  metalness: 0,
  ior: 1.5,
  thickness: 0.4,
  envMapIntensity: 1.4,
  reflectivity: 0.55,
  opacity: 1,
};

export type GlassControls = typeof DEFAULT_GLASS_CONTROLS;
