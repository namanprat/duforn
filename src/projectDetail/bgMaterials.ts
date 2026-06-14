// @ts-nocheck
import * as THREE from "three";

const WEBGL_VERT = /* glsl */ `
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

const WEBGL_FRAG = /* glsl */ `
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

/**
 * WebGPU NodeMaterial — immersive-g style: trail extrusion + emissive/map ramp.
 */
export async function buildProjectBgMaterialsWebGpu(clonedScene, trailTexture) {
  const tsl = await import("three/tsl");
  const { NodeMaterial } = await import("three/webgpu");
  const {
    Fn,
    vec2,
    vec3,
    vec4,
    mix,
    smoothstep,
    texture,
    uv,
    screenUV,
    positionLocal,
    cameraProjectionMatrix,
    modelViewMatrix,
    varying,
  } = tsl;

  const materials = [];

  clonedScene.traverse((child) => {
    if (!child.isMesh) return;

    const baseMap = child.material.map;
    const emissiveMap = child.material.emissiveMap;
    if (!baseMap || !emissiveMap) return;

    const material = new NodeMaterial();
    const uvscreen = varying(vec2(0, 0));
    material.positionNode = Fn(() => {
      const pos = positionLocal;
      const ndc = cameraProjectionMatrix.mul(modelViewMatrix).mul(vec4(pos, 1));
      uvscreen.assign(ndc.xy.div(ndc.w).add(1).div(2));
      uvscreen.y = uvscreen.y.oneMinus();

      const extrude = texture(trailTexture, uvscreen).r;
      pos.z.mulAssign(mix(0.03, 1, extrude));

      return pos;
    })();

    material.colorNode = Fn(() => {
      const tt1 = texture(baseMap, uv());
      const tt2 = texture(emissiveMap, uv());
      const extrude = texture(trailTexture, screenUV).r;

      let final_ = tt2.b;
      final_ = mix(final_, tt2.g, smoothstep(0, 0.2, extrude));
      final_ = mix(final_, tt2.r, smoothstep(0.2, 0.4, extrude));
      final_ = mix(final_, tt1.b, smoothstep(0.4, 0.6, extrude));
      final_ = mix(final_, tt1.g, smoothstep(0.6, 0.8, extrude));
      final_ = mix(final_, tt1.r, smoothstep(0.8, 1, extrude));

      return vec4(vec3(final_), 1);
    })();

    child.material = material;
    materials.push(material);
  });

  return { materials };
}

/**
 * WebGL ShaderMaterial — same shading as {@link buildProjectBgMaterialsWebGpu}.
 */
export function buildProjectBgMaterialsWebGl(clonedScene, trailTexture) {
  /** @type THREE.Texture */
  const trailTex = trailTexture;
  trailTex.needsUpdate = true;

  const uniforms = {
    uTrailMap: { value: trailTex },
  };

  const materials = [];

  clonedScene.traverse((child) => {
    if (!child.isMesh) return;

    const baseMap = child.material.map;
    const emissiveMap = child.material.emissiveMap;
    if (!baseMap || !emissiveMap) return;

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTrailMap: uniforms.uTrailMap,
        uBaseMap: { value: baseMap },
        uEmissiveMap: { value: emissiveMap },
      },
      vertexShader: WEBGL_VERT,
      fragmentShader: WEBGL_FRAG,
    });

    child.material = mat;
    materials.push(mat);
  });

  return { materials };
}
