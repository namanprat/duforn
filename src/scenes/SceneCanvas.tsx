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
import ProjectDetailScene from "../projectDetail/ProjectDetailScene";
import ProjectCoverScene from "../projectDetail/ProjectCoverScene";
import MoneyMeStripScene from "../projectDetail/MoneyMeStripScene";
import { MAIN_POSE, poseToCameraPosition } from "./cam/roomPoses";
import { getRouteNamespace } from "../lib/route";

const DevSceneControls = import.meta.env.DEV
  ? lazy(() => import("./DevSceneControls"))
  : () => null;

const MAIN_CAMERA = poseToCameraPosition(MAIN_POSE);

/**
 * Single persistent canvas for all 3D. Route changes toggle scene subgraphs;
 * ScenePostFX always processes the final frame.
 */
export default function SceneCanvas() {
  const location = useLocation();
  const activePage = getRouteNamespace(location.pathname);
  const isRoom = activePage !== "projectDetail";
  const isProject = activePage === "projectDetail";
  const activeRoom = isRoom ? activePage : "main";
  const isInteractive =
    activePage === "projectDetail" || activeRoom === "work" || activeRoom === "main";

  // R3F sizes its renderer from a ResizeObserver on its container. Under React
  // StrictMode the observer can be torn down and re-attached on the dev
  // double-mount without delivering an initial measurement, leaving the canvas
  // stuck at the 300x150 default until the next window resize. Nudge a resize a
  // few times after mount (the observer may attach a frame or two later) so the
  // renderer picks up the real container size.
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

  return (
    <div className={`scene_canvas_wrap${isInteractive ? " scene_canvas_wrap--interactive" : ""}`}>
      <Canvas
        // DPR back to native 2: the water's two full-scene passes that dropped
        // the context at DPR 2 are now a basin-only backdrop + every-other-frame
        // refresh (see WaterRipples / WaterBackdrop), so the fillrate headroom is
        // there. Device-independent, no tiers.
        dpr={[1, 2]}
        gl={{ antialias: true, stencil: false, localClippingEnabled: true }}
        shadows={{ type: THREE.PCFShadowMap }}
        onCreated={({ gl }) => {
          // ScenePostFX owns tonemapping via EffectComposer — avoid double application.
          gl.toneMapping = THREE.NoToneMapping;
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
              <BakedScene />
              <WorkClothStripScene activeRoom={activeRoom} />
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
