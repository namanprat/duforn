import { createSceneControlsStore } from "./scene";

/** Strip sits between the orbit center and camera along the orbit azimuth. */
function stripPoseFromOrbit(
  cx: number,
  cy: number,
  cz: number,
  orbitAngleDeg: number,
) {
  const rad = (orbitAngleDeg * Math.PI) / 180;
  const towardCamera = 3.5;
  return {
    x: cx + Math.cos(rad) * towardCamera + 0.5,
    y: cy - 0.5,
    z: cz + Math.sin(rad) * towardCamera,
    ry: ((orbitAngleDeg - 90) * Math.PI) / 180,
  };
}

const WORK_ORBIT = { cx: 5, cy: 17.5, cz: 0, orbitAngleDeg: -26 };
const WORK_STRIP_POSE = stripPoseFromOrbit(
  WORK_ORBIT.cx,
  WORK_ORBIT.cy,
  WORK_ORBIT.cz,
  WORK_ORBIT.orbitAngleDeg,
);

export const DEFAULT_WORK_SCENE_CONTROLS = {
  strip: {
    x: WORK_STRIP_POSE.x,
    y: WORK_STRIP_POSE.y,
    z: WORK_STRIP_POSE.z,
    rx: 0,
    ry: WORK_STRIP_POSE.ry,
    rz: 0,
    scale: 1.2,
    visibleItems: 7,
    gapSize: 0.04,
    curveRadius: 11,
    curveAmount: 2,
    stripHeight: 4,
    stripYOffset: 0,
    wheelSensitivity: 0.0028,
    dragSensitivity: 0.0068,
    dragVelocityScale: 0.0076,
    scrollLerp: 0.11,
    scrollDamping: 0.9,
    scrollDraggingDamping: 0.82,
    snapVelocityThreshold: 0.035,
    snapLerp: 0.18,
    snapEpsilon: 0.0025,
  },
};

export const useWorkSceneControlsStore = createSceneControlsStore(DEFAULT_WORK_SCENE_CONTROLS);
