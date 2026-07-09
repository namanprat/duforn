import { button, folder, useControls } from "leva";
import { cameraBasePoseRef, cameraRigControlsRef, type CameraPose } from "./cam/pose";
import { poseToCameraPosition, ROOM_POSES, type RoomNamespace } from "./cam/roomPoses";

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
          min: -150,
          max: 150,
          step: 0.01,
          onChange: (v) => setCam("orbitCenterX", v),
        },
        orbitCenterY: {
          label: "center y",
          value: camera.orbitCenterY,
          min: 0,
          max: 50,
          step: 0.01,
          onChange: (v) => setCam("orbitCenterY", v),
        },
        orbitCenterZ: {
          label: "center z",
          value: camera.orbitCenterZ,
          min: -150,
          max: 150,
          step: 0.01,
          onChange: (v) => setCam("orbitCenterZ", v),
        },
        orbitRadius: {
          label: "radius",
          value: camera.orbitRadius,
          min: 1,
          max: 30,
          step: 0.01,
          onChange: (v) => setCam("orbitRadius", v),
        },
        cameraHeight: {
          label: "height",
          value: camera.cameraHeight,
          min: -20,
          max: 20,
          step: 0.01,
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
      parallaxEnabled: {
        label: "pointer parallax",
        value: cameraRigControlsRef.current.parallaxEnabled,
        onChange: (v) => {
          if (cameraRigControlsRef.current.orbitControlEnabled) return;
          cameraRigControlsRef.current.parallaxEnabled = v;
        },
      },
      orbitControlEnabled: {
        label: "orbit control",
        value: cameraRigControlsRef.current.orbitControlEnabled,
        onChange: (v) => {
          cameraRigControlsRef.current.orbitControlEnabled = v;
          if (v) {
            cameraRigControlsRef.current.parallaxEnabled = false;
            cameraRigControlsRef.current.gyroEnabled = false;
          }
        },
      },
      "Log pose JSON": button(() => {
        const pose = { ...cameraBasePoseRef.current };
        const position = poseToCameraPosition(pose);
        console.info(`[Room Camera: ${room}]`, JSON.stringify({ ...pose, position }, null, 2));
      }),
    },
    { collapsed: false },
  );

  return null;
}
