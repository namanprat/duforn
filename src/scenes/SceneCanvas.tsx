import { Suspense, lazy, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera, useEnvironment } from "@react-three/drei";
import * as THREE from "three";
import CameraRig from "./CameraRig";
import DevOrbitControls from "./DevOrbitControls";
import RoomCam from "./RoomCam";
import ScenePostFX from "./ScenePostFX";
import HomeSceneBoot from "./preloader/HomeSceneBoot";
import TransitionCameraRegistrar from "./cam/TransitionCameraRegistrar";
import { BOOT_FOV, MAIN_POSE, SUBGRAPH_ACTIVATE_SECONDS, poseToCameraPosition } from "./cam/roomPoses";
import { getRouteNamespace, type RoomNamespace } from "../lib/route";
import { getDeviceTier } from "../lib/deviceTier";
import { getQualityProfile } from "../lib/qualityProfile";
import { useDelayedActive } from "../lib/useDelayedActive";
import { installBootProgressTracking } from "./preloader/bootProgress";
import { initKtx2Support } from "../lib/ktx2";
import { startWorkTexturePreload } from "../lib/work-preload";
import { loadCoreWithProgress } from "../lib/preloadAllAssets";
import { armBootDissolveCover, resetDissolveTransition } from "../store/routeTransition";
import { useArchiveReturnStore } from "../store/archiveReturn";
import { hasInitialBootCompleted, setSceneReady, useSceneBootStore } from "./preloader/sceneReady";
import { useWorkProjectTransitionStore } from "../store/workProjectTransition";
import { ProjectBgRiseLayerGate } from "../projectDetail/ProjectBgRiseLayer";

const DevSceneControls = import.meta.env.DEV
  ? lazy(() => import("./DevSceneControls"))
  : () => null;
const ArchiveScene = lazy(() => import("./ArchiveScene"));
const ProjectDetailScene = lazy(() => import("../projectDetail/ProjectDetailScene"));
const ProjectCoverScene = lazy(() => import("../projectDetail/ProjectCoverScene"));
const ProjectStripSceneGate = lazy(() => import("../projectDetail/ProjectStripSceneGate"));

const MAIN_CAMERA = poseToCameraPosition(MAIN_POSE);
const deviceTier = getDeviceTier();
const qualityProfile = getQualityProfile(deviceTier);

useEnvironment.preload({ files: "/main.hdr" });

/**
 * Single persistent canvas for all 3D. Route changes toggle scene subgraphs;
 * ScenePostFX keeps spatial effects and final grading active across every route.
 */
