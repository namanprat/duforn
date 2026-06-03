// @ts-nocheck
import React, { useEffect } from "react";
import Env from "./Env";
import RoomCameraRig from "./RoomCameraRig";
import Main from "./Main";
import HomeSceneCameraSync from "./HomeSceneCameraSync";
import { WorkClothStripScene } from "../work/ClothStrip";
import { registerRoomAssetTasks } from "../models/gen/preloads";
import { HomeSceneSpotLight } from "./HomeSceneSpotLight";
import HomeSceneSpotLightGui from "./HomeSceneSpotLightGui";

/**
 * Persistent multi-room scene: one model, one camera, GSAP-driven room poses.
 */
export default function RoomCanvas() {
  useEffect(() => {
    registerRoomAssetTasks();
  }, []);

  return (
    <>
      <RoomCameraRig />
      <Env
        hdrFiles="/main.hdr"
        showHdriBackground
        fogColor={0x000000}
        fogDensity={0}
        showShadowCatcher={false}
      />
      <HomeSceneCameraSync />
      <HomeSceneSpotLight />
      {import.meta.env.DEV ? <HomeSceneSpotLightGui /> : null}
      <Main />
      <WorkClothStripScene />
    </>
  );
}
