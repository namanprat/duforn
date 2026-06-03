// @ts-nocheck
import * as THREE from "three";

/** GL pixel rect: x, y (bottom-left), width, height in drawing-buffer space. */
export function updateScreenClipRect(
  gl: THREE.WebGLRenderer,
  rect: DOMRect,
  target: THREE.Vector4,
) {
  const dpr = gl.getPixelRatio();
  const canvas = gl.domElement;
  const canvasRect = canvas.getBoundingClientRect();
  const left = (rect.left - canvasRect.left) * dpr;
  const bottom = (canvasRect.bottom - rect.bottom) * dpr;
  target.set(left, bottom, rect.width * dpr, rect.height * dpr);
}

export function attachWebGLScreenClip(
  material: THREE.Material,
  uniform: { value: THREE.Vector4 },
  cacheKey = "screen-clip",
) {
  material.customProgramCacheKey = () => cacheKey;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uScreenClip = uniform;
    shader.fragmentShader = `uniform vec4 uScreenClip;\n${shader.fragmentShader}`.replace(
      "void main() {",
      `void main() {
        if (
          gl_FragCoord.x < uScreenClip.x ||
          gl_FragCoord.x > uScreenClip.x + uScreenClip.z ||
          gl_FragCoord.y < uScreenClip.y ||
          gl_FragCoord.y > uScreenClip.y + uScreenClip.w
        ) {
          discard;
        }`,
    );
  };
}

export async function createScreenClipTslNode(vec: THREE.Vector4) {
  const { uniform } = await import("three/tsl");
  return uniform(vec);
}

export function screenClipInsideTsl(tsl, uClip, coord) {
  const { step } = tsl;
  return step(uClip.x, coord.x)
    .mul(step(coord.x, uClip.x.add(uClip.z)))
    .mul(step(uClip.y, coord.y))
    .mul(step(coord.y, uClip.y.add(uClip.w)));
}
