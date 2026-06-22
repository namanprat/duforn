import * as THREE from "three";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";

import { POOL_WATER_DEFAULTS } from "../config/poolWaterDefaults";

/**
 * Equirectangular HDR for water sky reflections.
 * ponytail: sampler2D + equirect UVs — PMREM cubeUV is a 2D layout and breaks samplerCube binds.
 */
export async function loadWaterReflectionCubemap(
  _renderer: THREE.WebGLRenderer,
  url = POOL_WATER_DEFAULTS.reflectionCubemapUrl,
): Promise<THREE.Texture | null> {
  try {
    const hdr = await new HDRLoader().loadAsync(url);
    hdr.mapping = THREE.EquirectangularReflectionMapping;
    hdr.needsUpdate = true;
    return hdr;
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn("[loadWaterReflectionCubemap] failed, using backdrop-only reflections", err);
    }
    return null;
  }
}
