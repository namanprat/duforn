import * as THREE from "three";
import { workItems } from "../data/work-items.js";
import { preloader } from "./preloader.js";
import { loadTextureAsset } from "./runtime/assets.js";

export const workTextureCache = new Map();

/**
 * Returns preloaded textures for the given URLs, or null if any are missing.
 */
export function getPreloadedTextures(urls) {
  const result = urls.map((url) => workTextureCache.get(url) || null);
  return result.every(Boolean) ? result : null;
}

/**
 * Load all work strip textures into the persistent cache during the preloader window.
 * Called on initial page load so textures are ready
 * before the user ever navigates to the work page.
 */
export function startWorkTexturePreload() {
  preloader.hold();
  const uniqueImages = [...new Set(workItems.map((item) => item.image).filter(Boolean))];

  Promise.all(
    uniqueImages.map((src) => {
      if (workTextureCache.has(src)) return Promise.resolve();
      return loadTextureAsset(src, {
        wrapS: THREE.MirroredRepeatWrapping,
        wrapT: THREE.MirroredRepeatWrapping,
      }).then((texture) => {
        workTextureCache.set(src, texture);
      });
    }),
  ).finally(() => preloader.release());
}
