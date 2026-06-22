import ScenePostFXGui from "./ScenePostFXGui";
import WorkSceneGui from "./WorkSceneGui";
import RoomCameraGui from "./RoomCameraGui";
import WaterGui from "./WaterGui";
import type { RoomNamespace } from "./cam/roomPoses";

type DevSceneControlsProps = {
  isRoom: boolean;
  activeRoom: RoomNamespace;
};

export default function DevSceneControls({ isRoom, activeRoom }: DevSceneControlsProps) {
  return (
    <>
      <ScenePostFXGui />
      {isRoom ? <RoomCameraGui activeRoom={activeRoom} /> : null}
      <WorkSceneGui enabled={activeRoom === "work"} />
      {isRoom ? <WaterGui /> : null}
    </>
  );
}
