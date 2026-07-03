import { button, folder, useControls } from "leva";
import { cameraBasePoseRef, cameraRigControlsRef, type CameraPose } from "./cam/pose";
import { ROOM_POSES, type RoomNamespace } from "./cam/roomPoses";

/**
 * Dev-only Leva panel for per-room camera pose tuning on any room route.
 */
export default function RoomCameraGui({ activeRoom }: { activeRoom: RoomNamespace }) {
  const room = activeRoom;
  const camera = ROOM_POSES[room];

  const setCam = (key: keyof CameraPose, value: number) => {
    cameraBasePoseRef.current[key] = value;
  };

  useControls(
    `Camera (${room})`,
    {
      Rotation: folder({
        orbitAngleDeg: {
          label: "orbit (deg)",
          value: camera.orbitAngleDeg,
          min: -180,
          max: 180,
          step: 0.5,
          onChange: (v) => setCam("orbitAngleDeg", v),
        },
        lookAtYawDeg: {
          label: "yaw (deg)",
          value: camera.lookAtYawDeg,
          min: -90,
          max: 90,
          step: 0.5,
          onChange: (v) => setCam("lookAtYawDeg", v),
        },
        lookAtPitchDeg: {
          label: "pitch (deg)",
          value: camera.lookAtPitchDeg,
          min: -90,
          max: 90,
          step: 0.5,
          onChange: (v) => setCam("lookAtPitchDeg", v),
        },
      }),
      fov: {
        value: camera.fov,
        min: 10,
        max: 120,
        step: 0.5,
        onChange: (v) => setCam("fov", v),
      },
      parallaxEnabled: {
        label: "pointer parallax",
        value: cameraRigControlsRef.current.parallaxEnabled,
        onChange: (v) => {
          cameraRigControlsRef.current.parallaxEnabled = v;
        },
      },
      "Log pose JSON": button(() => {
        const pose = { ...cameraBasePoseRef.current };
        console.info(`[Room Camera: ${room}]`, JSON.stringify(pose, null, 2));
      }),
    },
    { collapsed: false },
  );

  return null;
}
