// @ts-nocheck
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { pickGpuBranch } from "../../lib/rendering/gpuDualPath";
import { logWebGPUOnce } from "../../lib/webgpu/debugWebGPU";

const DEFAULT_COUNT = 200;
const DEFAULT_BOUNDS = { xHalf: 6, yMin: -2, yMax: 4, zMin: -10, zMax: 2 };
const DEFAULT_MOTION = {
  xAmplitude: 0.35,
  zAmplitude: 0.22,
  xSpeed: 0.3,
  zSpeed: 0.24,
  ySpeed: 0.28,
};

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function resolveBounds(bounds) {
  return { ...DEFAULT_BOUNDS, ...bounds };
}

function resolveMotion(motion) {
  return { ...DEFAULT_MOTION, ...motion };
}

function WebGLParticles({ count, bounds, color, size, opacity, motion }) {
  const pointsRef = useRef(null);
  const positionsRef = useRef(null);
  const seedsRef = useRef(null);
  const resolvedBounds = useMemo(() => resolveBounds(bounds), [bounds]);
  const resolvedMotion = useMemo(() => resolveMotion(motion), [motion]);
  const yRange = resolvedBounds.yMax - resolvedBounds.yMin;

  const positions = useMemo(() => {
    const values = new Float32Array(count * 3);
    const seeds = new Float32Array(count * 4);

    for (let i = 0; i < count; i += 1) {
      const offset = i * 3;
      values[offset] = randomBetween(-resolvedBounds.xHalf, resolvedBounds.xHalf);
      values[offset + 1] = randomBetween(resolvedBounds.yMin, resolvedBounds.yMax);
      values[offset + 2] = randomBetween(resolvedBounds.zMin, resolvedBounds.zMax);

      const seedOffset = i * 4;
      seeds[seedOffset] = values[offset];
      seeds[seedOffset + 1] = values[offset + 1];
      seeds[seedOffset + 2] = values[offset + 2];
      seeds[seedOffset + 3] = Math.random();
    }

    positionsRef.current = values;
    seedsRef.current = seeds;
    return values;
  }, [count, resolvedBounds]);

  useEffect(() => {
    logWebGPUOnce("particles-webgl", "Particles", "Using WebGL particles", { count });
  }, [count]);

  useFrame((state) => {
    const pointCloud = pointsRef.current;
    const values = positionsRef.current;
    const seeds = seedsRef.current;
    if (!pointCloud || !values || !seeds) return;

    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i += 1) {
      const positionOffset = i * 3;
      const seedOffset = i * 4;
      const baseX = seeds[seedOffset];
      const baseY = seeds[seedOffset + 1];
      const baseZ = seeds[seedOffset + 2];
      const seed = seeds[seedOffset + 3];

      const yOffset =
        (baseY - resolvedBounds.yMin + time * resolvedMotion.ySpeed + seed * yRange) % yRange;
      values[positionOffset] =
        baseX + Math.sin(time * resolvedMotion.xSpeed + seed * 20) * resolvedMotion.xAmplitude;
      values[positionOffset + 1] = resolvedBounds.yMin + yOffset;
      values[positionOffset + 2] =
        baseZ + Math.cos(time * resolvedMotion.zSpeed + seed * 15) * resolvedMotion.zAmplitude;
    }

    pointCloud.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={size}
        sizeAttenuation
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function WebGPUParticles({ count, gl, bounds, color, size, opacity, motion }) {
  const meshRef = useRef(null);
  const systemRef = useRef(null);
  const [ready, setReady] = useState(false);
  const resolvedBounds = useMemo(() => resolveBounds(bounds), [bounds]);
  const resolvedMotion = useMemo(() => resolveMotion(motion), [motion]);
  const particleColor = useMemo(() => new THREE.Color(color), [color]);
  const yRange = resolvedBounds.yMax - resolvedBounds.yMin;
  const zRange = resolvedBounds.zMax - resolvedBounds.zMin;

  useEffect(() => {
    let cancelled = false;

    async function build() {
      logWebGPUOnce("particles-webgpu-build", "Particles", "Building WebGPU TSL particles", {
        count,
      });
      const tsl = await import("three/tsl");
      const { MeshBasicNodeMaterial } = await import("three/webgpu");
      if (cancelled) return;

      const {
        Fn,
        float,
        vec3,
        uint,
        instanceIndex,
        instancedArray,
        uniform,
        uv,
        sin,
        cos,
        mod,
        smoothstep,
        length,
        step,
        hash,
      } = tsl;
      const tslPositionLocal = tsl.positionLocal;

      const posBuffer = instancedArray(count, "vec3");
      const paramsBuffer = instancedArray(count, "vec3");
      const uTime = uniform(0);
      const uCamQuat = uniform(new THREE.Vector4(0, 0, 0, 1));

      const initKernel = Fn(() => {
        const idx = instanceIndex;
        const seed = hash(uint(idx).add(uint(73856093)));
        const seed2 = hash(uint(idx).add(uint(19349669)));

        const px = seed.x.mul(resolvedBounds.xHalf * 2).sub(resolvedBounds.xHalf);
        const py = seed.y.mul(yRange).add(resolvedBounds.yMin);
        const pz = seed.z.mul(zRange).add(resolvedBounds.zMin);
        posBuffer.element(idx).assign(vec3(px, py, pz));

        const aSize = seed2.x.mul(size * 0.8).add(size * 0.4);
        const aOpacity = seed2.y.mul(opacity * 0.45).add(opacity * 0.55);
        const aSeed = seed2.z;
        paramsBuffer.element(idx).assign(vec3(aSize, aOpacity, aSeed));
      })().compute(count);

      const mat = new MeshBasicNodeMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      });

      mat.positionNode = Fn(() => {
        const idx = instanceIndex;
        const basePos = posBuffer.element(idx);
        const params = paramsBuffer.element(idx);
        const aSize = params.x;
        const aSeed = params.z;

        const yOffset = mod(
          basePos.y
            .sub(resolvedBounds.yMin)
            .add(uTime.mul(resolvedMotion.ySpeed))
            .add(aSeed.mul(yRange)),
          float(yRange),
        );
        const y = yOffset.add(resolvedBounds.yMin);
        const swayX = sin(uTime.mul(resolvedMotion.xSpeed).add(aSeed.mul(100))).mul(
          resolvedMotion.xAmplitude,
        );
        const swayZ = cos(uTime.mul(resolvedMotion.zSpeed).add(aSeed.mul(70))).mul(
          resolvedMotion.zAmplitude,
        );
        const worldPos = vec3(basePos.x.add(swayX), y, basePos.z.add(swayZ));
        const s = aSize.mul(1.0);
        const lp = tslPositionLocal;
        const vx = lp.x.mul(s);
        const vy = lp.y.mul(s);
        const vz = lp.z.mul(s);
        const q = uCamQuat;
        const tx = float(2).mul(q.y.mul(vz).sub(q.z.mul(vy)));
        const ty = float(2).mul(q.z.mul(vx).sub(q.x.mul(vz)));
        const tz = float(2).mul(q.x.mul(vy).sub(q.y.mul(vx)));
        const bx = vx.add(q.w.mul(tx)).add(q.y.mul(tz).sub(q.z.mul(ty)));
        const by = vy.add(q.w.mul(ty)).add(q.z.mul(tx).sub(q.x.mul(tz)));
        const bz = vz.add(q.w.mul(tz)).add(q.x.mul(ty).sub(q.y.mul(tx)));

        return vec3(bx, by, bz).add(worldPos);
      })();

      mat.colorNode = vec3(particleColor.r, particleColor.g, particleColor.b);
      mat.opacityNode = Fn(() => {
        const idx = instanceIndex;
        const params = paramsBuffer.element(idx);
        const aOpacity = params.y;
        const d = length(uv().sub(0.5)).mul(2.0);
        const circle = smoothstep(float(1.0), float(0.3), d);
        const mask = step(d, float(1.0));
        return circle.mul(aOpacity).mul(mask);
      })();

      await gl.computeAsync(initKernel);
      if (cancelled) return;

      systemRef.current = { material: mat, uTime, uCamQuat };
      setReady(true);
      logWebGPUOnce("particles-webgpu-ready", "Particles", "WebGPU TSL particles ready", {
        count,
      });
    }

    build();

    return () => {
      cancelled = true;
      if (systemRef.current) {
        systemRef.current.material.dispose();
        systemRef.current = null;
      }
      setReady(false);
    };
  }, [count, gl, opacity, particleColor, resolvedBounds, resolvedMotion, size, yRange, zRange]);

  useFrame((state) => {
    const sys = systemRef.current;
    if (!sys) return;

    sys.uTime.value = state.clock.elapsedTime;
    const q = state.camera.quaternion;
    sys.uCamQuat.value.set(q.x, q.y, q.z, q.w);
  });

  if (!ready) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, systemRef.current?.material, count]}
      frustumCulled={false}
    >
      <planeGeometry args={[1, 1]} />
    </instancedMesh>
  );
}

export default function Particles({
  count = DEFAULT_COUNT,
  bounds = DEFAULT_BOUNDS,
  color = "#ffffff",
  size = 0.03,
  opacity = 0.58,
  motion = DEFAULT_MOTION,
}) {
  const { gl } = useThree();

  return pickGpuBranch(gl, {
    webgpu: () => (
      <WebGPUParticles
        count={count}
        gl={gl}
        bounds={bounds}
        color={color}
        size={size}
        opacity={opacity}
        motion={motion}
      />
    ),
    webgl: () => (
      <WebGLParticles
        count={count}
        bounds={bounds}
        color={color}
        size={size}
        opacity={opacity}
        motion={motion}
      />
    ),
  });
}
