import { useEffect, useRef } from "react";
import * as THREE from "three";

function normalizePointer(clientX: number, clientY: number) {
  const w = Math.max(window.innerWidth, 1);
  const h = Math.max(window.innerHeight, 1);
  return new THREE.Vector2((clientX / w) * 2 - 1, -(clientY / h) * 2 + 1);
}

export function usePointerField() {
  const pointerRef = useRef(new THREE.Vector2(0, 0));
  const targetRef = useRef(new THREE.Vector2(0, 0));
  const velocityRef = useRef(new THREE.Vector2(0, 0));
  const previousRef = useRef(new THREE.Vector2(0, 0));

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      targetRef.current.copy(normalizePointer(event.clientX, event.clientY));
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, []);

  const step = (delta: number, pointerLerp: number) => {
    const previous = previousRef.current.copy(pointerRef.current);
    pointerRef.current.lerp(targetRef.current, Math.min(delta * pointerLerp, 1));
    velocityRef.current.copy(pointerRef.current).sub(previous);
  };

  return { pointerRef, velocityRef, step };
}
