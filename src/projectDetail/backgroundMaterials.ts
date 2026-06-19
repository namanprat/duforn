import * as THREE from "three";

type FallbackControls = {
  swirlStrength: number;
  swirlDensity: number;
  distortion: number;
  pointerInfluence: number;
  fadeStrength: number;
  largeNoiseScale: number;
  mediumNoiseScale: number;
  fineNoiseScale: number;
  colorOuter: string;
  colorMid: string;
  colorCore: string;
  colorShade: string;
};

const VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform vec2 uVelocity;
uniform float uSwirlStrength;
uniform float uSwirlDensity;
uniform float uDistortion;
uniform float uPointerInfluence;
uniform float uFadeStrength;
uniform float uLargeNoiseScale;
uniform float uMediumNoiseScale;
uniform float uFineNoiseScale;
uniform vec3 uColorOuter;
uniform vec3 uColorMid;
uniform vec3 uColorCore;
uniform vec3 uColorShade;

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
  float aspect = max(uResolution.x / max(uResolution.y, 1.0), 1.0);
  vec2 coord = (vUv - 0.5) * vec2(aspect, 1.0);
  vec2 pointer = vec2(uPointer.x * aspect, uPointer.y);
  float velocity = clamp(length(uVelocity) * 14.0, 0.0, 1.0);
  vec2 pointerShift = pointer * uPointerInfluence;
  float radial = length(coord * vec2(0.88, 1.12));
  float envelope = 1.0 - smoothstep(0.18, 1.18, radial);

  vec2 swirl = vec2(
    sin(coord.y * uSwirlDensity + coord.x * 1.8 + uTime * 0.12 + radial * 4.2),
    cos(coord.x * uSwirlDensity * 0.92 - coord.y * 1.4 - uTime * 0.1 - radial * 3.4)
  ) * uSwirlStrength * (envelope + 0.2);

  vec2 warped = coord + pointerShift + swirl;
  float largeNoise = valueNoise(vec3(warped * uLargeNoiseScale, uTime * 0.08));
  float mediumNoise = valueNoise(vec3((warped + vec2(largeNoise * 0.2, largeNoise * -0.14)) * uMediumNoiseScale, uTime * 0.05 + 4.2));
  float fineNoise = valueNoise(vec3((warped + vec2(mediumNoise * 0.08, largeNoise * 0.08)) * uFineNoiseScale, uTime * 0.03 + 8.4));

  float liquid = largeNoise * 0.55 + mediumNoise * 0.3 + fineNoise * 0.15;
  float pulse = sin(warped.x * 3.6 + warped.y * 2.8 - radial * 6.4 + uTime * 0.1 + liquid * 2.4) * 0.5 + 0.5;
  pulse *= uDistortion;
  float pointerBloom = 1.0 - smoothstep(0.04, 0.58, length(coord - pointer * 0.22));
  float height = liquid + envelope * 0.18 + pointerBloom * 0.06;
  float field = clamp(liquid * 0.78 + pulse * 0.22 + envelope * uFadeStrength + pointerBloom * 0.08 + velocity * 0.04, 0.0, 1.0);

  vec3 milky = mix(uColorOuter, uColorMid, smoothstep(0.08, 0.78, field));
  vec3 core = mix(milky, uColorCore, smoothstep(0.38, 0.94, liquid + envelope * 0.1));
  vec3 baseColor = mix(core, uColorShade, smoothstep(0.6, 1.02, liquid + pulse * 0.45));

  float eps = 0.006;
  float hC = height;
  float hX = valueNoise(vec3((warped + vec2(eps, 0.0)) * uLargeNoiseScale, uTime * 0.08)) * 0.55 + mediumNoise * 0.3 + fineNoise * 0.15;
  float hY = valueNoise(vec3((warped + vec2(0.0, eps)) * uLargeNoiseScale, uTime * 0.08)) * 0.55 + mediumNoise * 0.3 + fineNoise * 0.15;
  vec2 grad = vec2(hX - hC, hY - hC);
  vec3 normal = normalize(vec3(grad.x * -1.9, grad.y * -1.9, 1.0));
  vec3 lightDir = normalize(vec3(0.25, 0.55, 0.95));
  float diff = clamp(dot(normal, lightDir), 0.0, 1.0);
  vec3 halfDir = normalize(lightDir + vec3(0.0, 0.0, 1.0));
  float spec = pow(clamp(dot(normal, halfDir), 0.0, 1.0), 28.0) * 0.12;
  vec3 lit = baseColor * mix(0.9, 1.12, diff) + vec3(spec);

  gl_FragColor = vec4(lit, 1.0);
}
`;

export function buildProjectDetailBackgroundMaterial(controls: FallbackControls) {
  const uniforms = {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uPointer: { value: new THREE.Vector2(0, 0) },
    uVelocity: { value: new THREE.Vector2(0, 0) },
    uSwirlStrength: { value: controls.swirlStrength },
    uSwirlDensity: { value: controls.swirlDensity },
    uDistortion: { value: controls.distortion },
    uPointerInfluence: { value: controls.pointerInfluence },
    uFadeStrength: { value: controls.fadeStrength },
    uLargeNoiseScale: { value: controls.largeNoiseScale },
    uMediumNoiseScale: { value: controls.mediumNoiseScale },
    uFineNoiseScale: { value: controls.fineNoiseScale },
    uColorOuter: { value: new THREE.Color(controls.colorOuter) },
    uColorMid: { value: new THREE.Color(controls.colorMid) },
    uColorCore: { value: new THREE.Color(controls.colorCore) },
    uColorShade: { value: new THREE.Color(controls.colorShade) },
  };

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: false,
    uniforms,
    vertexShader: VERT,
    fragmentShader: FRAG,
  });

  return { material, uniforms };
}
