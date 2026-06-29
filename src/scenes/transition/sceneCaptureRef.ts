import type { Camera, Scene, WebGLRenderer } from "three";

export const sceneCaptureRef: {
  gl: WebGLRenderer | null;
  scene: Scene | null;
  camera: Camera | null;
} = {
  gl: null,
  scene: null,
  camera: null,
};
