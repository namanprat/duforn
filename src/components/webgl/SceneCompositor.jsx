import React, { useCallback, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { SceneCompositorContext } from "./sceneCompositorContext.js";
import { createCompositorMaterial } from "./compositorMaterial.js";
import { useSceneTransitionStore } from "../../store/sceneTransition.js";

const DPR_CAP = 2;

function pickPixelSize(size) {
  const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, DPR_CAP);
  return {
    width: Math.max(1, Math.floor(size.width * dpr)),
    height: Math.max(1, Math.floor(size.height * dpr)),
  };
}

function createRenderTarget(size) {
  const { width, height } = pickPixelSize(size);
  const rt = new THREE.WebGLRenderTarget(width, height, {
    colorSpace: THREE.SRGBColorSpace,
    depthBuffer: true,
    stencilBuffer: false,
    samples: 0,
  });
  rt.texture.name = "SceneCompositor.rt";
  return rt;
}

/**
 * SceneCompositor owns the render loop for the persistent canvas.
 *
 * It keeps a registry of slots (scene + camera + clear config) provided by
 * SceneSlot children, maintains two pooled render targets (current + next),
 * and drives the slide-up wipe via a fullscreen NodeMaterial.
 *
 * Priority ordering: useFrame with priority > 0 disables R3F's auto-render
 * loop for THIS canvas. The compositor is the sole renderer.
 */
