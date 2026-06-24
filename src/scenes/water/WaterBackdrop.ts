/**
 * Opaque-scene backdrop for the WebGL pool water.
 *
 * Samples the opaque scene color for refraction-style distortion.
 * scene color — to refract the pool basin through the ripples. WebGLRenderer has
 * no such buffer, so we render the scene (with the water hidden) to our own
 * target each frame and hand its texture to the water material.
 */
import * as THREE from "three";
import { REFLECTION_SCALE } from "./config/poolWaterDefaults";

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

    /** Render the scene without the water mesh into the backdrop target. */
    render(scene: THREE.Scene, camera: THREE.Camera, waterMesh: THREE.Object3D) {
      const prevVisible = waterMesh.visible;
      const prevTarget = gl.getRenderTarget();
      const prevBackground = scene.background;
      waterMesh.visible = false;
      scene.background = BACKDROP_CLEAR;
      gl.setRenderTarget(target);
      gl.setClearColor(BACKDROP_CLEAR, 1);
      gl.clear();
      // ponytail: re-renders the full scene once per frame for the backdrop.
      // Ceiling: extra full-scene draw. Upgrade: render only the caustics-receiver
      // basin meshes into the target if this shows up in the profile.
      gl.render(scene, camera);
      gl.setRenderTarget(prevTarget);
      scene.background = prevBackground;
      waterMesh.visible = prevVisible;
    },

    dispose() {
      target.dispose();
    },
  };
}
