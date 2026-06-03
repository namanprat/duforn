// @ts-nocheck
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { PerspectiveCamera } from "@react-three/drei";
import { useThree, useFrame } from "@react-three/fiber";
import { pickGpuBranchAsync } from "../../lib/render/dual";
import { logWebGPU } from "../../lib/gpu/debug";
import {
  attachWebGLScreenClip,
  createScreenClipTslNode,
  screenClipInsideTsl,
  updateScreenClipRect,
} from "../../lib/screenClip";
import AboutSpiralGallery from "./AboutSpiralGallery";
import { useAboutScroll } from "./useAboutScroll";
import { SPIRAL_CONFIG } from "./spiralConfig";

const smokeClipVec = new THREE.Vector4();
const smokeClipUniform = { value: smokeClipVec };

async function buildWebGPUSmokeMaterial() {
  const { MeshBasicNodeMaterial } = await import("three/webgpu");
  const tsl = await import("three/tsl");
  const {
    Fn,
    float,
    vec3,
    vec4,
    uniform,
    uv,
    mix,
    smoothstep,
    positionLocal,
    mx_noise_float,
    screenCoordinate,
  } = tsl;

  const uniforms = {
    uTime: uniform(0),
    uVisible: uniform(0),
  };
  const uClip = await createScreenClipTslNode(smokeClipVec);

  const fragmentFn = Fn(() => {
    const uvCoord = uv();
    const n1 = mx_noise_float(
      vec3(
        uvCoord.x.mul(2.0),
        uvCoord.y.mul(2.0).sub(uniforms.uTime.mul(0.06)),
        uniforms.uTime.mul(0.03),
      ),
    )
      .mul(0.5)
      .add(0.5);
    const n2 = mx_noise_float(
      vec3(
        uvCoord.x.mul(5.0),
        uvCoord.y.mul(5.0).sub(uniforms.uTime.mul(0.12)),
        uniforms.uTime.mul(0.05),
      ),
    )
      .mul(0.5)
      .add(0.5);
    const density = n1.mul(0.65).add(n2.mul(0.35));
    const vignette = smoothstep(float(0.0), float(0.55), uvCoord.y);
    const smoke = density.mul(vignette);
    const color = mix(vec3(0.02, 0.02, 0.02), vec3(0.5, 0.5, 0.52), smoke);
    const inside = screenClipInsideTsl(tsl, uClip, screenCoordinate);
    const alpha = smoke.mul(uniforms.uVisible).mul(inside);
    return vec4(color, alpha);
  });

  const material = new MeshBasicNodeMaterial({
    transparent: true,
    depthTest: false,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  material.vertexNode = vec4(positionLocal.x, positionLocal.y, float(0), float(1));
  material.fragmentNode = fragmentFn();

  return { material, uniforms };
}

function buildWebGLSmokeMaterial() {
  const uniforms = {
    uTime: { value: 0 },
    uVisible: { value: 0 },
  };
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthTest: false,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.x, position.y, 0.0, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;
      varying vec2 vUv;
      uniform float uTime;
      uniform float uVisible;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p); vec2 f = fract(p);
        float a = hash(i), b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }
      void main() {
        float n1 = noise(vec2(vUv.x * 2.0, vUv.y * 2.0 - uTime * 0.06));
        float n2 = noise(vec2(vUv.x * 5.0, vUv.y * 5.0 - uTime * 0.12));
        float density = n1 * 0.65 + n2 * 0.35;
        float vignette = smoothstep(0.0, 0.55, vUv.y);
        float smoke = density * vignette;
        vec3 color = mix(vec3(0.02), vec3(0.5, 0.5, 0.52), smoke);
        gl_FragColor = vec4(color, smoke * uVisible);
      }
    `,
  });
  attachWebGLScreenClip(material, smokeClipUniform, "about-smoke-clip");
  return { material, uniforms };
}

function SmokeBackdrop() {
  const { gl } = useThree();
  const systemRef = useRef(null);
  const startedAtRef = useRef(performance.now());
  const [material, setMaterial] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function build() {
      try {
        const system = await pickGpuBranchAsync(gl, {
          webgpu: () => buildWebGPUSmokeMaterial(),
          webgl: () => buildWebGLSmokeMaterial(),
        });
        if (cancelled) {
          system.material.dispose?.();
          return;
        }
        systemRef.current = system;
        setMaterial(system.material);
      } catch (error) {
        logWebGPU("AboutSmoke", "Failed to build smoke material", { error });
      }
    }
    void build();
    return () => {
      cancelled = true;
      systemRef.current?.material?.dispose?.();
      systemRef.current = null;
      setMaterial(null);
    };
  }, [gl]);

  useFrame(() => {
    const system = systemRef.current;
    if (!system?.uniforms) return;
    const elapsed = (performance.now() - startedAtRef.current) / 1000;
    system.uniforms.uTime.value = elapsed;

    const closingEl = document.querySelector('[data-about-section="closing"]');
    if (!closingEl) {
      system.uniforms.uVisible.value = 0;
      smokeClipVec.set(0, 0, 0, 0);
      return;
    }

    const rect = closingEl.getBoundingClientRect();
    updateScreenClipRect(gl, rect, smokeClipVec);

    const vh = window.innerHeight;
    const visible =
      rect.bottom > 0 && rect.top < vh
        ? THREE.MathUtils.clamp((vh - rect.top) / Math.max(rect.height, 1), 0, 1)
        : 0;
    system.uniforms.uVisible.value = visible;
  });

  if (!material) return null;

  return (
    <mesh renderOrder={-10} frustumCulled={false} material={material}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}

export default function AboutScene() {
  const scrollSignals = useAboutScroll();

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, SPIRAL_CONFIG.cameraZ]} fov={75} />
      <SmokeBackdrop />
      <AboutSpiralGallery scroll={scrollSignals} />
    </>
  );
}
