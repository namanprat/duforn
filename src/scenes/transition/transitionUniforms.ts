import type { ShaderMaterial } from "three";

export type DissolveLayerUniforms = {
  uDissolve: { value: number };
  uGrayscale: { value: number };
  uEdgeIntensity: { value: number };
  uEdgeBrightness: { value: number };
  uTime: { value: number };
};

export type ReverseLayerUniforms = {
  uEdgeIntensity: { value: number };
  uDarkness: { value: number };
  uGrayscale: { value: number };
  uTime: { value: number };
};

export function dissolveProgressToLayer1(progress: number) {
  return {
    uDissolve: progress,
    uGrayscale: Math.min(1, progress / 0.4),
    uEdgeIntensity: progress * 0.5,
    uEdgeBrightness: 1 - progress,
  };
}

export type BottomRevealMode = "fade" | "destination";

export function dissolveProgressToLayer2(progress: number, reveal: BottomRevealMode = "fade") {
  if (reveal === "destination") {
    return {
      uEdgeIntensity: 0.6 * (1 - progress),
      uDarkness: 0,
      uGrayscale: 0,
    };
  }
  const accelerated = Math.min(1, progress * 1.1);
  return {
    uEdgeIntensity: 0.6 * (1 - accelerated),
    uDarkness: 1 - accelerated,
    uGrayscale: 1 - accelerated,
  };
}

export function applyDissolveUniforms(
  topMaterial: ShaderMaterial,
  bottomMaterial: ShaderMaterial,
  progress: number,
  timeSeconds: number,
  bottomReveal: BottomRevealMode = "fade",
): void {
  const layer1 = dissolveProgressToLayer1(progress);
  const top = topMaterial.uniforms as DissolveLayerUniforms;
  top.uDissolve.value = layer1.uDissolve;
  top.uGrayscale.value = layer1.uGrayscale;
  top.uEdgeIntensity.value = layer1.uEdgeIntensity;
  top.uEdgeBrightness.value = layer1.uEdgeBrightness;
  top.uTime.value = timeSeconds;

  const layer2 = dissolveProgressToLayer2(progress, bottomReveal);
  const bottom = bottomMaterial.uniforms as ReverseLayerUniforms;
  bottom.uEdgeIntensity.value = layer2.uEdgeIntensity;
  bottom.uDarkness.value = layer2.uDarkness;
  bottom.uGrayscale.value = layer2.uGrayscale;
  bottom.uTime.value = timeSeconds;
}
