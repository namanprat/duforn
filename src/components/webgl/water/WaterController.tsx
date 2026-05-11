// @ts-nocheck
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

import { isWebGPURenderer } from "../../../lib/rendering";
import { logWebGPUOnce } from "../../../lib/webgpu/debugWebGPU";
import { createWaterMaterial, createHeightfieldPlaceholderTexture } from "./createWaterMaterial";
import { createCausticMaterial } from "./createCausticMaterial";
import { WaterHeightfieldSim, DEFAULT_WATER_SIM_SIZE } from "./waterHeightfieldSim";

const POINTER_THROTTLE_MS = 22;
const MIN_UV_DISTANCE = 0.008;

function computeMeshTopY(mesh) {
  const box = new THREE.Box3().setFromObject(mesh);
  return box.max.y;
}

function findSubmergedMeshes(root, water, waterTopY) {
  const out = [];
  root.traverse((o) => {
    if (!o.isMesh || o === water) return;
    const box = new THREE.Box3().setFromObject(o);
    if (!Number.isFinite(box.max.y) || !Number.isFinite(box.min.y)) return;
    if (box.min.y < waterTopY) out.push(o);
  });
  return out;
}

export default function WaterController({ mesh, modelRoot }) {
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);

  const uniformsRef = useRef(null);
  const causticUniformsRef = useRef([]);
  const simRef = useRef(null);
  const lastSpawnTimeRef = useRef(0);
  const lastSpawnUvRef = useRef(new THREE.Vector2(-1, -1));

  useEffect(() => {
    if (!mesh || !gl) return;
    if (!isWebGPURenderer(gl)) {
      console.warn("[WaterController] WebGL fallback active — TSL water skipped");
      return;
    }

    let cancelled = false;
    const reverts = [];

    (async () => {
      try {
        const placeholder = createHeightfieldPlaceholderTexture();
        const { material, uniforms } = await createWaterMaterial(
          {},
          { heightfieldTexture: placeholder, simSize: DEFAULT_WATER_SIM_SIZE },
        );
        if (cancelled) {
          material.dispose?.();
          placeholder.dispose();
          return;
        }

        const sim = new WaterHeightfieldSim(gl, DEFAULT_WATER_SIM_SIZE);
        await sim.init();
        if (cancelled) {
          material.dispose?.();
          placeholder.dispose();
          sim.dispose();
          return;
        }

        uniforms.uHeightfield.value = sim.getReadTexture();
        placeholder.dispose();

        const previous = mesh.material;
        const prevRenderOrder = mesh.renderOrder;
        mesh.material = material;
        mesh.frustumCulled = false;
        mesh.renderOrder = 10;
        reverts.push(() => {
          if (mesh.material === material) mesh.material = previous;
          mesh.renderOrder = prevRenderOrder;
          material.dispose?.();
        });
        uniformsRef.current = uniforms;
        simRef.current = sim;
        reverts.push(() => {
          sim.dispose();
          simRef.current = null;
        });

        const waterTopY = computeMeshTopY(mesh);
        const submerged = modelRoot ? findSubmergedMeshes(modelRoot, mesh, waterTopY) : [];
        for (const target of submerged) {
          if (cancelled) break;
          const sourceMaterial = Array.isArray(target.material)
            ? target.material[0]
            : target.material;
          const { material: causticMat, uniforms: causticUniforms } = await createCausticMaterial({
            source: sourceMaterial,
            waterY: waterTopY,
            timeUniform: uniforms.uTime,
          });
          if (cancelled) {
            causticMat.dispose?.();
            break;
          }
          target.userData.isCausticHost = true;
          const prevTargetMat = target.material;
          target.material = causticMat;
          causticUniformsRef.current.push(causticUniforms);
          reverts.push(() => {
            if (target.material === causticMat) target.material = prevTargetMat;
            causticMat.dispose?.();
          });
        }

        // eslint-disable-next-line no-console
        console.log("[WaterController] TSL water ready", {
          meshName: mesh.name,
          waterTopY,
          submergedCount: submerged.length,
          heightfieldSim: DEFAULT_WATER_SIM_SIZE,
        });
        logWebGPUOnce("water-tsl-build", "Water", "Built TSL water + heightfield sim", {
          simSize: DEFAULT_WATER_SIM_SIZE,
          submerged: submerged.length,
        });
      } catch (err) {
        console.error("[WaterController] failed to build TSL water material", err);
      }
    })();

    return () => {
      cancelled = true;
      while (reverts.length) reverts.pop()();
      uniformsRef.current = null;
      causticUniformsRef.current = [];
    };
  }, [mesh, gl, modelRoot]);

  useEffect(() => {
    if (!mesh || !gl) return;
    const canvas = gl.domElement;
    if (!canvas) return;

    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();

    const handlePointerMove = (event) => {
      if (!simRef.current?.ready) return;
      const rect = canvas.getBoundingClientRect();
      ndc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObject(mesh, false);
      if (!hits.length) return;
      const hit = hits[0];
      if (!hit.uv) return;

      const now = performance.now();
      if (now - lastSpawnTimeRef.current < POINTER_THROTTLE_MS) return;
      const lastUv = lastSpawnUvRef.current;
      if (lastUv.x >= 0 && hit.uv.distanceTo(lastUv) < MIN_UV_DISTANCE) return;
      lastSpawnTimeRef.current = now;
      lastSpawnUvRef.current.copy(hit.uv);

      simRef.current.splat({ uv: hit.uv.clone(), radius: 0.045, strength: 0.14 });
    };

    canvas.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => canvas.removeEventListener("pointermove", handlePointerMove);
  }, [mesh, gl, camera]);

  useFrame((state) => {
    const uniforms = uniformsRef.current;
    const sim = simRef.current;
    if (uniforms) uniforms.uTime.value = state.clock.elapsedTime;
    if (sim?.ready && uniforms) {
      sim.step();
      uniforms.uHeightfield.value = sim.getReadTexture();
    }
  }, -1);

  return null;
}
