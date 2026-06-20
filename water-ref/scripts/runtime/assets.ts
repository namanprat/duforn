// @ts-nocheck
import {
  configureTexture,
  createColorFallbackTexture,
  loadTextureAsset,
} from "../../src/lib/assets";

export { configureTexture, createColorFallbackTexture, loadTextureAsset };

export function loadTextureAssets(urls, options = {}) {
  return Promise.all(urls.map((url) => loadTextureAsset(url, options)));
}
