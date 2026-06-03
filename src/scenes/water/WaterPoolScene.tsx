// @ts-nocheck
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useControls, folder } from "leva";
import { isWebGPURenderer } from "../../lib/render";
import { useLoadingStore } from "../../store/loading";
import { loadSkyCubeTexture, loadTilesTexture } from "./assets";
import { createWaterSim } from "./sim/WaterSim";
import { createCaustics } from "./sim/Caustics";
import { createWaterMaterials } from "./materials/waterMaterials";

const POOL_TOP = 2 / 12; // matches the rim height baked into the shaders
const POOL_BOTTOM = -1;
const POOL_H = POOL_TOP - POOL_BOTTOM;
const POOL_MID = (POOL_TOP + POOL_BOTTOM) / 2;

const LIGHT_DIR = new THREE.Vector3(2, 2, -1);

/** Floor + 4 inward walls of the tiled pool, sharing one TSL material. */
function Pool({ material }) {
  if (!material) return null;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, POOL_BOTTOM, 0]} material={material}>
        <planeGeometry args={[2, 2]} />
      </mesh>
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[1, POOL_MID, 0]} material={material}>
        <planeGeometry args={[2, POOL_H]} />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-1, POOL_MID, 0]} material={material}>
        <planeGeometry args={[2, POOL_H]} />
      </mesh>
      <mesh rotation={[0, Math.PI, 0]} position={[0, POOL_MID, 1]} material={material}>
        <planeGeometry args={[2, POOL_H]} />
      </mesh>
      <mesh position={[0, POOL_MID, -1]} material={material}>
        <planeGeometry args={[2, POOL_H]} />
      </mesh>
    </group>
  );
}

