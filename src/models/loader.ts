// @ts-nocheck
import * as THREE from "three";
import { KTX2Loader } from "three/addons/loaders/KTX2Loader.js";

/**
 * Shared GLTF loader extension. Drei's useGLTF auto-wires Draco + Meshopt
 * decoders from a CDN; we only need to extend it with KTX2 for our compressed
 * textures (basis-encoded). The transcoder WASM lives under public/decoders/basis/.
 */

let ktx2Loader: KTX2Loader | null = null;
let ktx2Detected = false;

function ensureKtx2(renderer: THREE.WebGLRenderer | null): KTX2Loader {
  if (!ktx2Loader) {
    ktx2Loader = new KTX2Loader().setTranscoderPath("/decoders/basis/");
  }
  if (!ktx2Detected && renderer && typeof renderer.capabilities !== "undefined") {
    ktx2Loader.detectSupport(renderer);
    ktx2Detected = true;
  }
  return ktx2Loader;
}

/**
 * Bridge for the active R3F renderer. Canvas set this on createRendererOpaque;
 * the KTX2 loader needs it to detect the supported transcoded texture format
 * (ASTC/ETC/BC7/...). Without it, KTX2 still loads but always falls back to RGBA.
 */
export function registerLoaderRenderer(renderer: THREE.WebGLRenderer | null) {
  if (renderer) ensureKtx2(renderer);
}

/**
 * Pass to useGLTF: (url, useDraco, useMeshOpt, extendLoader).
 * extendLoader runs once per GLTFLoader instance — drei caches one per URL set.
 */
export const extendGltfLoader = (loader: { setKTX2Loader?: (l: KTX2Loader) => unknown }) => {
  // Use a no-op renderer if one isn't ready yet — KTX2 will still load,
  // and detectSupport gets re-run when registerLoaderRenderer fires.
  if (loader.setKTX2Loader) loader.setKTX2Loader(ensureKtx2(null));
};

/**
 * Legacy export retained for back-compat with generated gltfjsx files.
 * Used as the 2nd arg to useGLTF (= useDraco). `true` keeps drei's default Draco wiring.
 */
export const gltfLoaderOptions = true;
