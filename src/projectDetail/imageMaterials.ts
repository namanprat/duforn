// @ts-nocheck
import * as THREE from "three";

const WEBGL_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const WEBGL_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;

  uniform sampler2D uTex;
  uniform vec2 uUvScale;
  uniform vec2 uUvOffset;

  void main() {
    vec2 sampleCoord = vUv * uUvScale + uUvOffset;
    gl_FragColor = texture2D(uTex, sampleCoord);
  }
`;

/**
 * WebGPU TSL — flat texture sample for project-detail film planes (no reveal).
 */
export async function buildProjectDetailImageMaterialWebGpu(texture) {
  const tsl = await import("three/tsl");
  const { MeshBasicNodeMaterial } = await import("three/webgpu");
  const { uv, uniform, uniformTexture, texture: textureNode } = tsl;

  const uniforms = {
    uTex: uniformTexture(texture),
    uUvScale: uniform(new THREE.Vector2(1, 1)),
    uUvOffset: uniform(new THREE.Vector2(0, 0)),
  };

  const material = new MeshBasicNodeMaterial({
    transparent: true,
    depthWrite: false,
  });

  const coord = uv();
  const sampleCoord = coord.mul(uniforms.uUvScale).add(uniforms.uUvOffset);
  const sample = textureNode(uniforms.uTex, sampleCoord);
  material.colorNode = sample.rgb;
  material.opacityNode = sample.a;

  return { material, uniforms };
}

/**
 * WebGL ShaderMaterial — same flat sample as {@link buildProjectDetailImageMaterialWebGpu}.
 */
export function buildProjectDetailImageMaterialWebGl(texture) {
  const uniforms = {
    uTex: { value: texture },
    uUvScale: { value: new THREE.Vector2(1, 1) },
    uUvOffset: { value: new THREE.Vector2(0, 0) },
  };

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms,
    vertexShader: WEBGL_VERT,
    fragmentShader: WEBGL_FRAG,
  });

  return { material, uniforms };
}
