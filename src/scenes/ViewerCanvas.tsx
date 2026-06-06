// @ts-nocheck
import React, { useEffect } from "react";
import { OrbitControls, PerspectiveCamera, useGLTF } from "@react-three/drei";
import Env from "./Env";
import ViewerScene from "./ViewerScene";
import { WorkClothStripScene } from "../work/ClothStrip";
import { GLTF_URL_TEST } from "../models/urls";
import { useViewerSceneControlsStore } from "../store/viewerScene";
import { HomeSceneSpotLight } from "./HomeSceneSpotLight";
import HomeSceneSpotLightGui from "./HomeSceneSpotLightGui";
import ViewerSceneGui from "./ViewerSceneGui";

/**
 * GLB viewer: orbit camera (no room parallax), env, spotlight, cloth.
 */
export default function ViewerCanvas() {
  useEffect(() => {
    useGLTF.preload(GLTF_URL_TEST);
    useViewerSceneControlsStore.getState().resetControls();
  }, []);

  return (
    <>
      <PerspectiveCamera makeDefault position={[3, 2, 5]} fov={45} near={0.01} far={1000} />
      <OrbitControls makeDefault target={[0, 0, 0]} enablePan enableDamping dampingFactor={0.08} />
      <Env
        hdrFiles="/main.hdr"
        showHdriBackground
        fogColor={0x000000}
        fogDensity={0}
        showShadowCatcher={false}
      />
      <HomeSceneSpotLight />
      {import.meta.env.DEV ? (
        <>
          <HomeSceneSpotLightGui />
          <ViewerSceneGui />
        </>
      ) : null}
      <ViewerScene />
      <WorkClothStripScene />
    </>
  );
}
