// @ts-nocheck
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { normalizeViewportPoint } from "../lib/viewport/stableViewport";

export function usePointerField() {
  const pointerRef = useRef(new THREE.Vector2(0, 0));
  const targetRef = useRef(new THREE.Vector2(0, 0));
  const velocityRef = useRef(new THREE.Vector2(0, 0));
  const previousScratchRef = useRef(new THREE.Vector2(0, 0));

  useEffect(() => {
    const onPointerMove = (event) => {
      const { x, y } = normalizeViewportPoint(event.clientX, event.clientY);
      targetRef.current.set(x, y);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, []);

  const step = (delta, pointerLerp) => {
    const previous = previousScratchRef.current.copy(pointerRef.current);
    pointerRef.current.lerp(targetRef.current, Math.min(delta * pointerLerp, 1));
    velocityRef.current.copy(pointerRef.current).sub(previous);
  };

  return { pointerRef, velocityRef, step };
}