export default function SceneCanvas() {
  const location = useLocation();
  const activePage = getRouteNamespace(location.pathname);
  const isArchive = activePage === "archive";
  const isProject = activePage === "projectDetail";
  const transitionActive = useWorkProjectTransitionStore((s) => s.active);
  const transitionDirection = useWorkProjectTransitionStore((s) => s.direction);
  const isRoom = !isProject && !isArchive;
  const showRoom = isRoom || (transitionActive && transitionDirection === "toWork");
  const showProject = isProject;
  const activeRoom = (isProject ? "main" : activePage) as RoomNamespace;
  const isInteractive =
    isProject || isArchive || activeRoom === "work" || activeRoom === "main";
  // Defer mounting these heavy subgraphs until the room transition has settled, so their
  // Three.js init lands after the camera move instead of stuttering it. Initial boot is
  // unaffected (useDelayedActive seeds the first-render active state without delay).
  const subgraphActivateDelayMs = SUBGRAPH_ACTIVATE_SECONDS * 1000;
  const subgraphDeloadDelayMs = 1000;
  const skipSubgraphDelay = useArchiveReturnStore((s) => s.shouldSkipSubgraphDelay(activeRoom));
  const subgraphActivateDelay = skipSubgraphDelay ? 0 : subgraphActivateDelayMs;
  const enableWater = useDelayedActive(
    activeRoom === "main",
    subgraphDeloadDelayMs,
    subgraphActivateDelay,
  );
  const enableStrip = useDelayedActive(
    activeRoom === "work",
    subgraphDeloadDelayMs,
    subgraphActivateDelay,
  );
  const setProgress = useSceneBootStore((s) => s.setProgress);
  const revealNonce = useSceneBootStore((s) => s.revealNonce);
  const bootProgressCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!skipSubgraphDelay || !isRoom) return;
    const ready =
      (activeRoom === "main" && enableWater) || (activeRoom === "work" && enableStrip);
    if (ready) useArchiveReturnStore.getState().clearSubgraphDelaySkip();
  }, [skipSubgraphDelay, isRoom, activeRoom, enableWater, enableStrip]);

  useEffect(() => {
    if (deviceTier === 0) {
      setSceneReady(true);
      return;
    }
    // Room pages: HomeSceneBoot owns the boot. Non-room deep-links (project/archive)
    // used to skip the preloader entirely — instead show it and gate on the core
    // GLB+HDR download so entering a room afterwards is instant.
    if (showRoom || hasInitialBootCompleted()) return;
    // Arm the same black dissolve cover the room boot uses, so the Enter reveal
    // can wipe it open on non-room pages too.
    armBootDissolveCover();
    let cancelled = false;
    loadCoreWithProgress((pct) => useSceneBootStore.getState().setProgress(pct)).finally(() => {
      if (!cancelled) useSceneBootStore.getState().setPhase("ready");
    });
    return () => {
      cancelled = true;
      if (!hasInitialBootCompleted()) resetDissolveTransition();
    };
  }, [showRoom]);

  // Non-room reveal: PreloadOverlay's Enter bumps revealNonce, but there's no
  // HomeSceneBoot off-room to handle it. ponytail: skip the GPU wipe here — it can
  // stall (never firing scene-ready) and leave the page text stuck hidden. Open the
  // cover and go live directly; setSceneReady fires SCENE_READY_EVENT, which releases
  // the page text/line reveal.
  useEffect(() => {
    if (showRoom || revealNonce === 0 || hasInitialBootCompleted()) return;
    resetDissolveTransition();
    setSceneReady(true);
  }, [revealNonce, showRoom]);

  useEffect(() => {
    const nudge = () => window.dispatchEvent(new Event("resize"));
    const rafs = [
      requestAnimationFrame(nudge),
      requestAnimationFrame(() => requestAnimationFrame(nudge)),
    ];
    const timer = window.setTimeout(nudge, 150);
    return () => {
      rafs.forEach((id) => cancelAnimationFrame(id));
      window.clearTimeout(timer);
    };
  }, []);

  if (deviceTier === 0) {
    return <div className="scene_canvas_wrap scene_canvas_wrap--static" aria-hidden />;
  }

  return (
    <div className={`scene_canvas_wrap${isInteractive ? " scene_canvas_wrap--interactive" : ""}`}>
      <Canvas
        dpr={[1, qualityProfile.maxDpr]}
        frameloop="always"
        gl={{ antialias: true, stencil: false, localClippingEnabled: true }}
        shadows={{ type: THREE.PCFShadowMap }}
        onCreated={({ gl, setFrameloop }) => {
          gl.toneMapping = THREE.NoToneMapping;
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFShadowMap;
          initKtx2Support(gl);
          startWorkTexturePreload().catch(() => {});
          if (!hasInitialBootCompleted() && showRoom) {
            bootProgressCleanupRef.current?.();
            bootProgressCleanupRef.current = installBootProgressTracking(setProgress);
          }
          gl.domElement.addEventListener(
            "webglcontextlost",
            (event) => {
              event.preventDefault();
              setFrameloop("never");
            },
            { once: true },
          );
        }}
      >
        {showRoom ? (
          <>
            <PerspectiveCamera
              makeDefault
              position={[MAIN_CAMERA.x, MAIN_CAMERA.y, MAIN_CAMERA.z]}
              fov={hasInitialBootCompleted() ? MAIN_POSE.fov : BOOT_FOV}
              near={0.1}
              far={1000}
            />
            <RoomCam activeRoom={activeRoom} />
            <CameraRig />
            {import.meta.env.DEV ? <DevOrbitControls /> : null}
            <Suspense fallback={null}>
              <HomeSceneBoot
                activeRoom={activeRoom}
                enableWater={enableWater}
                enableStrip={enableStrip}
              />
            </Suspense>
          </>
        ) : null}
        <ProjectBgRiseLayerGate />
        {showProject ? (
          <>
            <Suspense fallback={null}>
              <ProjectDetailScene />
            </Suspense>
            <Suspense fallback={null}>
              <ProjectCoverScene />
            </Suspense>
            <Suspense fallback={null}>
              <ProjectStripSceneGate />
            </Suspense>
          </>
        ) : null}
        {isArchive ? (
          <Suspense fallback={null}>
            <ArchiveScene />
          </Suspense>
        ) : null}
        <ScenePostFX />
        <TransitionCameraRegistrar />
        {import.meta.env.DEV ? (
          <Suspense fallback={null}>
            <DevSceneControls isRoom={isRoom} activeRoom={activeRoom} />
          </Suspense>
        ) : null}
      </Canvas>
    </div>
  );
}
