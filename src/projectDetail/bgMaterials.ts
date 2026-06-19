import * as THREE from "three";

const VERT = /* glsl */ `
uniform sampler2D uTrailMap;
varying vec2 vUv;
varying vec2 vUvScreen;

void main() {
  vUv = uv;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vec4 clip = projectionMatrix * mvPosition;
  vec2 uvS = clip.xy / clip.w * 0.5 + 0.5;
  uvS.y = 1.0 - uvS.y;
  vUvScreen = uvS;
  float extrude = texture2D(uTrailMap, uvS).r;
  vec3 pos = position;
  pos.z *= mix(0.03, 1.0, extrude);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const FRAG = /* glsl */ `
uniform sampler2D uBaseMap;
uniform sampler2D uEmissiveMap;
uniform sampler2D uTrailMap;

varying vec2 vUv;
varying vec2 vUvScreen;

vec3 sRGBTransferOETF(vec3 color) {
  vec3 a = pow(color, vec3(0.41666)) * 1.055 - 0.055;
  vec3 b = color * 12.92;
  vec3 t = vec3(1.0) - step(vec3(0.0031308), color);
  return mix(a, b, t);
}

void main() {
  vec3 tt1 = sRGBTransferOETF(texture2D(uBaseMap, vUv).rgb);
  vec3 tt2 = sRGBTransferOETF(texture2D(uEmissiveMap, vUv).rgb);
  float extrude = texture2D(uTrailMap, vUvScreen).r;

  float f = tt2.b;
  f = mix(f, tt2.g, smoothstep(0.0, 0.2, extrude));
  f = mix(f, tt2.r, smoothstep(0.2, 0.4, extrude));
  f = mix(f, tt1.b, smoothstep(0.4, 0.6, extrude));
  f = mix(f, tt1.g, smoothstep(0.6, 0.8, extrude));
  f = mix(f, tt1.r, smoothstep(0.8, 1.0, extrude));

  gl_FragColor = vec4(vec3(f), 1.0);
}
`;

export function buildProjectBgMaterials(clonedScene: THREE.Object3D, trailTexture: THREE.Texture) {
  trailTexture.needsUpdate = true;

  const uniforms = {
    uTrailMap: { value: trailTexture },
  };

  const materials: THREE.Material[] = [];

  clonedScene.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;

    const src = mesh.material as THREE.MeshStandardMaterial;
    const baseMap = src.map;
    const emissiveMap = src.emissiveMap;
    if (!baseMap || !emissiveMap) return;

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTrailMap: uniforms.uTrailMap,
        uBaseMap: { value: baseMap },
        uEmissiveMap: { value: emissiveMap },
      },
      vertexShader: VERT,
      fragmentShader: FRAG,
    });

    mesh.material = mat;
    materials.push(mat);
  });

  return { materials };
}
