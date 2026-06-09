// @ts-nocheck
import * as THREE from "three";
import { pickGpuBranchAsync } from "../../lib/render";

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

  uniform float uStrength;
  uniform float uGlowIntensity;
  uniform vec3 uGlowColor;
  uniform float uTime;
  uniform float uNoiseScale;
  uniform float uNoiseSpeed;
  uniform float uPulseRate;
  uniform float uDebugRed;

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
    vec2 centered = vUv - 0.5;
    float radial = length(centered) * 2.0;
    float falloff = 1.0 - smoothstep(0.0, 1.0, radial);

    if (uDebugRed > 0.5) {
      gl_FragColor = vec4(1.0, 0.0, 0.0, falloff * uStrength);
      return;
    }

    float liquid = valueNoise(vec3(centered * uNoiseScale, uTime * uNoiseSpeed));
    float pulse = sin(uTime * uPulseRate + liquid * 3.0) * 0.5 + 0.5;
    float glowMix = mix(0.4, 1.0, liquid * 0.6 + pulse * 0.4);
    vec3 rgb = uGlowColor * glowMix * uGlowIntensity;
    gl_FragColor = vec4(rgb, falloff * uStrength);
  }
`;

function createCpuUniforms(config) {
  return {
    uStrength: { value: 0 },
    uGlowIntensity: { value: config.glowIntensity },
    uGlowColor: { value: new THREE.Color(config.glowColor) },
    uTime: { value: 0 },
    uNoiseScale: { value: config.noiseScale },
    uNoiseSpeed: { value: config.noiseSpeed },
    uPulseRate: { value: config.pulseRate },
    uDebugRed: { value: config.showDebugBlob ? 1 : 0 },
  };
}

function syncConfig(cpuUniforms, config) {
  cpuUniforms.uGlowIntensity.value = config.glowIntensity;
  cpuUniforms.uGlowColor.value.set(config.glowColor);
  cpuUniforms.uNoiseScale.value = config.noiseScale;
  cpuUniforms.uNoiseSpeed.value = config.noiseSpeed;
  cpuUniforms.uPulseRate.value = config.pulseRate;
  cpuUniforms.uDebugRed.value = config.showDebugBlob ? 1 : 0;
}

async function buildDecalMaterialWebGpu(cpuUniforms) {
  const { MeshBasicNodeMaterial } = await import("three/webgpu");
  const tsl = await import("three/tsl");
  const { Fn, float, vec3, vec4, uniform, uv, length, smoothstep, mix, sin, step, mx_noise_float } =
    tsl;

  const uStrength = uniform(cpuUniforms.uStrength.value);
  const uGlowIntensity = uniform(cpuUniforms.uGlowIntensity.value);
  const uGlowColor = uniform(cpuUniforms.uGlowColor.value);
  const uTime = uniform(cpuUniforms.uTime.value);
  const uNoiseScale = uniform(cpuUniforms.uNoiseScale.value);
  const uNoiseSpeed = uniform(cpuUniforms.uNoiseSpeed.value);
  const uPulseRate = uniform(cpuUniforms.uPulseRate.value);
  const uDebugRed = uniform(cpuUniforms.uDebugRed.value);

  const colorNode = Fn(() => {
    const uvCoord = uv();
    const centered = uvCoord.sub(0.5);
    const radial = length(centered).mul(2);
    const falloff = float(1).sub(smoothstep(float(0), float(1), radial));

    const liquid = mx_noise_float(vec3(centered.mul(uNoiseScale), uTime.mul(uNoiseSpeed)));
    const pulse = sin(uTime.mul(uPulseRate).add(liquid.mul(3)))
      .mul(0.5)
      .add(0.5);
    const glowMix = mix(float(0.4), float(1), liquid.mul(0.6).add(pulse.mul(0.4)));
    const glowRgb = uGlowColor.mul(glowMix).mul(uGlowIntensity);
    const debugRgb = vec3(1, 0, 0);
    const rgb = mix(glowRgb, debugRgb, step(float(0.5), uDebugRed));
    const alpha = falloff.mul(uStrength);
    return vec4(rgb, alpha);
  });

  const material = new MeshBasicNodeMaterial({
    transparent: true,
    depthTest: false,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  material.colorNode = colorNode();

  const gpuUniforms = {
    uStrength,
    uGlowIntensity,
    uGlowColor,
    uTime,
    uNoiseScale,
    uNoiseSpeed,
    uPulseRate,
    uDebugRed,
  };

  return {
    material,
    updateUniforms: (uniforms) => {
      gpuUniforms.uStrength.value = uniforms.uStrength.value;
      gpuUniforms.uGlowIntensity.value = uniforms.uGlowIntensity.value;
      gpuUniforms.uGlowColor.value.copy(uniforms.uGlowColor.value);
      gpuUniforms.uTime.value = uniforms.uTime.value;
      gpuUniforms.uNoiseScale.value = uniforms.uNoiseScale.value;
      gpuUniforms.uNoiseSpeed.value = uniforms.uNoiseSpeed.value;
      gpuUniforms.uPulseRate.value = uniforms.uPulseRate.value;
      gpuUniforms.uDebugRed.value = uniforms.uDebugRed.value;
    },
    dispose: () => material.dispose(),
  };
}

function buildDecalMaterialWebGl(cpuUniforms) {
  const material = new THREE.ShaderMaterial({
    uniforms: cpuUniforms,
    vertexShader: WEBGL_VERT,
    fragmentShader: WEBGL_FRAG,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  return {
    material,
    updateUniforms: (uniforms) => {
      cpuUniforms.uStrength.value = uniforms.uStrength.value;
      cpuUniforms.uGlowIntensity.value = uniforms.uGlowIntensity.value;
      cpuUniforms.uGlowColor.value.copy(uniforms.uGlowColor.value);
      cpuUniforms.uTime.value = uniforms.uTime.value;
      cpuUniforms.uNoiseScale.value = uniforms.uNoiseScale.value;
      cpuUniforms.uNoiseSpeed.value = uniforms.uNoiseSpeed.value;
      cpuUniforms.uPulseRate.value = uniforms.uPulseRate.value;
      cpuUniforms.uDebugRed.value = uniforms.uDebugRed.value;
    },
    dispose: () => material.dispose(),
  };
}

export async function buildWallHoverDecalMaterial(gl, config) {
  const cpuUniforms = createCpuUniforms(config);
  syncConfig(cpuUniforms, config);

  const api = await pickGpuBranchAsync(gl, {
    webgpu: () => buildDecalMaterialWebGpu(cpuUniforms),
    webgl: () => buildDecalMaterialWebGl(cpuUniforms),
  });

  return {
    material: api.material,
    cpuUniforms,
    applyConfig: (nextConfig) => {
      syncConfig(cpuUniforms, nextConfig);
      api.updateUniforms(cpuUniforms);
    },
    updateUniforms: () => api.updateUniforms(cpuUniforms),
    dispose: () => api.dispose(),
  };
}
