import * as THREE from "three";
import type { WaterSim } from "./WaterSim";
import type { WaterPlanarBounds } from "./waterPlanarMapping";

/**
 * Water surface, ported from Evan Wallace's WebGL Water above-water shader
 * (renderer.js water surface). Adapted to the baked GLB pool: instead of
 * raytracing an analytic tiled pool for refraction, the surface is drawn
 * transparently so the real baked floor — already multiplied with the caustics
 * RT by the receivers — shows through. Reflection samples a cubemap built from
 * the scene HDR; Fresnel mixes the reflected sky with the watery body tint.
 *
 * Sim channels: r = height, g = velocity, b/a = normal.xz. The sim's (u, v) maps
 * to world as u = +x, v = -z, so the world-space surface normal flips z.
 */

const VERT = /* glsl */ `
uniform vec4 uPlanar; // minX, minZ, width, depth
varying vec3 vWorldPos;
varying vec2 vUv;

void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  float u = (wp.x - uPlanar.x) / uPlanar.z;
  float v = 1.0 - (wp.z - uPlanar.y) / uPlanar.w;
  vUv = clamp(vec2(u, v), 0.0, 1.0);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const FRAG = /* glsl */ `
precision highp float;
varying vec3 vWorldPos;
varying vec2 vUv;

uniform sampler2D uWater;
uniform samplerCube uSky;
uniform float uHasSky;
uniform vec3 uLight;       // world-space sun direction
uniform vec3 uAboveTint;   // abovewater body color
uniform vec3 uSkyTint;     // fallback reflection when no cubemap
uniform float uBaseAlpha;  // looking-straight-down transparency
uniform float uPeak;       // crest-sharpening march step

void main() {
  // Peaked normal march: nudge the lookup along the surface gradient a few times
  // so crests sharpen (Evan's 5-iteration trick).
  vec2 coord = vUv;
  vec4 info = texture2D(uWater, coord);
  for (int i = 0; i < 5; i++) {
    coord += info.ba * uPeak;
    info = texture2D(uWater, coord);
  }

  // Reconstruct the surface normal. Sim v runs along -worldZ, so flip z for world.
  vec3 simN = vec3(info.b, sqrt(max(1.0 - dot(info.ba, info.ba), 0.0)), info.a);
  vec3 normal = normalize(vec3(simN.x, simN.y, -simN.z));

  vec3 incomingRay = normalize(vWorldPos - cameraPosition);
  vec3 reflectedRay = reflect(incomingRay, normal);
  float fresnel = mix(0.4, 1.0, pow(1.0 - max(dot(normal, -incomingRay), 0.0), 3.0));

  // Reflection: cubemap sky + a tight specular sun glint.
  vec3 skyColor = mix(uSkyTint, textureCube(uSky, reflectedRay).rgb, uHasSky);
  skyColor += vec3(pow(max(0.0, dot(uLight, reflectedRay)), 800.0)) * vec3(10.0, 8.0, 6.0);

  // Body tint (the baked floor + its caustics show through the transparency).
  vec3 bodyColor = uAboveTint;

  vec3 color = mix(bodyColor, skyColor, fresnel);
  float alpha = clamp(mix(uBaseAlpha, 0.96, fresnel), 0.0, 1.0);
  gl_FragColor = vec4(color, alpha);
}
`;

export type WaterSurface = {
  material: THREE.ShaderMaterial;
  setBounds(b: WaterPlanarBounds): void;
  setSky(cube: THREE.Texture | null): void;
  dispose(): void;
};

export function createWaterSurfaceMaterial(
  sim: WaterSim,
  bounds: WaterPlanarBounds,
  light: THREE.Vector3,
): WaterSurface {
  const uniforms = {
    uWater: { value: sim.texture },
    uSky: { value: null as THREE.Texture | null },
    uHasSky: { value: 0 },
    uPlanar: { value: new THREE.Vector4(bounds.minX, bounds.minZ, bounds.width, bounds.depth) },
    uLight: { value: light.clone() },
    uAboveTint: { value: new THREE.Color(0.35, 0.85, 1.0) },
    uSkyTint: { value: new THREE.Color(0.49, 0.59, 0.66) },
    uBaseAlpha: { value: 0.16 },
    uPeak: { value: 0.005 },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  return {
    material,
    setBounds(b) {
      uniforms.uPlanar.value.set(b.minX, b.minZ, b.width, b.depth);
    },
    setSky(cube) {
      uniforms.uSky.value = cube;
      uniforms.uHasSky.value = cube ? 1 : 0;
    },
    dispose() {
      material.dispose();
    },
  };
}
