import {
  applyDissolveUniforms,
  dissolveProgressToLayer1,
  dissolveProgressToLayer2,
} from "./transitionUniforms";

export function transitionUniformsSelfCheck(): void {
  const p0 = dissolveProgressToLayer1(0);
  console.assert(p0.uDissolve === 0 && p0.uGrayscale === 0 && p0.uEdgeBrightness === 1, "layer1 @0");

  const p04 = dissolveProgressToLayer1(0.4);
  console.assert(p04.uGrayscale === 1, "layer1 grayscale @0.4");

  const p1 = dissolveProgressToLayer1(1);
  console.assert(p1.uDissolve === 1 && p1.uEdgeBrightness === 0, "layer1 @1");

  const l2start = dissolveProgressToLayer2(0);
  console.assert(l2start.uDarkness === 1 && l2start.uGrayscale === 1, "layer2 @0");

  const l2end = dissolveProgressToLayer2(1);
  console.assert(l2end.uDarkness === 0 && l2end.uGrayscale === 0, "layer2 @1");

  const dest = dissolveProgressToLayer2(0, "destination");
  console.assert(dest.uDarkness === 0 && dest.uGrayscale === 0, "destination reveal @0");

  const top = {
    uniforms: {
      uDissolve: { value: -1 },
      uGrayscale: { value: -1 },
      uEdgeIntensity: { value: -1 },
      uEdgeBrightness: { value: -1 },
      uTime: { value: -1 },
    },
  };
  const bottom = {
    uniforms: {
      uEdgeIntensity: { value: -1 },
      uDarkness: { value: -1 },
      uGrayscale: { value: -1 },
      uTime: { value: -1 },
    },
  };
  applyDissolveUniforms(top as never, bottom as never, 0.5, 1.25);
  console.assert(top.uniforms.uDissolve.value === 0.5, "applyDissolveUniforms writes top");
}

if (import.meta.env.DEV) transitionUniformsSelfCheck();
