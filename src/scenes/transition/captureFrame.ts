import * as THREE from "three";
import { sceneCaptureRef } from "./sceneCaptureRef";

export function captureGlFrame(): THREE.CanvasTexture | null {
  const { gl, scene, camera } = sceneCaptureRef;
  if (!gl || !scene || !camera) return null;

  gl.render(scene, camera);
  const texture = new THREE.CanvasTexture(gl.domElement);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export function imageSizeFromTexture(texture: THREE.Texture): THREE.Vector2 {
  const image = texture.image as { width?: number; height?: number } | undefined;
  const w = image?.width ?? window.innerWidth;
  const h = image?.height ?? window.innerHeight;
  return new THREE.Vector2(w, h);
}

export function disposeTexture(texture: THREE.Texture | null): void {
  texture?.dispose();
}
