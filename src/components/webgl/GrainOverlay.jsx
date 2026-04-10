import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { getPerformanceProfile } from "../../../scripts/perf.js";
import { useGlobalCanvasFxControlsStore } from "../../store/globalCanvasFxControls";
import { getRendererType } from "./createWebGPURenderer.js";

function buildWebGLGrainMaterial() {
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.NormalBlending,
    uniforms: {
      uTime: { value: 0 },
      uIntensity: { value: 0.06 },
      uScale: { value: 1.35 },
      uSpeed: { value: 0.22 },
      uFloor: { value: 0.92 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      precision highp float;
      varying vec2 vUv;
      uniform float uTime;
      uniform float uIntensity;
      uniform float uScale;
      uniform float uSpeed;
      uniform float uFloor;

      // Hash-based noise (cheap, stable).
      float hash12(vec2 p) {
        vec3 p3 = fract(vec3(p.xyx) * 0.1031);
        p3 += dot(p3, p3.yzx + 33.33);
        return fract((p3.x + p3.y) * p3.z);
      }

      void main() {
        vec2 uv = vUv * uScale * vec2(1.6, 1.0);
        // Add a tiny animated jitter so it feels alive, not static.
        uv += vec2(uTime * uSpeed * 0.08, uTime * uSpeed * 0.11);
        float n = hash12(uv * 900.0);
        float centered = n - 0.5;
        float energy = abs(centered) * 2.0;
        float shaped = smoothstep(0.15, 0.92, energy);
        float grain = clamp(shaped * uIntensity, 0.0, 1.0);
        // WebGPU doesn't support MultiplyBlending like WebGL; use black + alpha to "darken".
        float alpha = clamp(grain, 0.0, 1.0) * (1.0 - uFloor);
        gl_FragColor = vec4(vec3(0.0), alpha);
      }
    `,
  });

  return material;
}

async function buildWebGPUGrainMaterial(controls) {
  const tsl = await import("three/tsl");
  const { MeshBasicNodeMaterial } = await import("three/webgpu");
  const { Fn, float, vec2, vec3, uniform, screenUV, mx_noise_float, clamp, smoothstep, abs } = tsl;

  const uniforms = {
    uTime: uniform(0),
    uResolution: uniform(new THREE.Vector2(1, 1)),
    uIntensity: uniform(controls.intensity),
    uScale: uniform(controls.scale),
    uSpeed: uniform(controls.speed),
    uFloor: uniform(controls.floor),
  };

  const material = new MeshBasicNodeMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: false,
  });

  material.colorNode = Fn(() => {
    // WebGPU doesn't support MultiplyBlending like WebGL; we "darken" via black + opacity.
    const uv = screenUV.mul(uniforms.uScale);
    const noise = mx_noise_float(vec3(uv.mul(vec2(1.6, 1.0)), uniforms.uTime.mul(uniforms.uSpeed)));
    const centered = noise.sub(0.5);
    const energy = abs(centered).mul(2.0);
    smoothstep(0.15, 0.92, energy);
    // Black color; opacity controls the darkening amount.
    return vec3(0);
  })();

  material.opacityNode = Fn(() => {
    const uv = screenUV.mul(uniforms.uScale);
    const noise = mx_noise_float(vec3(uv.mul(vec2(1.6, 1.0)), uniforms.uTime.mul(uniforms.uSpeed)));
    const centered = noise.sub(0.5);
    const energy = abs(centered).mul(2.0);
    const shaped = smoothstep(0.15, 0.92, energy);
    const grain = clamp(shaped.mul(uniforms.uIntensity), 0, 1);
    return clamp(grain.mul(float(1.0).sub(uniforms.uFloor)), 0, 1);
  })();

  return { material, uniforms };
}

export default function GrainOverlay() {
  const meshRef = useRef(null);
  const systemRef = useRef(null);
  const [ready, setReady] = useState(false);
  const { size, gl } = useThree();
  const grain = useGlobalCanvasFxControlsStore((s) => s.controls.grain);
  const rendererType = useMemo(() => getRendererType(gl), [gl]);
  const profile = useMemo(() => getPerformanceProfile(), []);

  useEffect(() => {
    if (!grain.enabled || profile.prefersReducedMotion || profile.tier === "low") {
      setReady(false);
      const existing = systemRef.current;
      systemRef.current = null;
      if (existing?.material) {
        const dispose = () => existing.material.dispose?.();
        if (typeof queueMicrotask === "function") queueMicrotask(dispose);
        else Promise.resolve().then(dispose);
      }
      return undefined;
    }

    let cancelled = false;
    async function build() {
      if (rendererType === "webgl") {
        const material = buildWebGLGrainMaterial();
        if (cancelled) {
          material.dispose();
          return;
        }
        systemRef.current = { material, uniforms: material.uniforms };
        setReady(true);
        return;
      }

      const system = await buildWebGPUGrainMaterial(grain);
      if (cancelled) {
        system.material.dispose();
        return;
      }
      systemRef.current = system;
      setReady(true);
    }
    build();

    return () => {
      cancelled = true;
      setReady(false);
      const existing = systemRef.current;
      systemRef.current = null;
      existing?.material?.dispose?.();
    };
  }, [grain.enabled, profile.prefersReducedMotion, profile.tier, rendererType]);

  useFrame((state) => {
    if (!ready || !systemRef.current) return;
    const system = systemRef.current;
    if (system.uniforms.uTime) system.uniforms.uTime.value = state.clock.elapsedTime;
    if (system.uniforms.uResolution) system.uniforms.uResolution.value.set(size.width, size.height);
    if (system.uniforms.uIntensity) system.uniforms.uIntensity.value = grain.intensity;
    if (system.uniforms.uScale) system.uniforms.uScale.value = grain.scale;
    if (system.uniforms.uSpeed) system.uniforms.uSpeed.value = grain.speed;
    if (system.uniforms.uFloor) system.uniforms.uFloor.value = grain.floor;

    if (meshRef.current) {
      meshRef.current.frustumCulled = false;
      meshRef.current.position.set(0, 0, -25);
      meshRef.current.scale.set(size.width, size.height, 1);
    }
  });

  if (!ready || !systemRef.current) return null;

  return (
    <mesh ref={meshRef} renderOrder={9999}>
      <planeGeometry args={[1, 1]} />
      <primitive object={systemRef.current.material} attach="material" />
    </mesh>
  );
}
