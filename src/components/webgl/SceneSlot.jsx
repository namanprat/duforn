import React, { useContext, useEffect, useMemo } from "react";
import * as THREE from "three";
import { createPortal, useThree } from "@react-three/fiber";
import { SceneCompositorContext } from "./sceneCompositorContext.js";

/**
 * A single scene slot that portals its children into an isolated THREE.Scene
 * and registers itself with the surrounding SceneCompositor.
 *
 * Children can place `<PerspectiveCamera makeDefault ... />` inside themselves;
 * `useThree()` inside the portal returns the portaled scene + whichever camera
 * the children marked as default. `SlotCameraSync` forwards that camera back
 * to the compositor registry so the compositor always renders the slot's scene
 * with the right camera.
 *
 * Props:
 * - id:         unique slot key ("home", "work", "projectDetail", ...)
 * - clearColor: THREE-compatible color used when clearing the slot's FBO
 * - clearAlpha: 0 for transparent slots, 1 for opaque (e.g. work)
 */
export default function SceneSlot({ id, clearColor = "#000000", clearAlpha = 0, children }) {
  const compositor = useContext(SceneCompositorContext);

  const scene = useMemo(() => {
    const s = new THREE.Scene();
    s.name = `slot:${id}`;
    return s;
  }, [id]);

  // A default camera is required so the portal has something before children
  // mount their own <PerspectiveCamera makeDefault />. Children that mark a
  // different camera as default will replace this on mount (via SlotCameraSync).
  const defaultCamera = useMemo(() => {
    const cam = new THREE.PerspectiveCamera(
      75,
      typeof window !== "undefined" ? window.innerWidth / window.innerHeight : 1,
      0.1,
      1000,
    );
    cam.position.set(0, 0, 5);
    return cam;
  }, []);

  useEffect(() => {
    if (!compositor) return undefined;
    compositor.registerSlot(id, {
      scene,
      camera: defaultCamera,
      clearColor,
      clearAlpha,
    });
    return () => compositor.unregisterSlot(id);
  }, [compositor, id, scene, defaultCamera, clearColor, clearAlpha]);

  return createPortal(
    <>
      <SlotCameraSync id={id} />
      {children}
    </>,
    scene,
  );
}

// Runs inside the portal. useThree() here returns the portaled scene state,
// so `camera` is the portal's default camera (updated when children call
// makeDefault on their own camera).
function SlotCameraSync({ id }) {
  const compositor = useContext(SceneCompositorContext);
  const camera = useThree((s) => s.camera);

  useEffect(() => {
    if (!compositor || !camera) return;
    compositor.updateSlot(id, { camera });
  }, [compositor, id, camera]);

  return null;
}
