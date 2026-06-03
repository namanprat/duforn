// @ts-nocheck
import * as THREE from "three";
import { pickGpuBranchAsync } from "../../lib/render/dual";
import {
  attachWebGLScreenClip,
  createScreenClipTslNode,
  screenClipInsideTsl,
} from "../../lib/screenClip";

const SPIRAL_VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  void main() {
    vUv = uv;
    vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
  }
`;

const SPIRAL_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uCameraPosition;
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  void main() {
    vec4 tex = texture2D(uMap, vUv);
    vec3 viewDir = normalize(uCameraPosition - vWorldPosition);
    float facing = max(dot(-normalize(vWorldNormal), viewDir), 0.0);
    float falloff = smoothstep(-0.2, 0.5, facing) * 0.45 + 0.42;
    vec3 color = mix(vec3(1.0), tex.rgb * falloff, 0.975) * 1.25;
    gl_FragColor = vec4(color, tex.a);
  }
`;

export const spiralClipVec = new THREE.Vector4();
export const spiralClipUniform = { value: spiralClipVec };

export type SpiralMaterialSystem = {
  material: THREE.Material;
  uniforms: {
    uCameraPosition: { value: THREE.Vector3 };
    uScreenClip?: { value: THREE.Vector4 };
  };
  dispose: () => void;
};

async function buildWebGpuSpiralMaterial(tex: THREE.Texture): Promise<SpiralMaterialSystem> {
  const { MeshBasicNodeMaterial } = await import("three/webgpu");
  const tsl = await import("three/tsl");
  const {
    Fn,
    float,
    vec3,
    vec4,
    uniform,
    uv,
    texture,
    mix,
    smoothstep,
    max,
    dot,
    normalize,
    normalWorld,
    positionWorld,
    cameraPosition,
    screenCoordinate,
  } = tsl;

  const uCameraPosition = uniform(new THREE.Vector3(0, 0, 12));
  const uClip = await createScreenClipTslNode(spiralClipVec);

  const colorFn = Fn(() => {
    const texSample = texture(tex, uv());
    const viewDir = normalize(cameraPosition.sub(positionWorld));
    const facing = max(dot(normalWorld.negate(), viewDir), float(0));
    const falloff = smoothstep(float(-0.2), float(0.5), facing).mul(0.45).add(0.42);
    const color = mix(vec3(1), texSample.rgb.mul(falloff), float(0.975)).mul(1.25);
    const inside = screenClipInsideTsl(tsl, uClip, screenCoordinate);
    return vec4(color, texSample.a.mul(inside));
  });

  const material = new MeshBasicNodeMaterial({
    side: THREE.DoubleSide,
    transparent: true,
    toneMapped: false,
  });
  material.colorNode = colorFn();

  return {
    material,
    uniforms: { uCameraPosition, uScreenClip: spiralClipUniform },
    dispose: () => material.dispose?.(),
  };
}

function buildWebGlSpiralMaterial(tex: THREE.Texture): SpiralMaterialSystem {
  const uCameraPosition = { value: new THREE.Vector3(0, 0, 12) };
  const material = new THREE.ShaderMaterial({
    vertexShader: SPIRAL_VERT,
    fragmentShader: SPIRAL_FRAG,
    uniforms: {
      uMap: { value: tex },
      uCameraPosition,
    },
    side: THREE.DoubleSide,
    transparent: true,
    toneMapped: false,
  });
  attachWebGLScreenClip(material, spiralClipUniform, "about-spiral-clip");

  return {
    material,
    uniforms: { uCameraPosition, uScreenClip: spiralClipUniform },
    dispose: () => material.dispose?.(),
  };
}

export async function buildSpiralTileMaterial(
  gl: THREE.WebGLRenderer | unknown,
  tex: THREE.Texture,
): Promise<SpiralMaterialSystem> {
  return pickGpuBranchAsync(gl, {
    webgpu: () => buildWebGpuSpiralMaterial(tex),
    webgl: () => buildWebGlSpiralMaterial(tex),
  });
}
