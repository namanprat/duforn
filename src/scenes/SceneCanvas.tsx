import { Suspense, lazy, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import BakedScene from "./BakedScene";
import CameraRig from "./CameraRig";
import RoomCam from "./RoomCam";
import Env from "./Env";
import { WorkClothStripScene } from "../work/ClothStrip";
import ScenePostFX from "./ScenePostFX";
import ArchiveScene from "./ArchiveScene";
import ProjectDetailScene from "../projectDetail/ProjectDetailScene";
import ProjectCoverScene from "../projectDetail/ProjectCoverScene";
import MoneyMeStripScene from "../projectDetail/MoneyMeStripScene";
import { MAIN_POSE, poseToCameraPosition } from "./cam/roomPoses";
import { getRouteNamespace, type RoomNamespace } from "../lib/route";
import { getDeviceTier } from "../lib/deviceTier";
import { getQualityProfile } from "../lib/qualityProfile";

const DevSceneControls = import.meta.env.DEV
  ? lazy(() => import("./DevSceneControls"))
  : () => null;

const MAIN_CAMERA = poseToCameraPosition(MAIN_POSE);
const deviceTier = getDeviceTier();
const qualityProfile = getQualityProfile(deviceTier);

/**
 * Single persistent canvas for all 3D. Route changes toggle scene subgraphs;
 * ScenePostFX processes the final frame when the device tier supports it.
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

  const useGradePostFx = qualityProfile.postFxMode === "grade";

  return (
    <div className={`scene_canvas_wrap${isInteractive ? " scene_canvas_wrap--interactive" : ""}`}>
      <Canvas
        dpr={[1, qualityProfile.maxDpr]}
        gl={{ antialias: true, stencil: false, localClippingEnabled: true }}
        shadows={{ type: THREE.PCFShadowMap }}
        onCreated={({ gl }) => {
          if (useGradePostFx) {
            gl.toneMapping = THREE.NoToneMapping;
          } else {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
          }
          gl.toneMappingExposure = 1.0;
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
      >
        {isRoom ? (
          <>
            <PerspectiveCamera
              makeDefault
              position={[MAIN_CAMERA.x, MAIN_CAMERA.y, MAIN_CAMERA.z]}
              fov={MAIN_POSE.fov}
              near={0.1}
              far={1000}
            />
            <RoomCam activeRoom={activeRoom} />
            <CameraRig />
            <Suspense fallback={null}>
              <Env
                hdrFiles="/main.hdr"
                showHdriBackground
                fogColor={0x000000}
                fogDensity={0}
                showShadowCatcher={false}
              />
            </Suspense>
            <Suspense fallback={null}>
              <BakedScene enableWater={activeRoom === "main"} />
              {activeRoom === "work" ? <WorkClothStripScene activeRoom={activeRoom} /> : null}
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
              <MoneyMeStripScene />
            </Suspense>
          </>
        ) : null}
        {isArchive ? (
          <Suspense fallback={null}>
            <ArchiveScene />
          </Suspense>
        ) : null}
        <ScenePostFX />
        {import.meta.env.DEV ? (
          <Suspense fallback={null}>
            <DevSceneControls isRoom={isRoom} activeRoom={activeRoom} />
          </Suspense>
        ) : null}
      </Canvas>
    </div>
  );
}
