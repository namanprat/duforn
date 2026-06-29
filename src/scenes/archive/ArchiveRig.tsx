import { useEffect } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { ARCHIVE_CONFIG } from "./archiveConfig";
import { rigState } from "./rigState";

const damp = THREE.MathUtils.damp;
const clamp = THREE.MathUtils.clamp;

/** Arcball orbit damping (slerp lambda) — between the old yaw=4 / pitch=5 feel. */
const SPIN_DAMP = 4.5;
const X_AXIS = new THREE.Vector3(1, 0, 0);
const Y_AXIS = new THREE.Vector3(0, 1, 0);
const _qDelta = new THREE.Quaternion();
const _qTmp = new THREE.Quaternion();
const _qSpin = new THREE.Quaternion();

export default function ArchiveRig() {
  const { camera, gl } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;
    let down = false;
    let startX = 0;
    let startY = 0;
    const baseQuat = new THREE.Quaternion();
    let basePanX = 0;
    let basePanY = 0;
    let maxTravel = 0;

    const orbMode = () => rigState.morph < 0.05 && !rigState.isMorphing;
    const gridMode = () => rigState.morph > 0.95 && !rigState.isMorphing;

    const onDown = (e: PointerEvent) => {
      if (rigState.isMorphing) return;
      down = true;
      startX = e.clientX;
      startY = e.clientY;
      maxTravel = 0;
      rigState.isDragging = false;
      baseQuat.copy(rigState.orientationTarget);
      basePanX = rigState.gridPanTarget.x;
      basePanY = rigState.gridPanTarget.y;
      canvas.style.cursor = "grabbing";
    };

    const onMove = (e: PointerEvent) => {
      if (!down || rigState.isMorphing) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      maxTravel = Math.max(maxTravel, Math.hypot(dx, dy));

      if (gridMode()) {
        rigState.isDragging = maxTravel > ARCHIVE_CONFIG.clickThreshold;
        // 1:1 grab — convert pixel drag to world pan at the live camera distance.
        const cam = camera as THREE.PerspectiveCamera;
        const halfFov = (cam.fov * Math.PI) / 360;
        const h = gl.domElement.clientHeight || 1;
        // Grid pan speed per pixel of drag, inverted on both axes. Was 3× a 1:1
        // grab; reduced to 0.9, then bumped 30% (0.9 → 1.17) for a livelier drag.
        const worldPerPx = (1.17 * camera.position.z * Math.tan(halfFov)) / h;
        rigState.gridPanTarget.x = basePanX + dx * worldPerPx;
        rigState.gridPanTarget.y = basePanY - dy * worldPerPx;
        return;
      }

      if (!orbMode()) return;

      const threshold = "ontouchstart" in window ? 15 : ARCHIVE_CONFIG.clickThreshold;
      if (maxTravel > threshold) rigState.isDragging = true;

      // Arcball: apply the drag as a rotation around the world (= screen) axes,
      // pre-multiplied onto the pose at pointer-down. drag-x → yaw about screen-
      // vertical, drag-y → pitch about screen-horizontal, consistent from any angle.
      _qDelta.setFromAxisAngle(Y_AXIS, dx * ARCHIVE_CONFIG.spinSensitivity);
      _qTmp.setFromAxisAngle(X_AXIS, dy * ARCHIVE_CONFIG.spinSensitivity);
      _qDelta.multiply(_qTmp);
      rigState.orientationTarget.copy(_qDelta).multiply(baseQuat);
    };

    const onUp = () => {
      if (!down) return;
      down = false;
      rigState.isDragging = false;
      canvas.style.cursor = gridMode() || orbMode() ? "grab" : "default";
    };

    const onWheel = (e: WheelEvent) => {
      if (!orbMode()) return;
      e.preventDefault();
      rigState.zoom = clamp(
        rigState.zoom + e.deltaY * ARCHIVE_CONFIG.globeWheelSpeed,
        ARCHIVE_CONFIG.globeZoomMin,
        ARCHIVE_CONFIG.globeZoomMax,
      );
    };

    canvas.style.cursor = "grab";
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      canvas.style.cursor = "";
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("wheel", onWheel);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [gl, camera]);

  useFrame((_, delta) => {
    if (rigState.morph < 0.05 && !rigState.isDragging && !rigState.isMorphing) {
      // Gentle idle drift around the screen-vertical axis (horizontal globe spin).
      _qSpin.setFromAxisAngle(Y_AXIS, ARCHIVE_CONFIG.globeSpin * delta);
      rigState.orientationTarget.premultiply(_qSpin).normalize();
    }

    rigState.orientation.slerp(rigState.orientationTarget, 1 - Math.exp(-SPIN_DAMP * delta));

    rigState.gridPan.x = damp(
      rigState.gridPan.x,
      rigState.gridPanTarget.x,
      8,
      delta,
    );
    rigState.gridPan.y = damp(
      rigState.gridPan.y,
      rigState.gridPanTarget.y,
      8,
      delta,
    );

    // Camera keeps the orb zoom in every mode — entering grid no longer dollies,
    // so the grid renders at whatever size the user had in orb.
    camera.position.z = damp(camera.position.z, rigState.zoom, 1 / ARCHIVE_CONFIG.zoomDamp, delta);
    camera.position.x = damp(camera.position.x, 0, 5, delta);
    camera.position.y = damp(camera.position.y, 0, 5, delta);

    camera.rotation.x = damp(camera.rotation.x, 0, 5, delta);
    camera.rotation.y = damp(camera.rotation.y, 0, 5, delta);
    camera.rotation.z = damp(camera.rotation.z, 0, 5, delta);
  });

  return null;
}
