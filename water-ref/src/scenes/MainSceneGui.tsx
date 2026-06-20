// @ts-nocheck
import { useControls, folder, button } from "leva";
import { useWebglStore } from "../store/webgl";
import { useHomeSceneControlsStore } from "../store/homeScene";
import { cameraBasePoseRef } from "../lib/cam/pose";
import { isRoomNamespace } from "../lib/cam/roomPoses";

const RAD_TO_DEG = 180 / Math.PI;
const DEG_TO_RAD = Math.PI / 180;

/**
 * Dev-only Leva panel for the main GLB transform (main route).
 * Wires to the existing `model` controls applied in Main.tsx.
 */
export default function MainSceneGui() {
  const activePage = useWebglStore((s) => s.activePage);
  const setControl = useHomeSceneControlsStore((s) => s.setControl);
  const resetControls = useHomeSceneControlsStore((s) => s.resetControls);
  const model = useHomeSceneControlsStore((s) => s.controls.model);
  const env = useHomeSceneControlsStore((s) => s.controls.env);
  const camera = useHomeSceneControlsStore((s) => s.controls.camera);

  // Camera pose is read per-frame by CameraRig from `cameraBasePoseRef`, not the
  // store, so writes must hit the live ref (visible immediately). On the main
  // page we also persist to the store (getMainCameraPose survives route round
  // trips); on contact/work the pose lives in ROOM_POSES, so we only push the
  // live ref for tuning and skip the store to avoid corrupting the main pose.
  const setCam = (key, v) => {
    if (activePage === "main") setControl(`camera.${key}`, v);
    cameraBasePoseRef.current[key] = v;
  };

  useControls(
    "Scene",
    {
      skybox: {
        value: env?.skybox ?? true,
        onChange: (v) => setControl("env.skybox", v),
      },
    },
    { collapsed: true },
    { render: () => activePage === "main" },
  );

  useControls(
    "Main GLB",
    {
      Position: folder({
        x: {
          value: model.x,
          min: -80,
          max: 80,
          step: 0.01,
          onChange: (v) => setControl("model.x", v),
        },
        y: {
          value: model.y,
          min: -80,
          max: 80,
          step: 0.01,
          onChange: (v) => setControl("model.y", v),
        },
        z: {
          value: model.z,
          min: -80,
          max: 80,
          step: 0.01,
          onChange: (v) => setControl("model.z", v),
        },
      }),
      Rotation: folder({
        rxDeg: {
          label: "x (deg)",
          value: model.rx * RAD_TO_DEG,
          min: -180,
          max: 180,
          step: 0.5,
          onChange: (v) => setControl("model.rx", v * DEG_TO_RAD),
        },
        ryDeg: {
          label: "y (deg)",
          value: model.ry * RAD_TO_DEG,
          min: -180,
          max: 180,
          step: 0.5,
          onChange: (v) => setControl("model.ry", v * DEG_TO_RAD),
        },
        rzDeg: {
          label: "z (deg)",
          value: model.rz * RAD_TO_DEG,
          min: -180,
          max: 180,
          step: 0.5,
          onChange: (v) => setControl("model.rz", v * DEG_TO_RAD),
        },
      }),
      scale: {
        value: model.scale,
        min: 0.01,
        max: 50,
        step: 0.01,
        onChange: (v) => setControl("model.scale", v),
      },
      Reset: button(() => resetControls()),
      "Log values": button(() => {
        const m = useHomeSceneControlsStore.getState().controls.model;
        console.info("[Main GLB]", JSON.stringify(m, null, 2));
      }),
    },
    { collapsed: false },
    { render: () => activePage === "main" },
  );

  useControls(
    "Camera",
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
      "Log values": button(() => {
        // ROOM_POSES (contact/work) are driven by the live ref, not the store,
        // so log the actual pose CameraRig is reading this frame.
        console.info("[Camera]", JSON.stringify(cameraBasePoseRef.current, null, 2));
      }),
    },
    { collapsed: false },
    { render: () => isRoomNamespace(activePage) },
  );

  return null;
}
