import * as THREE from "three";
import { pickGpuBranchAsync } from "../../lib/render";
import {
  attachWebGLScreenClip,
  createScreenClipTslNode,
  screenClipInsideTsl,
} from "../../lib/screenClip";
import { MONEY_ME_STRIPS_BG } from "./config";

export type ScreenClipRef = {
  vec: THREE.Vector4;
  uniform: { value: THREE.Vector4 };
};

export async function buildStripMaterial(
  gl: THREE.WebGLRenderer,
  map: THREE.Texture,
  clip: ScreenClipRef,
  opacity = 1,
) {
  return pickGpuBranchAsync(gl, {
    webgpu: async () => {
      const { MeshBasicNodeMaterial } = await import("three/webgpu");
      const tsl = await import("three/tsl");
      const { texture: textureFn, uv, Fn, vec4, float, screenCoordinate } = tsl;
      const uClip = await createScreenClipTslNode(clip.vec);
      const material = new MeshBasicNodeMaterial({ transparent: true, toneMapped: false });

      const colorFn = Fn(() => {
        const sample = textureFn(map, uv());
        const inside = screenClipInsideTsl(tsl, uClip, screenCoordinate);
        const alpha = sample.a.mul(inside).mul(float(opacity));
        return vec4(sample.rgb, alpha);
      });

      material.colorNode = colorFn();
      return material;
    },
    webgl: () => {
      const material = new THREE.MeshBasicMaterial({
        map,
        transparent: true,
        toneMapped: false,
        opacity,
      });
      attachWebGLScreenClip(material, clip.uniform, "money-me-strips-clip");
      return material;
    },
  });
}

/** Solid gray backdrop, clipped to the same frame rect as the strips. */
export async function buildBackdropMaterial(gl: THREE.WebGLRenderer, clip: ScreenClipRef) {
  const color = new THREE.Color(MONEY_ME_STRIPS_BG);
  return pickGpuBranchAsync(gl, {
    webgpu: async () => {
      const { MeshBasicNodeMaterial } = await import("three/webgpu");
      const tsl = await import("three/tsl");
      const { Fn, vec4, screenCoordinate } = tsl;
      const uClip = await createScreenClipTslNode(clip.vec);
      const material = new MeshBasicNodeMaterial({
        transparent: true,
        toneMapped: false,
        depthTest: false,
        depthWrite: false,
      });

      const colorFn = Fn(() => {
        const inside = screenClipInsideTsl(tsl, uClip, screenCoordinate);
        return vec4(color.r, color.g, color.b, inside);
      });

      material.colorNode = colorFn();
      return material;
    },
    webgl: () => {
      const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        toneMapped: false,
        depthTest: false,
        depthWrite: false,
      });
      attachWebGLScreenClip(material, clip.uniform, "money-me-strips-clip");
      return material;
    },
  });
}
