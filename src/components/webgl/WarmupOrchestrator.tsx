// @ts-nocheck
import React, { Suspense, useCallback, useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import { WorkClothStripScene } from "../../work/WorkClothStrip";

/**
 * After preloader dismissal, hidden-mount heavy branches and best-effort GPU compile.
 *
 * `projectDetail` / `ProjectBg` are skipped: off-screen RT + virtual scene are not the
 * visible R3F scene graph that `compileAsync` targets.
 */

const WARMUP_COMPILE_TIMEOUT_MS = 2500;

function shouldSkipWarmup() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return true;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  if (window.matchMedia("(pointer: coarse)").matches) return true;
  return false;
}

function HiddenBranch({ onCompiled }: { onCompiled: () => void }) {
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

  return (
    <group visible={false} renderOrder={-9999} matrixAutoUpdate={false}>
      <Suspense fallback={null}>
        <WorkClothStripScene />
      </Suspense>
    </group>
  );
}

export default function WarmupOrchestrator({ activePage }: { activePage: string | undefined }) {
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

  return <HiddenBranch onCompiled={handleCompiled} />;
}
