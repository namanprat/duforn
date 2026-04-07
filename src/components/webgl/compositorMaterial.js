/**
 * Builds the fullscreen slide-up wipe material.
 *
 * Pure TSL NodeMaterial, lazy-imports `three/webgpu` + `three/tsl` so the
 * module graph stays consistent with Effects.jsx / ProjectBg.jsx.
 *
 * Wipe semantics:
 *   - uCurrentTex stays static at its own uv.
 *   - uNextTex slides up from below by offsetting uv.y by (1 - progress).
 *   - Hard step edge: the new scene is visible where uv.y <= progress.
 *
 * The caller gets back `{ material, setCurrentTexture, setNextTexture, setProgress }`
 * so the compositor can mutate these every frame without re-creating the material.
 */
export async function createCompositorMaterial() {
  const TSL = await import("three/tsl");
  const { NodeMaterial } = await import("three/webgpu");

  const { Fn, uniform, texture, uv, vec2, mix, step } = TSL;

  // The TextureNode keeps a mutable `.value` — assigning a new THREE.Texture
  // re-points the sampler without rebuilding the shader.
  const currentTexNode = texture(null);
  const nextTexNode = texture(null);
  const progressUniform = uniform(0);

  const material = new NodeMaterial();
  material.depthTest = false;
  material.depthWrite = false;
  material.transparent = false;

  material.colorNode = Fn(() => {
    const coord = uv();

    // Old scene: fixed at its own uv, static throughout the wipe.
    const oldColor = currentTexNode.sample(coord);

    // New scene: texture sampled at y + (1 - progress) so that at progress=0
    // we'd sample above the top (clipped by the mask below) and at progress=1
    // we sample the natural uv. The mask restricts visibility to the bottom band.
    const newCoord = vec2(coord.x, coord.y.add(1).sub(progressUniform));
    const newColor = nextTexNode.sample(newCoord);

    // Hard edge wipe: step(edge, x) = 1 when x >= edge. So step(uv.y, progress)
    // yields 1 in the bottom band (uv.y <= progress) where the new scene is visible.
    const mask = step(coord.y, progressUniform);

    return mix(oldColor, newColor, mask);
  })();

  return {
    material,
    setCurrentTexture: (tex) => {
      currentTexNode.value = tex;
    },
    setNextTexture: (tex) => {
      nextTexNode.value = tex;
    },
    setProgress: (p) => {
      progressUniform.value = p;
    },
  };
}
