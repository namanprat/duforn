import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { logWebGPUOnce } from "../lib/webgpu/debugWebGPU.js";

const POINTER_LERP = 0.1;
const COLOR_1 = new THREE.Color(0.96, 0.96, 0.96);
const COLOR_2 = new THREE.Color(0.72, 0.72, 0.76);

const SHADER_UTILS = `
  vec4 permute(vec4 x){return mod(x*x*34.+x,289.);}

  float snoise(vec3 v){
    const vec2 C = 1. / vec2(6.0, 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod(i, 289.0);
    vec4 p = permute(
      permute(
        permute(i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0)
      )
      + i.x + vec4(0.0, i1.x, i2.x, 1.0)
    );
    vec3 ns = 0.142857142857 * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + (floor(b0) * 2.0 + 1.0).xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + (floor(b1) * 2.0 + 1.0).xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = inversesqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    return 0.5 + 12.0 * dot(m*m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  vec3 snoiseVec3(vec3 x) {
    return vec3(
      snoise(x) * 2.0 - 1.0,
      snoise(vec3(x.y - 19.1, x.z + 33.4, x.x + 47.2)) * 2.0 - 1.0,
      snoise(vec3(x.z + 74.2, x.x - 124.5, x.y + 99.4)) * 2.0 - 1.0
    );
  }

  vec3 curlNoise(vec3 p) {
    const float e = 0.1;
    vec3 dx = vec3(e, 0.0, 0.0);
    vec3 dy = vec3(0.0, e, 0.0);
    vec3 dz = vec3(0.0, 0.0, e);
    vec3 p_x0 = snoiseVec3(p - dx);
    vec3 p_x1 = snoiseVec3(p + dx);
    vec3 p_y0 = snoiseVec3(p - dy);
    vec3 p_y1 = snoiseVec3(p + dy);
    vec3 p_z0 = snoiseVec3(p - dz);
    vec3 p_z1 = snoiseVec3(p + dz);
    float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
    float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
    float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;
    return normalize(vec3(x, y, z) / (2.0 * e));
  }
`;

function createWebGLMaterial() {
  return new THREE.ShaderMaterial({
    depthWrite: false,
    depthTest: false,
    uniforms: {
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uColor1: { value: COLOR_1.clone() },
      uColor2: { value: COLOR_2.clone() },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec2 uPointer;
      uniform vec2 uResolution;
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      varying vec2 vUv;

      ${SHADER_UTILS}

      void main() {
        vec2 uv = vUv;
        float aspect = uResolution.x / max(uResolution.y, 1.0);

        // Pointer influence in aspect-corrected space
        vec2 uvAspect = vec2(uv.x * aspect, uv.y);
        vec2 pointerAspect = vec2((uPointer.x * 0.5 + 0.5) * aspect, uPointer.y * 0.5 + 0.5);
        float dist = distance(uvAspect, pointerAspect);
        float influence = smoothstep(0.7, 0.0, dist);

        // Curl noise warp near cursor
        vec3 curlInput = vec3(uv * 3.0, uTime * 0.08);
        vec2 warp = curlNoise(curlInput).xy * 0.07 * influence;
        vec2 warpedUv = uv + warp;

        // Layered noise for organic movement
        float n1 = snoise(vec3(warpedUv * 3.0, uTime * 0.06));
        float n2 = snoise(vec3(warpedUv * 6.0 + 100.0, uTime * 0.04)) * 0.5;
        float noise = (n1 + n2) * 0.5;

        // Vertical gradient base
        float dimple = influence * 0.04;
        float gradient = uv.y * 0.3 + 0.35;
        gradient += noise * 0.18;
        gradient += influence * 0.08;
        gradient -= dimple;

        vec3 color = mix(uColor1, uColor2, clamp(gradient, 0.0, 1.0));
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
}

export default function FilmBackground() {
  const { gl, size } = useThree();
  const materialRef = useRef(null);
  const pointerRef = useRef(new THREE.Vector2(0, 0));
  const pointerTargetRef = useRef(new THREE.Vector2(0, 0));
  const [material, setMaterial] = useState(null);

  useEffect(() => {
    const onPointerMove = (event) => {
      pointerTargetRef.current.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -((event.clientY / window.innerHeight) * 2 - 1),
      );
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, []);

  // Intentionally split into two effects: material creation is tied to `gl` (renderer
  // identity), while resolution updates are tied to `size` (viewport changes). Combining
  // them would recreate the material on every resize.
  useEffect(() => {
    logWebGPUOnce("film-background", "FilmBackground", "Using single-pass fluid background");
    const mat = createWebGLMaterial();
    mat.uniforms.uResolution.value.set(size.width, size.height);
    materialRef.current = mat;
    setMaterial(mat);

    return () => {
      mat.dispose();
      materialRef.current = null;
      setMaterial(null);
    };
  }, [gl]);

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uResolution.value.set(size.width, size.height);
    }
  }, [size]);

  useFrame((state) => {
    const mat = materialRef.current;
    if (!mat) return;

    pointerRef.current.lerp(pointerTargetRef.current, POINTER_LERP);
    mat.uniforms.uPointer.value.copy(pointerRef.current);
    mat.uniforms.uTime.value = state.clock.elapsedTime;
  });

  if (!material) return null;

  return (
    <mesh renderOrder={-1} position={[0, 0, -5]} scale={[size.width, size.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
