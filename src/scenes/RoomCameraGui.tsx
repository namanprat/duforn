import { button, folder, useControls } from "leva";
import { cameraBasePoseRef, type CameraPose } from "./cam/pose";
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
      Position: folder({
        orbitCenterX: {
          label: "center x",
          value: camera.orbitCenterX,
          min: -120,
          max: 120,
          step: 0.1,
          onChange: (v) => setCam("orbitCenterX", v),
        },
        orbitCenterY: {
          label: "center y",
          value: camera.orbitCenterY,
          min: -120,
          max: 120,
          step: 0.1,
          onChange: (v) => setCam("orbitCenterY", v),
        },
        orbitCenterZ: {
          label: "center z",
          value: camera.orbitCenterZ,
          min: -120,
          max: 120,
          step: 0.1,
          onChange: (v) => setCam("orbitCenterZ", v),
        },
        orbitRadius: {
          label: "radius",
          value: camera.orbitRadius,
          min: 0,
          max: 60,
          step: 0.1,
          onChange: (v) => setCam("orbitRadius", v),
        },
        cameraHeight: {
          label: "height",
          value: camera.cameraHeight,
          min: -60,
          max: 60,
          step: 0.1,
          onChange: (v) => setCam("cameraHeight", v),
        },
      }),
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
      "Log pose JSON": button(() => {
        const pose = { ...cameraBasePoseRef.current };
        console.info(`[Room Camera: ${room}]`, JSON.stringify(pose, null, 2));
      }),
    },
    { collapsed: false },
  );

  return null;
}
