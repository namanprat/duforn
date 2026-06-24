/**
 * Opaque-scene backdrop for the WebGL pool water.
 *
 * Samples the opaque scene color for refraction-style distortion.
 * scene color — to refract the pool basin through the ripples. WebGLRenderer has
 * no such buffer, so we render the scene (with the water hidden) to our own
 * target each frame and hand its texture to the water material.
 */
import * as THREE from "three";
import { REFLECTION_SCALE, WATER_BASIN_LAYER } from "./config/poolWaterDefaults";

/** Matches Env fallback — keeps refracted pool reads as basin, not raw HDRI sky. */
const BACKDROP_CLEAR = new THREE.Color(0xe8e6de);

/** Scale a drawing-buffer dimension down to the backdrop render-target size. */
const rtDim = (px: number) => Math.max(1, Math.floor(px * REFLECTION_SCALE));

export type WaterBackdrop = ReturnType<typeof createWaterBackdrop>;

export function createWaterBackdrop(gl: THREE.WebGLRenderer) {
  const size = gl.getDrawingBufferSize(new THREE.Vector2());
  const target = new THREE.WebGLRenderTarget(rtDim(size.x), rtDim(size.y), {
    type: THREE.UnsignedByteType,
    depthBuffer: true,
    stencilBuffer: false,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    generateMipmaps: false,
  });
  target.texture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());

  const prev = gl.getRenderTarget();
  gl.setRenderTarget(target);
  gl.clear();
  gl.setRenderTarget(prev);

  const tmp = new THREE.Vector2();
  // Basin-only camera: copies the main camera each frame but renders solely the
  // WATER_BASIN_LAYER (pool floor/walls). The water sits on layer 0, so it is
  // excluded here without any visible toggling.
  const basinCam = new THREE.PerspectiveCamera();
  basinCam.layers.set(WATER_BASIN_LAYER);

  return {
    get texture() {
      return target.texture;
    },

    resize() {
      gl.getDrawingBufferSize(tmp);
      const w = rtDim(tmp.x);
      const h = rtDim(tmp.y);
      if (w !== target.width || h !== target.height) {
        target.setSize(w, h);
      }
    },

    /** Render the basin (refraction backdrop) into the target. */
    render(scene: THREE.Scene, camera: THREE.Camera) {
      const prevTarget = gl.getRenderTarget();
      const prevBackground = scene.background;
      // ponytail: backdrop draws only the basin layer, not the whole scene.
      // Ceiling: refraction shows only basin geometry (fine for a near-flat
      // surface). Upgrade: widen the layer set if grazing-angle refraction needs
      // above-water geometry.
      basinCam.copy(camera as THREE.PerspectiveCamera);
      basinCam.layers.set(WATER_BASIN_LAYER);
      scene.background = BACKDROP_CLEAR;
      gl.setRenderTarget(target);
      gl.setClearColor(BACKDROP_CLEAR, 1);
      gl.clear();
      gl.render(scene, basinCam);
      gl.setRenderTarget(prevTarget);
      scene.background = prevBackground;
    },

    dispose() {
      target.dispose();
    },
  };
}