export default function SceneCompositor({ children }) {
  const gl = useThree((s) => s.gl);
  const size = useThree((s) => s.size);

  // Slot registry — mutated imperatively so register/unregister doesn't trigger
  // React re-renders of the compositor tree.
  const slotsRef = useRef(new Map());

  // Two pooled FBOs. Never destroyed across transitions, only resized.
  const rtARef = useRef(null);
  const rtBRef = useRef(null);

  // Compositor material bundle: { material, setCurrentTexture, setNextTexture, setProgress }
  const materialRef = useRef(null);
  const materialReadyRef = useRef(false);

  // Fullscreen composite scene (orthographic + plane mesh with the node material).
  const compositorSceneRef = useRef(null);
  const compositorCameraRef = useRef(null);
  const compositorMeshRef = useRef(null);

  // Track currently bound slot ids so we can set the material's textures
  // consistently without recreating it.
  const currentSlotIdRef = useRef(null);

  // ------------------------------------------------------------------
  // Slot registry API exposed via context
  // ------------------------------------------------------------------
  const registerSlot = useCallback((id, slotData) => {
    slotsRef.current.set(id, { ...slotData });
  }, []);

  const updateSlot = useCallback((id, partial) => {
    const existing = slotsRef.current.get(id);
    if (!existing) return;
    slotsRef.current.set(id, { ...existing, ...partial });
  }, []);

  const unregisterSlot = useCallback((id) => {
    slotsRef.current.delete(id);
  }, []);

  const contextValue = useMemo(
    () => ({ registerSlot, updateSlot, unregisterSlot }),
    [registerSlot, updateSlot, unregisterSlot],
  );

  // ------------------------------------------------------------------
  // One-time setup: RTs + compositor material + fullscreen mesh
  // ------------------------------------------------------------------
  useEffect(() => {
    rtARef.current = createRenderTarget(size);
    rtBRef.current = createRenderTarget(size);

    // Fullscreen mesh: a 2x2 plane in XY that maps to clip space via an
    // orthographic camera sized [-1, 1]. Kept in a tiny dedicated scene so
    // the compositor render pass doesn't see any slot state.
    const compositorScene = new THREE.Scene();
    compositorScene.name = "SceneCompositor.compositorScene";
    const compositorCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry);
    mesh.frustumCulled = false;
    compositorScene.add(mesh);

    compositorSceneRef.current = compositorScene;
    compositorCameraRef.current = compositorCamera;
    compositorMeshRef.current = mesh;

    let cancelled = false;

    createCompositorMaterial()
      .then((bundle) => {
        if (cancelled) {
          bundle.material.dispose();
          return;
        }
        materialRef.current = bundle;
        mesh.material = bundle.material;
        materialReadyRef.current = true;
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error("[SceneCompositor] Failed to build compositor material", err);
      });

    return () => {
      cancelled = true;
      materialReadyRef.current = false;
      if (materialRef.current) {
        materialRef.current.material.dispose();
        materialRef.current = null;
      }
      geometry.dispose();
      if (rtARef.current) {
        rtARef.current.dispose();
        rtARef.current = null;
      }
      if (rtBRef.current) {
        rtBRef.current.dispose();
        rtBRef.current = null;
      }
      compositorSceneRef.current = null;
      compositorCameraRef.current = null;
      compositorMeshRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ------------------------------------------------------------------
  // Resize: update RT pixel sizes when the viewport changes
  // ------------------------------------------------------------------
  useEffect(() => {
    const { width, height } = pickPixelSize(size);
    if (rtARef.current) rtARef.current.setSize(width, height);
    if (rtBRef.current) rtBRef.current.setSize(width, height);
  }, [size]);

  // ------------------------------------------------------------------
  // Render loop: priority 1 suppresses R3F auto-render; compositor is sole driver
  // ------------------------------------------------------------------
  useFrame(() => {
    if (!materialReadyRef.current) return;
    const rtA = rtARef.current;
    const rtB = rtBRef.current;
    const compositorScene = compositorSceneRef.current;
    const compositorCamera = compositorCameraRef.current;
    const bundle = materialRef.current;
    if (!rtA || !rtB || !compositorScene || !compositorCamera || !bundle) return;

    const { currentId, nextId, progress } = useSceneTransitionStore.getState();
    const slots = slotsRef.current;
    const currentSlot = currentId ? slots.get(currentId) : null;
    const nextSlot = nextId ? slots.get(nextId) : null;

    const prevTarget = gl.getRenderTarget();
    const prevClearColor = gl.getClearColor(new THREE.Color());
    const prevClearAlpha = gl.getClearAlpha();
    const prevAutoClear = gl.autoClear;
    gl.autoClear = false;

    // --- Pass 1: render current slot into rtA ---
    if (currentSlot && currentSlot.scene && currentSlot.camera) {
      gl.setRenderTarget(rtA);
      gl.setClearColor(new THREE.Color(currentSlot.clearColor), currentSlot.clearAlpha);
      gl.clear(true, true, true);
      gl.render(currentSlot.scene, currentSlot.camera);
    } else {
      gl.setRenderTarget(rtA);
      gl.setClearColor(new THREE.Color("#000000"), 0);
      gl.clear(true, true, true);
    }

    // --- Pass 2: render next slot into rtB (only during an active wipe) ---
    if (nextSlot && nextSlot.scene && nextSlot.camera) {
      gl.setRenderTarget(rtB);
      gl.setClearColor(new THREE.Color(nextSlot.clearColor), nextSlot.clearAlpha);
      gl.clear(true, true, true);
      gl.render(nextSlot.scene, nextSlot.camera);
    }
    // If no next slot, rtB retains whatever was last drawn — doesn't matter
    // because the compositor mask keeps it fully hidden at progress=0.

    // --- Pass 3: composite to the default framebuffer ---
    bundle.setCurrentTexture(rtA.texture);
    bundle.setNextTexture(rtB.texture);
    bundle.setProgress(nextSlot ? progress : 0);

    gl.setRenderTarget(null);
    gl.setClearColor(new THREE.Color("#000000"), 0);
    gl.clear(true, true, true);
    gl.render(compositorScene, compositorCamera);

    // Restore prior state so anything else that might read it stays consistent.
    gl.setRenderTarget(prevTarget);
    gl.setClearColor(prevClearColor, prevClearAlpha);
    gl.autoClear = prevAutoClear;

    // Track which slot is "live" for introspection/debug.
    currentSlotIdRef.current = currentId;
  }, 1);

  return (
    <SceneCompositorContext.Provider value={contextValue}>
      {children}
    </SceneCompositorContext.Provider>
  );
}
