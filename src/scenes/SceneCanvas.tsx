import { Suspense, lazy, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera, useEnvironment } from "@react-three/drei";
import * as THREE from "three";
import CameraRig from "./CameraRig";
import RoomCam from "./RoomCam";
import ScenePostFX from "./ScenePostFX";
import TransitionCameraRegistrar from "./cam/TransitionCameraRegistrar";
import ArchiveScene from "./ArchiveScene";
import ProjectDetailScene from "../projectDetail/ProjectDetailScene";
import ProjectCoverScene from "../projectDetail/ProjectCoverScene";
import ProjectStripSceneGate from "../projectDetail/ProjectStripSceneGate";
import HomeSceneBoot from "./preloader/HomeSceneBoot";
import { BOOT_FOV, MAIN_POSE, SUBGRAPH_ACTIVATE_SECONDS, poseToCameraPosition } from "./cam/roomPoses";
import { getRouteNamespace, type RoomNamespace } from "../lib/route";
import { getDeviceTier } from "../lib/deviceTier";
import { getQualityProfile } from "../lib/qualityProfile";
import { useDelayedActive } from "../lib/useDelayedActive";
import { installBootProgressTracking } from "./preloader/bootProgress";
import { getSceneReady, hasInitialBootCompleted, setSceneReady, useSceneBootStore } from "./preloader/sceneReady";

const DevSceneControls = import.meta.env.DEV
  ? lazy(() => import("./DevSceneControls"))
  : () => null;

const MAIN_CAMERA = poseToCameraPosition(MAIN_POSE);
const deviceTier = getDeviceTier();
const qualityProfile = getQualityProfile(deviceTier);

useEnvironment.preload({ files: "/main.hdr" });

/**
 * Single persistent canvas for all 3D. Route changes toggle scene subgraphs;
 * ScenePostFX processes the final frame (CA + sRGB) on every tier.
 */
export default function SceneCanvas() {
  const location = useLocation();
  const activePage = getRouteNamespace(location.pathname);
  const isArchive = activePage === "archive";
  const isProject = activePage === "projectDetail";
  const isRoom = !isProject && !isArchive;
  const activeRoom = (isProject ? "main" : activePage) as RoomNamespace;
  const isInteractive =
    isProject || isArchive || activeRoom === "work" || activeRoom === "main";
  // Defer mounting these heavy subgraphs until the room transition has settled, so their
  // Three.js init lands after the camera move instead of stuttering it. Initial boot is
  // unaffected (useDelayedActive seeds the first-render active state without delay).
  const subgraphActivateDelayMs = SUBGRAPH_ACTIVATE_SECONDS * 1000;
  const subgraphDeloadDelayMs = 1000;
  const enableWater = useDelayedActive(activeRoom === "main", subgraphDeloadDelayMs, subgraphActivateDelayMs);
  const enableStrip = useDelayedActive(activeRoom === "work", subgraphDeloadDelayMs, subgraphActivateDelayMs);
  const setProgress = useSceneBootStore((s) => s.setProgress);
  const bootProgressCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (deviceTier === 0 || !isRoom) {
      setSceneReady(true);
    }
  }, [isRoom]);

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
        gl={{ antialias: true, stencil: false, localClippingEnabled: true, preserveDrawingBuffer: true }}
        shadows={{ type: THREE.PCFSoftShadowMap }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.NoToneMapping;
          gl.outputColorSpace = THREE.SRGBColorSpace;
          if (!hasInitialBootCompleted()) {
            bootProgressCleanupRef.current?.();
            bootProgressCleanupRef.current = installBootProgressTracking(setProgress);
          }
        }}
      >
        {isRoom ? (
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
            <Suspense fallback={null}>
              <HomeSceneBoot
                activeRoom={activeRoom}
                enableWater={enableWater}
                enableStrip={enableStrip}
              />
            </Suspense>
          </>
        ) : null}
        {isProject ? (
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
