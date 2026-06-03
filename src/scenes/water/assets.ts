// @ts-nocheck
import * as THREE from "three";

/** Pool tiles + cubemap sky, copied from webgl-water-master into public/test/. */
export const WATER_TILE_URL = "/test/tiles.jpg";
export const WATER_CUBE_FACES = [
  "/test/xpos.jpg",
  "/test/xneg.jpg",
  "/test/ypos.jpg",
  "/test/yneg.jpg",
  "/test/zpos.jpg",
  "/test/zneg.jpg",
];

/** Tiled wall/floor texture — repeats, mipmapped, linear. */
export function loadTilesTexture(): THREE.Texture {
  const tex = new THREE.TextureLoader().load(WATER_TILE_URL);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.generateMipmaps = true;
  return tex;
}

/** Cubemap sky (face order matches THREE: +x,-x,+y,-y,+z,-z). */
export function loadSkyCubeTexture(): THREE.CubeTexture {
  const cube = new THREE.CubeTextureLoader().load(WATER_CUBE_FACES);
  cube.colorSpace = THREE.SRGBColorSpace;
  return cube;
}
