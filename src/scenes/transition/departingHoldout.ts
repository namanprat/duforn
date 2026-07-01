import * as THREE from "three";

let holdoutTarget: THREE.WebGLRenderTarget | null = null;
let pendingResolve: ((texture: THREE.Texture) => void) | null = null;

const HOLDOUT_FALLBACK = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
HOLDOUT_FALLBACK.needsUpdate = true;
HOLDOUT_FALLBACK.colorSpace = THREE.SRGBColorSpace;

/** Solid black holdout — boot preloader departs from the overlay, not the live scene. */
export function getBlackHoldoutTexture(): THREE.Texture {
  return HOLDOUT_FALLBACK;
}

// ponytail: if the main canvas frameloop is paused, capture may never fire — timeout
// falls back to black; upgrade path is forcing frameloop during active dissolve.
const HOLDOUT_TIMEOUT_MS = 500;

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
    let settled = false;

    const finish = (texture: THREE.Texture) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      pendingResolve = null;
      resolve(texture);
    };

    const timeoutId = window.setTimeout(() => finish(HOLDOUT_FALLBACK), HOLDOUT_TIMEOUT_MS);

    pendingResolve = (texture) => finish(texture);
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
