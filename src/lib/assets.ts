import * as THREE from "three";

interface TextureOptions {
  colorSpace?: THREE.ColorSpace;
  minFilter?: THREE.TextureFilter;
  magFilter?: THREE.TextureFilter;
  generateMipmaps?: boolean;
  wrapS?: THREE.Wrapping;
  wrapT?: THREE.Wrapping;
  renderer?: THREE.WebGLRenderer | null;
  anisotropy?: number | null;
}

export function configureTexture(texture: THREE.Texture, options: TextureOptions = {}) {
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

export function createColorFallbackTexture(options: TextureOptions & { rgba?: number[] } = {}) {
  const { rgba = [220, 218, 210, 255], ...textureOptions } = options;
  const texture = new THREE.DataTexture(new Uint8Array(rgba), 1, 1, THREE.RGBAFormat);
  texture.premultiplyAlpha = false;
  return configureTexture(texture, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    generateMipmaps: false,
    ...textureOptions,
  });
}

export function loadTextureAsset(
  url: string,
  options: TextureOptions & {
    loader?: THREE.TextureLoader;
    onErrorTexture?: THREE.Texture | (() => THREE.Texture);
  } = {},
) {
  const {
    loader = new THREE.TextureLoader(),
    onErrorTexture = () => createColorFallbackTexture(),
    ...textureOptions
  } = options;

  return new Promise<THREE.Texture>((resolve) => {
    loader.load(
      url,
      (texture) => resolve(configureTexture(texture, textureOptions)),
      undefined,
      () => {
        const fallback =
          typeof onErrorTexture === "function"
            ? (onErrorTexture as () => THREE.Texture)()
            : onErrorTexture;
        resolve(fallback);
      },
    );
  });
}
