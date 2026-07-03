import * as THREE from "three";
import { SWATCH_LIGHT_RGB } from "./siteColors";
import { isKtx2Ready, ktx2UrlFor, loadKtx2Texture } from "./ktx2";

export interface TextureOptions {
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
  const { rgba = [...SWATCH_LIGHT_RGB, 255], ...textureOptions } = options;
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
    // Opt out of the .ktx2 variant. Our UASTC-encoded .ktx2 files are several
    // times larger than the source .webp, so for many-image scenes (archive)
    // the plain .webp downloads far faster — GPU compression isn't worth the
    // download penalty there. ponytail: real fix is a lighter encoder preset.
    preferKtx2?: boolean;
  } = {},
) {
  const {
    loader = new THREE.TextureLoader(),
    onErrorTexture = () => createColorFallbackTexture(),
    preferKtx2 = true,
    ...textureOptions
  } = options;

  const ktx2Url = ktx2UrlFor(url);
  if (preferKtx2 && ktx2Url && isKtx2Ready()) {
    return loadKtx2Texture(ktx2Url)
      .then((texture) => {
        texture.userData.ktx2 = true;
        return configureTexture(texture, {
          generateMipmaps: false,
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
          ...textureOptions,
        });
      })
      .catch(() => loadTextureWithLoader(url, loader, onErrorTexture, textureOptions));
  }

  return loadTextureWithLoader(url, loader, onErrorTexture, textureOptions);
}

function loadTextureWithLoader(
  url: string,
  loader: THREE.TextureLoader,
  onErrorTexture: THREE.Texture | (() => THREE.Texture),
  textureOptions: TextureOptions,
) {
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
