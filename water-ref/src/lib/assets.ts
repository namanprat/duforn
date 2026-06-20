// @ts-nocheck
import * as THREE from "three";

export function configureTexture(texture, options = {}) {
  if (!texture) return texture;

  const {
    colorSpace = THREE.SRGBColorSpace,
    minFilter = THREE.LinearMipmapLinearFilter,
    magFilter = THREE.LinearFilter,
    generateMipmaps = true,
    wrapS,
    wrapT,
    renderer = null,
    anisotropy = null,
  } = options;

  texture.colorSpace = colorSpace;
  texture.minFilter = minFilter;
  texture.magFilter = magFilter;
  texture.generateMipmaps = generateMipmaps;

  if (wrapS !== undefined) texture.wrapS = wrapS;
  if (wrapT !== undefined) texture.wrapT = wrapT;

  const resolvedAnisotropy = anisotropy ?? renderer?.capabilities?.getMaxAnisotropy?.() ?? null;
  if (resolvedAnisotropy) texture.anisotropy = resolvedAnisotropy;

  texture.needsUpdate = true;
  return texture;
}

export function createColorFallbackTexture(options = {}) {
  const { rgba = [220, 218, 210, 255], ...textureOptions } = options;
  const texture = new THREE.DataTexture(new Uint8Array(rgba), 1, 1, THREE.RGBAFormat);
  return configureTexture(texture, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    generateMipmaps: false,
    ...textureOptions,
  });
}

export function loadTextureAsset(url, options = {}) {
  const {
    loader = new THREE.TextureLoader(),
    onErrorTexture = () => createColorFallbackTexture(),
    ...textureOptions
  } = options;

  return new Promise((resolve) => {
    loader.load(
      url,
      (texture) => resolve(configureTexture(texture, textureOptions)),
      undefined,
      () => resolve(typeof onErrorTexture === "function" ? onErrorTexture() : onErrorTexture),
    );
  });
}
