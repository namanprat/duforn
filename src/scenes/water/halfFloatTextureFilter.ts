import * as THREE from "three";

/** Scale ripple normals when half-float RTs cannot linear-filter (blocky nearest samples). */
export const HALF_FLOAT_BLOCKY_NORMAL_SCALE = 0.55;

// ponytail: probe once at RT creation; without OES_texture_half_float_linear drivers
// may nearest-sample HalfFloatType targets → stair-step normals on the water surface.
export function halfFloatSupportsLinearFilter(gl: THREE.WebGLRenderer) {
  const ctx = gl.getContext();
  return !!(
    ctx.getExtension("OES_texture_half_float_linear") ??
    ctx.getExtension("OES_texture_float_linear")
  );
}

export function halfFloatMinMagFilter(gl: THREE.WebGLRenderer) {
  return halfFloatSupportsLinearFilter(gl) ? THREE.LinearFilter : THREE.NearestFilter;
}

/** Reduce sim normalScale when height RT filtering is blocky. */
export function rippleNormalScaleForHeightTexture(
  gl: THREE.WebGLRenderer,
  baseNormalScale: number,
) {
  return halfFloatSupportsLinearFilter(gl) ? baseNormalScale : baseNormalScale * HALF_FLOAT_BLOCKY_NORMAL_SCALE;
}
