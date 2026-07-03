import WorkSceneGui from "./WorkSceneGui";
import RoomCameraGui from "./RoomCameraGui";
import WaterGui from "./WaterGui";
import GlassGui from "./GlassGui";
import type { RoomNamespace } from "./cam/roomPoses";

type DevSceneControlsProps = {
  isRoom: boolean;
  activeRoom: RoomNamespace;
};

export default function DevSceneControls({ isRoom, activeRoom }: DevSceneControlsProps) {
  return (
    <>
      {isRoom ? <RoomCameraGui activeRoom={activeRoom} /> : null}
      <WorkSceneGui enabled={activeRoom === "work"} />
      {isRoom ? <WaterGui /> : null}
      {isRoom ? <GlassGui /> : null}
    </>
  );
}
