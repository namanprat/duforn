// @ts-nocheck
import React, { useCallback, useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";

/**
 * After preloader dismissal, best-effort GPU compile for the shared room scene.
 * WorkClothStrip is always mounted in RoomCanvas — no duplicate warmup mount.
 */

const WARMUP_COMPILE_TIMEOUT_MS = 2500;

function shouldSkipWarmup() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return true;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  if (window.matchMedia("(pointer: coarse)").matches) return true;
  return false;
}

function CompileWarmup({ onCompiled }: { onCompiled: () => void }) {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    let cancelled = false;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        if (cancelled) return;
        const finish = () => {
          if (!cancelled) onCompiled();
        };

        if (gl.__rendererType === "webgpu" && typeof gl.compileAsync === "function") {
          const compilePromise = gl.compileAsync(scene, camera).then(
            () => undefined,
            () => undefined,
          );
          const timeoutPromise = new Promise<undefined>((resolve) => {
            setTimeout(() => resolve(undefined), WARMUP_COMPILE_TIMEOUT_MS);
          });
          Promise.race([compilePromise, timeoutPromise]).then(finish);
        } else if (typeof gl.compile === "function") {
          try {
            gl.compile(scene, camera);
          } catch {
            /* swallow — warmup is best-effort */
          }
          finish();
        } else {
          finish();
        }
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [gl, scene, camera, onCompiled]);

  return null;
}

export default function Warmup({ activePage }: { activePage: string | undefined }) {
  const [armed, setArmed] = useState(false);
  const [warming, setWarming] = useState(false);
  const [workWarmed, setWorkWarmed] = useState(false);

  useEffect(() => {
    if (activePage === "work") setWorkWarmed(true);
  }, [activePage]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    if (shouldSkipWarmup()) return undefined;

    const onDismissed = () => setArmed(true);
    window.addEventListener("duforn:preloader-dismissed", onDismissed, { once: true });
    return () => window.removeEventListener("duforn:preloader-dismissed", onDismissed);
  }, []);

  useEffect(() => {
    if (!armed || workWarmed) return undefined;
    const timeout = window.setTimeout(() => setWarming(true), 1000);
    return () => window.clearTimeout(timeout);
  }, [armed, workWarmed]);

  const handleCompiled = useCallback(() => {
    setWorkWarmed(true);
    setWarming(false);
  }, []);

  if (!warming) return null;

  return <CompileWarmup onCompiled={handleCompiled} />;
}
