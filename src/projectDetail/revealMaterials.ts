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
  uniform float uReveal;
  uniform float uEdge;
  uniform float uNoiseScale;
  uniform float uNoiseStrength;
  uniform float uGreyLevel;
  uniform float uTime;
  uniform vec2 uUvScale;
  uniform vec2 uUvOffset;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 345.45));
    p += dot(p, p + 34.345);
    return fract(p.x * p.y);
  }

  float valueNoise(vec3 p) {
    vec2 pxy = p.xy + p.z * 17.0;
    vec2 i = floor(pxy);
    vec2 f = fract(pxy);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  void main() {
    vec2 sampleCoord = vUv * uUvScale + uUvOffset;
    vec4 sample = texture2D(uTex, sampleCoord);
    float animatedNoise = valueNoise(
      vec3(vUv * uNoiseScale, uTime * 0.08 + vUv.y * 0.35)
    );
    float threshold = vUv.x + animatedNoise * uNoiseStrength;
    float sweep = smoothstep(-1.0, 1.0, uReveal * 2.0 - 1.0) * (1.0 + uEdge * 2.0) - uEdge;
    float progress = sweep - threshold;
    float resolved = smoothstep(0.0, uEdge, progress);
    float luma = dot(sample.rgb, vec3(0.299, 0.587, 0.114));
    vec3 grey = vec3(luma * uGreyLevel);
    vec3 rgb = mix(grey, sample.rgb, resolved);
    float visible = smoothstep(-uEdge * 0.8, uEdge * 0.18, progress);
    gl_FragColor = vec4(rgb, visible * sample.a);
  }
`;

/**
 * WebGPU TSL — horizontal noise reveal for project-detail film planes.
 */
export async function buildProjectDetailRevealMaterialWebGpu(texture) {
  const tsl = await import("three/tsl");
  const { MeshBasicNodeMaterial } = await import("three/webgpu");
  const {
    Fn,
    float,
    vec3,
    vec4,
    uv,
    uniform,
    uniformTexture,
    texture: textureNode,
    mix,
    smoothstep,
    dot,
    mx_noise_float,
  } = tsl;

  const uniforms = {
    uTex: uniformTexture(texture),
    uReveal: uniform(0),
    uEdge: uniform(0.12),
    uNoiseScale: uniform(10.0),
    uNoiseStrength: uniform(0.15),
    uGreyLevel: uniform(0.55),
    uTime: uniform(0),
    uUvScale: uniform(new THREE.Vector2(1, 1)),
    uUvOffset: uniform(new THREE.Vector2(0, 0)),
  };

  const material = new MeshBasicNodeMaterial({
    transparent: true,
    depthWrite: false,
  });

  const revealFn = Fn(() => {
    const coord = uv();
    const sampleCoord = coord.mul(uniforms.uUvScale).add(uniforms.uUvOffset);
    const sample = textureNode(uniforms.uTex, sampleCoord);
    const animatedNoise = mx_noise_float(
      vec3(coord.mul(uniforms.uNoiseScale), uniforms.uTime.mul(0.08).add(coord.y.mul(0.35))),
    );
    const threshold = coord.x.add(animatedNoise.mul(uniforms.uNoiseStrength));
    const sweep = smoothstep(float(-1), float(1), uniforms.uReveal.mul(2).sub(1))
      .mul(float(1).add(uniforms.uEdge.mul(2)))
      .sub(uniforms.uEdge);
    const progress = sweep.sub(threshold);
    const resolved = smoothstep(float(0), uniforms.uEdge, progress);
    const visible = smoothstep(
      uniforms.uEdge.negate().mul(0.8),
      uniforms.uEdge.mul(0.18),
      progress,
    );
    const luma = dot(sample.rgb, vec3(0.299, 0.587, 0.114));
    const grey = vec3(luma.mul(uniforms.uGreyLevel));
    const rgb = mix(grey, sample.rgb, resolved);
    return vec4(rgb, visible.mul(sample.a));
  });

  const revealNode = revealFn();
  material.colorNode = revealNode.xyz;
  material.opacityNode = revealNode.w;

  return { material, uniforms };
}

/**
 * WebGL ShaderMaterial — same reveal as {@link buildProjectDetailRevealMaterialWebGpu}.
 */
export function buildProjectDetailRevealMaterialWebGl(texture) {
  const uniforms = {
    uTex: { value: texture },
    uReveal: { value: 0 },
    uEdge: { value: 0.12 },
    uNoiseScale: { value: 10.0 },
    uNoiseStrength: { value: 0.15 },
    uGreyLevel: { value: 0.55 },
    uTime: { value: 0 },
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
