import * as THREE from "three";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";

let loader: KTX2Loader | null = null;
let supportReady = false;

export function initKtx2Support(renderer: THREE.WebGLRenderer): void {
  if (!loader) {
    loader = new KTX2Loader();
    loader.setTranscoderPath("/basis/");
  }
  if (!supportReady) {
    loader.detectSupport(renderer);
    supportReady = true;
  }
}

export function isKtx2Ready(): boolean {
  return supportReady && loader !== null;
}

export function ktx2UrlFor(url: string): string | null {
  return /\.webp$/i.test(url) ? url.replace(/\.webp$/i, ".ktx2") : null;
}

export function loadKtx2Texture(url: string): Promise<THREE.Texture> {
  if (!loader || !supportReady) {
    return Promise.reject(new Error("KTX2 loader not initialized"));
  }
  return loader.loadAsync(url).then((texture) => {
    texture.flipY = false;
    return texture;
  });
}
