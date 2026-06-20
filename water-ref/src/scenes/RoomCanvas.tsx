// @ts-nocheck
import React, { useEffect } from "react";
import Env from "./Env";
import RoomCameraRig from "./RoomCameraRig";
import Main from "./Main";
import { WorkClothStripScene } from "../work/ClothStrip";
import { registerRoomAssetTasks } from "../models/gen/preloads";
import { HomeSceneSpotLight } from "./HomeSceneSpotLight";
import HomeSceneSpotLightGui from "./HomeSceneSpotLightGui";
import MainSceneGui from "./MainSceneGui";
import CausticsGui from "./water/CausticsGui";
import { useHomeSceneControlsStore } from "../store/homeScene";

/**
 * Persistent multi-room scene: one model, one camera, GSAP-driven room poses.
 */
export default function RoomCanvas() {
  const skybox = useHomeSceneControlsStore((s) => s.controls.env?.skybox ?? true);

  useEffect(() => {
    registerRoomAssetTasks();
  }, []);

  return (
    <>
      <RoomCameraRig />
      <Env
        hdrFiles="/home.hdr"
        showHdriBackground={skybox}
        fogColor={0x000000}
        fogDensity={0}
        showShadowCatcher={false}
      />
      <HomeSceneSpotLight />
      {import.meta.env.DEV ? (
        <>
          <MainSceneGui />
          <HomeSceneSpotLightGui />
          <CausticsGui />
        </>
      ) : null}
      <Main />
      <WorkClothStripScene />
    </>
  );
}
