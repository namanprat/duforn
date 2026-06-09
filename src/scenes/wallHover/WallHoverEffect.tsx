// @ts-nocheck
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useLoadingStore } from "../../store/loading";
import { useHomeSceneControlsStore } from "../../store/homeScene";
import { isWebGPURenderer } from "../../lib/render";
import { logWebGPUOnce } from "../../lib/gpu/debug";
import { findFloorMeshes } from "./findFloorMesh";
import { clientToNdc, pickFloorHit } from "./wallHoverRaycast";
import { buildWallHoverDecalMaterial } from "./wallHoverDecalMaterial";
import { wallHoverDebug } from "./wallHoverDebug";

const UP = new THREE.Vector3(0, 1, 0);
const RENDER_ORDER = 50;

/**
 * Wall hover: raycast-first debug blob + optional unlit decal glow.
 * Does not modify original wall materials.
 */
export default function WallHoverEffect({ modelRef }) {
  const { gl, camera, scene } = useThree();
  const floorMeshesRef = useRef([]);
  const rootRef = useRef(null);
  const hitRef = useRef(null);
  const targetStrengthRef = useRef(0);
  const reducedMotionRef = useRef(false);
  const raycasterRef = useRef(new THREE.Raycaster());
  const ndcRef = useRef(new THREE.Vector2());
  const decalApiRef = useRef(null);
  const debugMeshRef = useRef(null);
  const decalMeshRef = useRef(null);
  const lastLogMeshRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [decalMaterial, setDecalMaterial] = useState(null);

  const debugMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0xff0000,
        depthTest: false,
        depthWrite: false,
        transparent: true,
        opacity: 0.92,
        side: THREE.DoubleSide,
      }),
    [],
  );

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return undefined;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      reducedMotionRef.current = mediaQuery.matches;
    };
    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const tryDiscover = () => {
      const model = modelRef.current;
      if (!model) return false;

      const floors = findFloorMeshes(model);
      if (!floors.length) return false;

      rootRef.current = model.parent;
      floorMeshesRef.current = floors;
      wallHoverDebug.getFloorMeshes = () => floorMeshesRef.current;
      wallHoverDebug.getRoot = () => rootRef.current;

      console.info("[Floor Hover] discovered", floors.map((m) => m.name).join(", "));
      setReady(true);
      return true;
    };

    if (tryDiscover()) return undefined;

    let raf = 0;
    const tick = () => {
      if (tryDiscover()) return;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      setReady(false);
      setDecalMaterial(null);
      floorMeshesRef.current = [];
      rootRef.current = null;
      hitRef.current = null;
      wallHoverDebug.getFloorMeshes = () => [];
      wallHoverDebug.getRoot = () => null;
      decalApiRef.current?.dispose();
      decalApiRef.current = null;
    };
  }, [modelRef]);

  useEffect(() => {
    if (!ready || !gl) return undefined;

    let cancelled = false;

    (async () => {
      const config = useHomeSceneControlsStore.getState().controls.wallHover;
      try {
        const api = await buildWallHoverDecalMaterial(gl, config);
        if (cancelled) {
          api.dispose();
          return;
        }
        decalApiRef.current = api;
        setDecalMaterial(api.material);

        if (isWebGPURenderer(gl) && typeof gl.compileAsync === "function") {
          await gl.compileAsync(scene, camera);
          logWebGPUOnce("wall-hover-decal-compile", "WallHover", "Decal material compiled");
        }
      } catch (err) {
        console.error("[WallHover] failed to build decal material", err);
      }
    })();

    return () => {
      cancelled = true;
      decalApiRef.current?.dispose();
      decalApiRef.current = null;
      setDecalMaterial(null);
    };
  }, [ready, gl, scene, camera]);

  useEffect(() => {
    if (!gl?.domElement || !ready) return undefined;

    const canvas = gl.domElement;
    const raycaster = raycasterRef.current;
    const ndc = ndcRef.current;

    const onPointerMove = (event) => {
      const { wallHover } = useHomeSceneControlsStore.getState().controls;
      if (!wallHover.enabled || !floorMeshesRef.current.length) return;

      clientToNdc(canvas, event.clientX, event.clientY, ndc);
      const hit = pickFloorHit({
        raycaster,
        camera,
        ndc,
        root: rootRef.current,
        floorMeshes: floorMeshesRef.current,
      });

      hitRef.current = hit;

      if (hit) {
        targetStrengthRef.current = 1;
        if (wallHover.logHits && lastLogMeshRef.current !== hit.mesh) {
          lastLogMeshRef.current = hit.mesh;
          console.info("[Floor Hover] hit", hit.mesh.name, hit.point.toArray());
        }
      } else if (!wallHover.debugAlwaysOn) {
        targetStrengthRef.current = 0;
        lastLogMeshRef.current = null;
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [gl, camera, ready]);

  useFrame((_, delta) => {
    if (!ready || useLoadingStore.getState().phase !== "ready") return;

    const { wallHover } = useHomeSceneControlsStore.getState().controls;

    if (!wallHover.enabled) {
      targetStrengthRef.current = 0;
      hitRef.current = null;
    } else if (wallHover.debugAlwaysOn) {
      targetStrengthRef.current = 1;
      const hit = pickFloorHit({
        raycaster: raycasterRef.current,
        camera,
        ndc: ndcRef.current.set(0, 0),
        root: rootRef.current,
        floorMeshes: floorMeshesRef.current,
      });
      if (hit) hitRef.current = hit;
    }

    const hit = hitRef.current;
    const strength = targetStrengthRef.current;
    const hasHit = hit && strength > 0.001;

    const api = decalApiRef.current;
    if (api && wallHover.useDecalGlow) {
      api.applyConfig({ ...wallHover, showDebugBlob: false });
      const cpu = api.cpuUniforms;
      const lerp = Math.min(delta * wallHover.strengthLerp, 1);
      cpu.uStrength.value += (strength - cpu.uStrength.value) * lerp;
      if (!reducedMotionRef.current) {
        cpu.uTime.value += delta;
      }
      api.updateUniforms();
    }

    const placeMesh = (mesh, scale, visible, uniformScale = false) => {
      if (!mesh) return;
      mesh.visible = visible && hasHit;
      if (!mesh.visible || !hit) return;
      mesh.position.copy(hit.point);
      mesh.quaternion.setFromUnitVectors(UP, hit.normal);
      if (uniformScale) {
        mesh.scale.setScalar(scale);
      } else {
        mesh.scale.set(scale, scale, 1);
      }
    };

    const showDebug = wallHover.showDebugBlob && !wallHover.useDecalGlow;
    placeMesh(debugMeshRef.current, wallHover.debugBlobSize, showDebug, true);

    const showDecal = wallHover.useDecalGlow && decalMaterial;
    placeMesh(decalMeshRef.current, wallHover.hoverRadius, showDecal);
  });

  useEffect(() => () => debugMaterial.dispose(), [debugMaterial]);

  if (!ready) return null;

  return (
    <>
      <mesh
        ref={debugMeshRef}
        renderOrder={RENDER_ORDER}
        frustumCulled={false}
        visible={false}
        material={debugMaterial}
      >
        <sphereGeometry args={[0.5, 16, 16]} />
      </mesh>
      {decalMaterial ? (
        <mesh
          ref={decalMeshRef}
          renderOrder={RENDER_ORDER}
          frustumCulled={false}
          visible={false}
          material={decalMaterial}
        >
          <circleGeometry args={[1, 48]} />
        </mesh>
      ) : null}
    </>
  );
}
