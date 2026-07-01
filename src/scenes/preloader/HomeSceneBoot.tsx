import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useThree } from "@react-three/fiber";
import BakedScene from "../BakedScene";
import Env from "../Env";
import { WorkClothStripScene } from "../../work/ClothStrip";
import { cameraBasePoseRef } from "../cam/pose";
import { ROOM_POSES } from "../cam/roomPoses";
import type { RoomNamespace } from "../../lib/route";
import { setArrivedRoom } from "../../lib/cam/arrival";
import { prefersReducedMotion } from "../../lib/prefersReducedMotion";
import {
  markGlbGeometryReady,
  reportCompileProgress,
  reportHdrReady,
  reportWaterReady,
} from "./bootProgress";
import { getSceneReady, hasInitialBootCompleted, setSceneReady, useSceneBootStore } from "./sceneReady";
import { SWATCH_DARK_NUM } from "../../lib/siteColors";
import { runBootDissolveTransition } from "../../store/routeTransition";

type HomeSceneBootProps = {
  activeRoom: RoomNamespace;
  enableWater: boolean;
  enableStrip: boolean;
};

export default function HomeSceneBoot({
  activeRoom,
  enableWater,
  enableStrip,
}: HomeSceneBootProps) {
  const skipBoot = hasInitialBootCompleted();
  const phase = useSceneBootStore((s) => s.phase);
  const revealNonce = useSceneBootStore((s) => s.revealNonce);
  const setPhase = useSceneBootStore((s) => s.setPhase);
  const setProgress = useSceneBootStore((s) => s.setProgress);

  const [glbReady, setGlbReady] = useState(false);
  const [hdrReady, setHdrReady] = useState(false);
  const [waterReady, setWaterReady] = useState(!enableWater);
  const compileStartedRef = useRef(false);

  const { gl, scene, camera } = useThree();

  useEffect(() => {
    if (!skipBoot) return;
    // ponytail: RoomCam's prev==null branch already snaps returning visitors to the room's own
    // fov, so don't force SHARED_FOV here — it was wrong for /work. RoomCam is the sole fov owner.
    if (!getSceneReady()) setSceneReady(true);
    // arrival is owned by RoomCam — don't fire here on route change or copy
    // reveals before the camera tween's 200ms lead.
  }, [activeRoom, skipBoot]);

  useEffect(() => {
    if (skipBoot) return;
    setWaterReady(!enableWater);
  }, [enableWater, skipBoot]);

  // ponytail: don't block boot forever if water GPU init stalls
  useEffect(() => {
    if (skipBoot) return undefined;
    if (!enableWater || waterReady) return undefined;
    const timer = window.setTimeout(() => {
      reportWaterReady();
      setWaterReady(true);
    }, 10_000);
    return () => window.clearTimeout(timer);
  }, [enableWater, skipBoot, waterReady]);

  useEffect(() => {
    if (skipBoot) return undefined;
    if (hdrReady) return undefined;
    const timer = window.setTimeout(() => {
      reportHdrReady();
      setHdrReady(true);
    }, 10_000);
    return () => window.clearTimeout(timer);
  }, [hdrReady, skipBoot]);

  useEffect(() => {
    if (skipBoot) return;
    if (compileStartedRef.current) return;
    if (!glbReady) return;
    if (!hdrReady) return;
    if (enableWater && !waterReady) return;

    compileStartedRef.current = true;
    setPhase("compiling");

    let cancelled = false;
    (async () => {
      const finish = () => {
        if (cancelled) return;
        reportCompileProgress(1);
        setProgress(100);
        setPhase("ready");
      };

      try {
        reportCompileProgress(0.25);
        // ponytail: race compile — full scene + post-FX can stall; boot must not hang
        await Promise.race([
          gl.compileAsync(scene, camera),
          new Promise<void>((resolve) => window.setTimeout(resolve, 12_000)),
        ]);
        if (cancelled) return;
        reportCompileProgress(0.75);
        gl.render(scene, camera);
        gl.render(scene, camera);
        finish();
      } catch {
        finish();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [camera, enableWater, gl, glbReady, hdrReady, scene, setPhase, setProgress, skipBoot, waterReady]);

  useEffect(() => {
    if (skipBoot) return;
    if (revealNonce === 0) return;

    setPhase("revealing");

    const finishReveal = () => {
      // FOV is owned by the boot dissolve's punch (playDissolve), which outlasts the
      // open and keeps settling — so do NOT snap fov here or the punch gets cut short.
      // Scene + copy reveal is gated on sceneReady/arrival; both fire at 50% pierce with FOV.
      setPhase("live");
      setSceneReady(true);
      setArrivedRoom(activeRoom);
    };

    if (prefersReducedMotion()) {
      cameraBasePoseRef.current.fov = ROOM_POSES[activeRoom].fov; // no punch under reduced motion
      finishReveal();
      return;
    }

    runBootDissolveTransition(finishReveal, ROOM_POSES[activeRoom].fov);
  }, [activeRoom, revealNonce, setPhase, skipBoot]);

  const handleGlbReady = useCallback(() => {
    markGlbGeometryReady();
    setGlbReady(true);
  }, []);

  const handleWaterReady = useCallback(() => {
    reportWaterReady();
    setWaterReady(true);
  }, []);

  const handleHdrReady = useCallback(() => {
    reportHdrReady();
    setHdrReady(true);
  }, []);

  // Keep geometry in the graph (and visible to WebGL) while the overlay hides it.
  const sceneVisible = phase !== "fetching";

  if (skipBoot) {
    return (
      <>
        <Suspense fallback={null}>
          <Env
            hdrFiles="/main.hdr"
            showHdriBackground
            fogColor={SWATCH_DARK_NUM}
            fogDensity={0}
            showShadowCatcher={false}
          />
        </Suspense>
        <Suspense fallback={null}>
          <BakedScene enableWater={enableWater} />
          {enableStrip ? <WorkClothStripScene activeRoom={activeRoom} /> : null}
        </Suspense>
      </>
    );
  }

  return (
    <>
      <Suspense fallback={null}>
        <Env
          hdrFiles="/main.hdr"
          showHdriBackground
          fogColor={SWATCH_DARK_NUM}
          fogDensity={0}
          showShadowCatcher={false}
          onEnvironmentReady={handleHdrReady}
        />
      </Suspense>
      <Suspense fallback={null}>
        <BakedScene
          enableWater={enableWater}
          visible={sceneVisible}
          onScenePrepared={handleGlbReady}
          onWaterReady={handleWaterReady}
        />
        {enableStrip ? <WorkClothStripScene activeRoom={activeRoom} /> : null}
      </Suspense>
    </>
  );
}
