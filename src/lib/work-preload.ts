import * as THREE from "three";
import { workItems } from "../content/work-items";
import { loadTextureAsset } from "./assets";

const workTextureCache = new Map<string, THREE.Texture>();

export function getPreloadedTextures(urls: string[]) {
  const result = urls.map((url) => workTextureCache.get(url) || null);
  return result.every(Boolean) ? (result as THREE.Texture[]) : null;
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
