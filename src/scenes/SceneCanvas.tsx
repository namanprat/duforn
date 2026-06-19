import { Suspense } from "react";
import { useLocation } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import BakedScene from "./BakedScene";
import CameraRig from "./CameraRig";
import RoomCam from "./RoomCam";
import Env from "./Env";
import { WorkClothStripScene } from "../work/ClothStrip";
import ScenePostFX from "./ScenePostFX";
import ScenePostFXGui from "./ScenePostFXGui";
import WorkSceneGui from "./WorkSceneGui";
import RoomCameraGui from "./RoomCameraGui";
import { MAIN_POSE, poseToCameraPosition } from "./cam/roomPoses";
import { getRouteNamespace } from "../lib/route";

const MAIN_CAMERA = poseToCameraPosition(MAIN_POSE);

/**
 * Single persistent canvas for all rooms. Mounted once by the layout so it
 * survives route changes — RoomCam tweens the shared pose, CameraRig drives the
 * camera, BakedScene renders the unlit baked geometry.
 */
export default function SceneCanvas() {
  const location = useLocation();
  const activePage = getRouteNamespace(location.pathname);
  const activeRoom = activePage === "projectDetail" ? "main" : activePage;
  const isInteractive = activeRoom === "work" || activeRoom === "main";

  return (
    <div className={`scene_canvas_wrap${isInteractive ? " scene_canvas_wrap--interactive" : ""}`}>
      <Canvas
        camera={{
          position: [MAIN_CAMERA.x, MAIN_CAMERA.y, MAIN_CAMERA.z],
          fov: MAIN_POSE.fov,
          near: 0.1,
          far: 1000,
        }}
        gl={{ antialias: true, stencil: false }}
        shadows={{ type: THREE.PCFShadowMap }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.0; // tune against a Cycles reference render
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
      >
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
        <ScenePostFX />
        {import.meta.env.DEV ? (
          <>
            <ScenePostFXGui />
            <RoomCameraGui activeRoom={activeRoom} />
            <WorkSceneGui enabled={activeRoom === "work"} />
          </>
        ) : null}
      </Canvas>
    </div>
  );
}