export default function WaterPoolScene() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const controlsRef = useRef(null);

  const tiles = useMemo(() => loadTilesTexture(), []);
  const sky = useMemo(() => loadSkyCubeTexture(), []);

  const [built, setBuilt] = useState(null);
  const simRef = useRef(null);
  const causticsRef = useRef(null);
  const materialsRef = useRef(null);
  const dropRef = useRef({ strength: 0.01, radius: 0.03, hoverStrength: 0.004 });

  // GUI — tweak every factor live (only mounted on /test).
  const ctrl = useControls({
    Simulation: folder({
      waveSpeed: { value: 1.4, min: 0.1, max: 2.0, step: 0.01 },
      damping: { value: 0.997, min: 0.9, max: 1.0, step: 0.001 },
      heightDecay: { value: 0.999, min: 0.99, max: 1.0, step: 0.0005 },
      restoring: { value: 0.005, min: 0, max: 0.05, step: 0.001 },
      dropStrength: { value: 0.01, min: 0.001, max: 0.06, step: 0.001 },
      dropRadius: { value: 0.03, min: 0.005, max: 0.1, step: 0.005 },
      hoverStrength: { value: 0.004, min: 0, max: 0.03, step: 0.001 },
    }),
    Caustics: folder({
      causticStrength: { value: 2.0, min: 0, max: 8, step: 0.1 },
    }),
    Surface: folder({
      distortion: { value: 0.5, min: 0, max: 1, step: 0.01 },
      refraction: { value: 0.75, min: 0.3, max: 1.0, step: 0.01 },
      specularStrength: { value: 1.5, min: 0, max: 5, step: 0.05 },
      specularPower: { value: 60, min: 1, max: 300, step: 1 },
      fresnelAbove: { value: 0.25, min: 0, max: 1, step: 0.01 },
      fresnelUnder: { value: 0.5, min: 0, max: 1, step: 0.01 },
      aboveColor: folder({
        aboveR: { value: 0.25, min: 0, max: 2, step: 0.01 },
        aboveG: { value: 1.0, min: 0, max: 2, step: 0.01 },
        aboveB: { value: 1.25, min: 0, max: 2, step: 0.01 },
      }),
      underColor: folder({
        underR: { value: 0.4, min: 0, max: 2, step: 0.01 },
        underG: { value: 0.9, min: 0, max: 2, step: 0.01 },
        underB: { value: 1.0, min: 0, max: 2, step: 0.01 },
      }),
    }),
    Light: folder({
      lightX: { value: 2, min: -5, max: 5, step: 0.1 },
      lightY: { value: 2, min: 0.2, max: 5, step: 0.1 },
      lightZ: { value: -1, min: -5, max: 5, step: 0.1 },
    }),
  });

  // Push GUI values onto the shader uniforms whenever they change.
  useEffect(() => {
    const sim = simRef.current;
    const caustics = causticsRef.current;
    const materials = materialsRef.current;
    dropRef.current = {
      strength: ctrl.dropStrength,
      radius: ctrl.dropRadius,
      hoverStrength: ctrl.hoverStrength,
    };
    if (!sim || !caustics || !materials) return;
    sim.uniforms.waveSpeed.value = ctrl.waveSpeed;
    sim.uniforms.damping.value = ctrl.damping;
    sim.uniforms.heightDecay.value = ctrl.heightDecay;
    sim.uniforms.restoring.value = ctrl.restoring;
    materials.uniforms.causticStrength.value = ctrl.causticStrength;
    materials.uniforms.fresnelAbove.value = ctrl.fresnelAbove;
    materials.uniforms.fresnelUnder.value = ctrl.fresnelUnder;
    materials.uniforms.refraction.value = ctrl.refraction;
    materials.uniforms.distortion.value = ctrl.distortion;
    materials.uniforms.specularStrength.value = ctrl.specularStrength;
    materials.uniforms.specularPower.value = ctrl.specularPower;
    caustics.refraction.value = ctrl.refraction;
    materials.uniforms.aboveColor.value.set(ctrl.aboveR, ctrl.aboveG, ctrl.aboveB);
    materials.uniforms.underColor.value.set(ctrl.underR, ctrl.underG, ctrl.underB);
    const l = new THREE.Vector3(ctrl.lightX, ctrl.lightY, ctrl.lightZ).normalize();
    materials.uniforms.lightDir.value.copy(l);
    caustics.lightDir.value.copy(l);
  }, [ctrl, built]);

  const waterGeometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(2, 2, 200, 200);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);

  // The /test branch skips ShaderWarmup, so nothing flips the loading phase to
  // "ready" — which the unified canvas frame loop requires before it advances +
  // renders. Mark it ready here so the loop ticks (drives the sim + renders).
  useEffect(() => {
    useLoadingStore.getState().markReady();
  }, []);

  // Cubemap sky as the scene backdrop while on /test.
  useEffect(() => {
    const prev = scene.background;
    scene.background = sky;
    return () => {
      scene.background = prev;
    };
  }, [scene, sky]);

  // Build the (async, WebGPU-only) sim + caustics + node materials.
  useEffect(() => {
    if (!isWebGPURenderer(gl)) {
      setBuilt({ fallback: true });
      return undefined;
    }

    let disposed = false;
    (async () => {
      const sim = await createWaterSim(gl, 256);
      const caustics = await createCaustics(gl, LIGHT_DIR, 1024);
      const materials = await createWaterMaterials({
        simTexture: sim.texture,
        causticTexture: caustics.texture,
        tiles,
        sky,
        light: LIGHT_DIR,
      });
      if (disposed) {
        sim.dispose();
        caustics.dispose();
        materials.dispose();
        return;
      }
      // Seed the surface with random ripples (mirrors main.js startup).
      for (let i = 0; i < 20; i++) {
        sim.addDrop(Math.random() * 2 - 1, Math.random() * 2 - 1, 0.03, i & 1 ? 0.01 : -0.01);
      }
      simRef.current = sim;
      causticsRef.current = caustics;
      materialsRef.current = materials;
      setBuilt({ sim, caustics, materials });
    })();

    return () => {
      disposed = true;
      simRef.current?.dispose();
      causticsRef.current?.dispose();
      materialsRef.current?.dispose();
    };
  }, [gl, tiles, sky]);

  // Per frame: step the sim, regenerate caustics, feed the fresh sim texture to
  // both the caustics pass and the surface/pool materials.
  useFrame(() => {
    const sim = simRef.current;
    const caustics = causticsRef.current;
    const materials = materialsRef.current;
    if (!sim || !caustics || !materials) return;
    sim.step();
    caustics.update(sim.texture);
    materials.simTexNode.value = sim.texture;
  });

  const addDropAt = (point, strength) => {
    const sim = simRef.current;
    if (!sim) return;
    if (Math.abs(point.x) > 1 || Math.abs(point.z) > 1) return;
    sim.addDrop(point.x, point.z, dropRef.current.radius, strength);
  };

  const onWaterPointerDown = (e) => {
    if (controlsRef.current) controlsRef.current.enabled = false;
    addDropAt(e.point, dropRef.current.strength);
  };
  // gentlerain-style continuous trail: a passing cursor lays soft ripples even
  // without a button held; a held button drops the stronger impulse.
  const onWaterPointerMove = (e) => {
    const strength = e.buttons > 0 ? dropRef.current.strength : dropRef.current.hoverStrength;
    addDropAt(e.point, strength);
  };

  useEffect(() => {
    const onUp = () => {
      if (controlsRef.current) controlsRef.current.enabled = true;
    };
    window.addEventListener("pointerup", onUp);
    return () => window.removeEventListener("pointerup", onUp);
  }, []);

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan={false}
        minDistance={2.5}
        maxDistance={8}
        target={[0, 0, 0]}
      />

      {built?.fallback ? (
        <>
          <ambientLight intensity={0.6} />
          <directionalLight position={[2, 4, 1]} intensity={1.2} />
          <mesh geometry={waterGeometry}>
            <meshStandardMaterial color="#2a6f86" metalness={0.1} roughness={0.2} />
          </mesh>
        </>
      ) : (
        <>
          <Pool material={built?.materials?.poolMaterial} />
          {built?.materials ? (
            <mesh
              geometry={waterGeometry}
              material={built.materials.surfaceAbove}
              frustumCulled={false}
              onPointerDown={onWaterPointerDown}
              onPointerMove={onWaterPointerMove}
            />
          ) : null}
        </>
      )}
    </>
  );
}
