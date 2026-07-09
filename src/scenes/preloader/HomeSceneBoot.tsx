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
import { MOTION_TOKENS } from "../../lib/animation/motionTokens";
import { runBootDissolveTransition } from "../../store/routeTransition";
import { useWorkProjectTransitionStore } from "../../store/workProjectTransition";
import { postFxComposerRef, warmPostFxFrames } from "../postFxComposerRef";

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
  const suppressRoom = useWorkProjectTransitionStore(
    (s) => s.active && s.direction === "toProject",
  );

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
        for (let i = 0; i < 30 && !postFxComposerRef.current; i++) {
          await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
          if (cancelled) return;
        }
        warmPostFxFrames(2);
        if (!postFxComposerRef.current) {
          gl.render(scene, camera);
          gl.render(scene, camera);
        }
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

    const finishReveal = () => {
      // Same beat as archive open onPierceReveal — burst peak, not pierce end.
      setPhase("live");
      setSceneReady(true);
      setArrivedRoom(activeRoom);
    };

    if (prefersReducedMotion()) {
      cameraBasePoseRef.current.fov = ROOM_POSES[activeRoom].fov; // no punch under reduced motion
      setPhase("revealing");
      finishReveal();
      return;
    }

    runBootDissolveTransition(finishReveal, ROOM_POSES[activeRoom].fov, {
      beforeDissolve: () =>
        new Promise<void>((resolve) =>
          window.setTimeout(resolve, MOTION_TOKENS.bootReveal.enterFadeDuration * 1000),
        ),
      swap: () => setPhase("revealing"),
    });
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
        {!suppressRoom ? (
          <Suspense fallback={null}>
            <Env
              hdrFiles="/main.hdr"
              showHdriBackground
              fogColor={SWATCH_DARK_NUM}
              fogDensity={0}
              showShadowCatcher={false}
            />
          </Suspense>
        ) : null}
        {!suppressRoom ? (
          <Suspense fallback={null}>
            <BakedScene enableWater={enableWater} />
            {enableStrip ? <WorkClothStripScene activeRoom={activeRoom} /> : null}
          </Suspense>
        ) : null}
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
