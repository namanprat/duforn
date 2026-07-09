/**
 * Planar reflection render target for pool water.
 *
 * Renders the scene from a camera mirrored across the horizontal water plane.
 * The water shader samples this via projective texture coordinates (mirror VP matrix).
 */
import * as THREE from "three";
import { getWaterQuality } from "./config/poolWaterDefaults";

const CLIP_BIAS = new THREE.Matrix4().set(0.5, 0.0, 0.0, 0.5, 0.0, 0.5, 0.0, 0.5, 0.0, 0.0, 0.5, 0.5, 0.0, 0.0, 0.0, 1.0);

/** Scale a drawing-buffer dimension down to the planar reflection RT size (tier-gated). */
const rtDim = (px: number) => Math.max(1, Math.floor(px * getWaterQuality().planarReflectionScale));

const tmpCamPos = new THREE.Vector3();
const tmpLookAt = new THREE.Vector3();
const tmpDir = new THREE.Vector3();
const tmpMirrorLookAt = new THREE.Vector3();
const tmpUp = new THREE.Vector3();
const clipPlane = new THREE.Plane();

export type WaterPlanarReflection = ReturnType<typeof createWaterPlanarReflection>;

export function createWaterPlanarReflection(gl: THREE.WebGLRenderer) {
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

  const mirrorCamera = new THREE.PerspectiveCamera();
  const textureMatrix = new THREE.Matrix4();
  const tmp = new THREE.Vector2();

  function updateMirrorCamera(camera: THREE.Camera, waterY: number) {
    const src = camera as THREE.PerspectiveCamera;
    camera.getWorldPosition(tmpCamPos);
    mirrorCamera.position.set(tmpCamPos.x, 2 * waterY - tmpCamPos.y, tmpCamPos.z);

    camera.getWorldDirection(tmpDir);
    tmpLookAt.copy(tmpCamPos).add(tmpDir);
    tmpMirrorLookAt.set(tmpLookAt.x, 2 * waterY - tmpLookAt.y, tmpLookAt.z);

    tmpUp.set(0, 1, 0).applyQuaternion(camera.quaternion);
    tmpUp.y *= -1;
    mirrorCamera.up.copy(tmpUp);
    mirrorCamera.lookAt(tmpMirrorLookAt);

    mirrorCamera.near = src.near;
    mirrorCamera.far = src.far;
    mirrorCamera.fov = src.fov;
    mirrorCamera.aspect = src.aspect;
    mirrorCamera.updateProjectionMatrix();
    mirrorCamera.updateMatrixWorld();
  }

  function updateTextureMatrix() {
    textureMatrix.copy(CLIP_BIAS).multiply(mirrorCamera.projectionMatrix).multiply(mirrorCamera.matrixWorldInverse);
  }

  return {
    get texture() {
      return target.texture;
    },

    getTextureMatrix(out = textureMatrix) {
      return out.copy(textureMatrix);
    },

    resize() {
      gl.getDrawingBufferSize(tmp);
      const w = rtDim(tmp.x);
      const h = rtDim(tmp.y);
      if (w !== target.width || h !== target.height) {
        target.setSize(w, h);
      }
    },

    /** Mirror-camera render of the scene (water hidden) for planar reflections. */
    render(scene: THREE.Scene, camera: THREE.Camera, waterMesh: THREE.Object3D, waterY: number) {
      const prevVisible = waterMesh.visible;
      const prevTarget = gl.getRenderTarget();
      const prevClipping = gl.localClippingEnabled;
      const prevClipPlanes = gl.clippingPlanes;

      waterMesh.visible = false;
      updateMirrorCamera(camera, waterY);
      updateTextureMatrix();

      // Clip underwater geometry (y < waterY).
      clipPlane.setComponents(0, 1, 0, -waterY);

      gl.localClippingEnabled = true;
      gl.clippingPlanes = [clipPlane];
      gl.setRenderTarget(target);
      gl.clear();
      // ponytail: second full-scene draw each frame (backdrop is the first).
      // Upgrade: layer-masked render or merged pass if profiling shows cost.
      gl.render(scene, mirrorCamera);
      gl.setRenderTarget(prevTarget);
      gl.localClippingEnabled = prevClipping;
      gl.clippingPlanes = prevClipPlanes;
      waterMesh.visible = prevVisible;
    },

    dispose() {
      target.dispose();
    },
  };
}
