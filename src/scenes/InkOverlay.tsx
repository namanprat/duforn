// @ts-nocheck
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { logWebGPU, logWebGPUOnce } from "../lib/gpu/debug";
import { getCssSwatchDarkHex } from "../lib/swatch";
import { canvasInk } from "../lib/ink/transition";
import { pickGpuBranchAsync } from "../lib/render";

const NOISE_SCALE_DEFAULT = 6.5;
const EDGE_SOFTNESS_DEFAULT = 0.16;
const PLANE_SIZE = 2;

async function buildWebGPUInkMaterial() {
  logWebGPUOnce("chrome-ink-webgpu-build", "ChromeInk", "Building WebGPU TSL ink material");
  const { MeshBasicNodeMaterial } = await import("three/webgpu");
  const tsl = await import("three/tsl");
  const {
    Fn,
    float,
    vec3,
    vec4,
    uniform,
    uv,
    distance,
    smoothstep,
    mix,
    mx_noise_float,
    clamp,
    pow,
    positionLocal,
  } = tsl;

  const inkColor = new THREE.Color(getCssSwatchDarkHex());
  const uniforms = {
    uInkProgress: uniform(0),
    uOrigin: uniform(new THREE.Vector2(0.5, 0.5)),
    uRadialBias: uniform(0.6),
    uNoiseScale: uniform(NOISE_SCALE_DEFAULT),
    uEdgeSoftness: uniform(EDGE_SOFTNESS_DEFAULT),
    uTime: uniform(0),
    uVisible: uniform(0),
    uInkColor: uniform(new THREE.Color().copy(inkColor)),
  };

  const fragmentFn = Fn(() => {
    const uvCoord = uv();
    const noiseSample = mx_noise_float(
      vec3(
        uvCoord.x.mul(uniforms.uNoiseScale),
        uvCoord.y.mul(uniforms.uNoiseScale),
        uniforms.uTime.mul(0.05),
      ),
    )
      .mul(0.5)
      .add(0.5);

    const radialDist = distance(uvCoord, uniforms.uOrigin);
    const radialFactor = smoothstep(float(0), float(1.0), radialDist).mul(uniforms.uRadialBias);
    const biasedNoise = clamp(noiseSample.sub(radialFactor), float(0), float(1));

    const threshold = mix(
      float(1).add(uniforms.uEdgeSoftness),
      uniforms.uEdgeSoftness.negate(),
      uniforms.uInkProgress,
    );
    const inkMask = smoothstep(
      threshold.sub(uniforms.uEdgeSoftness),
      threshold.add(uniforms.uEdgeSoftness),
      biasedNoise,
    );

    const finalAlpha = inkMask.mul(uniforms.uVisible);
    const midBand = inkMask.mul(float(1).sub(inkMask)).mul(4.0);
    const glowBand = pow(clamp(midBand, float(0), float(1)), float(1.65));
    const edgeGlow = vec3(1, 1, 1.02).mul(glowBand).mul(float(0.38)).mul(uniforms.uVisible);
    const baseRgb = uniforms.uInkColor.mul(inkMask).mul(uniforms.uVisible);
    const rgb = baseRgb.add(edgeGlow);
    return vec4(rgb, finalAlpha);
  });

  const material = new MeshBasicNodeMaterial({
    transparent: true,
    depthTest: false,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  /* Clip-space quad (same as WebGL shader); MeshBasicNodeMaterial uses vertexNode, not setupVertex. */
  material.vertexNode = vec4(positionLocal.x, positionLocal.y, float(0), float(1));
  material.fragmentNode = fragmentFn();

  return { material, uniforms };
}

function buildWebGLInkMaterial() {
  logWebGPUOnce("chrome-ink-webgl-build", "ChromeInk", "Using WebGL ink fallback shader");
  const inkColor = new THREE.Color(getCssSwatchDarkHex());
  const uniforms = {
    uInkProgress: { value: 0 },
    uOrigin: { value: new THREE.Vector2(0.5, 0.5) },
    uRadialBias: { value: 0.6 },
    uNoiseScale: { value: NOISE_SCALE_DEFAULT },
    uEdgeSoftness: { value: EDGE_SOFTNESS_DEFAULT },
    uTime: { value: 0 },
    uVisible: { value: 0 },
    uInkColor: { value: new THREE.Color().copy(inkColor) },
  };

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthTest: false,
    depthWrite: false,
    uniforms,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        /* NDC quad — independent of camera orbit / pointer parallax (CameraRig). */
        gl_Position = vec4(position.x, position.y, 0.0, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;
      varying vec2 vUv;
      uniform float uInkProgress;
      uniform vec2 uOrigin;
      uniform float uRadialBias;
      uniform float uNoiseScale;
      uniform float uEdgeSoftness;
      uniform float uTime;
      uniform float uVisible;
      uniform vec3 uInkColor;

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
        float n = valueNoise(vec3(vUv * uNoiseScale, uTime * 0.05));
        float radialDist = distance(vUv, uOrigin);
        float radialFactor = smoothstep(0.0, 1.0, radialDist) * uRadialBias;
        float biasedNoise = clamp(n - radialFactor, 0.0, 1.0);
        float threshold = mix(1.0 + uEdgeSoftness, -uEdgeSoftness, uInkProgress);
        float inkMask = smoothstep(threshold - uEdgeSoftness, threshold + uEdgeSoftness, biasedNoise);
        float alpha = inkMask * uVisible;
        float midBand = 4.0 * inkMask * (1.0 - inkMask);
        float glowBand = pow(clamp(midBand, 0.0, 1.0), 1.65);
        vec3 edgeGlow = vec3(1.0, 1.0, 1.02) * glowBand * 0.38 * uVisible;
        vec3 baseRgb = uInkColor * inkMask * uVisible;
        gl_FragColor = vec4(baseRgb + edgeGlow, alpha);
      }
    `,
  });

  return { material, uniforms };
}

/**
 * Full-screen ink in clip space (same R3F tree as Canvas).
 * Vertices are NDC — not tied to CameraRig / cursor parallax.
 */
export default function InkOverlay() {
  const { gl } = useThree();
  const meshRef = useRef(null);
  const systemRef = useRef(null);
  const startedAtRef = useRef(performance.now());

  useEffect(() => {
    let cancelled = false;
    let unregister = null;

    async function build() {
      try {
        const system = await pickGpuBranchAsync(gl, {
          webgpu: () => buildWebGPUInkMaterial(),
          webgl: () => buildWebGLInkMaterial(),
        });
        if (cancelled) {
          system.material.dispose?.();
          return;
        }
        systemRef.current = system;
        if (meshRef.current) {
          meshRef.current.material = system.material;
        }
        unregister = canvasInk.register({ uniforms: system.uniforms });
        system.uniforms.uInkProgress.value = 0;
        system.uniforms.uVisible.value = 0;
      } catch (error) {
        logWebGPU("ChromeInk", "Failed to build ink material", {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    void build();

    return () => {
      cancelled = true;
      if (unregister) unregister();
      const system = systemRef.current;
      if (system?.material) {
        system.material.dispose?.();
      }
      systemRef.current = null;
    };
  }, [gl]);

  useFrame(() => {
    const mesh = meshRef.current;
    const system = systemRef.current;
    if (mesh) {
      mesh.position.set(0, 0, 0);
      mesh.quaternion.identity();
      mesh.scale.set(1, 1, 1);
    }

    if (!system?.uniforms) return;
    const elapsed = (performance.now() - startedAtRef.current) / 1000;
    if (system.uniforms.uTime?.value !== undefined) {
      system.uniforms.uTime.value = elapsed;
    } else if (system.uniforms.uTime) {
      system.uniforms.uTime.value = elapsed;
    }
  });

  return (
    <mesh ref={meshRef} renderOrder={100000} frustumCulled={false}>
      <planeGeometry args={[PLANE_SIZE, PLANE_SIZE]} />
      <meshBasicMaterial transparent opacity={0} depthTest={false} depthWrite={false} />
    </mesh>
  );
}
