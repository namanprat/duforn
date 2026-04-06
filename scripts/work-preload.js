import * as THREE from "three";
import { workItems } from "../data/work-items.js";
import { loadTextureAsset } from "./runtime/assets.js";

const workTextureCache = new Map();

export function getPreloadedTextures(urls) {
  const result = urls.map((url) => workTextureCache.get(url) || null);
  return result.every(Boolean) ? result : null;
}

export function startWorkTexturePreload() {
  const uniqueImages = [...new Set(workItems.map((item) => item.image).filter(Boolean))];

  return Promise.all(
    uniqueImages.map((src) => {
      if (workTextureCache.has(src)) return Promise.resolve();
      return loadTextureAsset(src, {
        wrapS: THREE.MirroredRepeatWrapping,
        wrapT: THREE.MirroredRepeatWrapping,
      }).then((texture) => {
        workTextureCache.set(src, texture);
      });
    }),
  );
}
