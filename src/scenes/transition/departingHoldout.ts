import * as THREE from "three";

let holdoutTarget: THREE.WebGLRenderTarget | null = null;
let pendingResolve: ((texture: THREE.Texture) => void) | null = null;

const blitScene = new THREE.Scene();
const blitCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const blitMaterial = new THREE.MeshBasicMaterial({ toneMapped: false });
const blitMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), blitMaterial);
blitScene.add(blitMesh);

function ensureHoldoutTarget(width: number, height: number): THREE.WebGLRenderTarget {
  if (!holdoutTarget) {
    holdoutTarget = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      colorSpace: THREE.SRGBColorSpace,
    });
  }
  if (holdoutTarget.width !== width || holdoutTarget.height !== height) {
    holdoutTarget.setSize(width, height);
  }
  return holdoutTarget;
}

function copyRenderTarget(
  renderer: THREE.WebGLRenderer,
  source: THREE.WebGLRenderTarget,
  destination: THREE.WebGLRenderTarget,
): void {
  blitMaterial.map = source.texture;
  blitMaterial.needsUpdate = true;
  const prevTarget = renderer.getRenderTarget();
  renderer.setRenderTarget(destination);
  renderer.render(blitScene, blitCamera);
  renderer.setRenderTarget(prevTarget);
}

/** Resolve on the next composed frame (old route still mounted). */
export function requestDepartingHoldout(): Promise<THREE.Texture> {
  return new Promise((resolve) => {
    pendingResolve = resolve;
  });
}

/** Called from DissolveEffect.update while the departing route is still on screen. */
export function tryCaptureDepartingHoldout(
  renderer: THREE.WebGLRenderer,
  inputBuffer: THREE.WebGLRenderTarget,
): THREE.Texture | null {
  if (!pendingResolve) return null;

  const target = ensureHoldoutTarget(inputBuffer.width, inputBuffer.height);
  copyRenderTarget(renderer, inputBuffer, target);

  const texture = target.texture;
  const resolve = pendingResolve;
  pendingResolve = null;
  resolve(texture);
  return texture;
}
