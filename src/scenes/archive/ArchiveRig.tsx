import { useEffect } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { ARCHIVE_CONFIG } from "./archiveConfig";
import { rigState } from "./rigState";

const damp = THREE.MathUtils.damp;
const clamp = THREE.MathUtils.clamp;

export default function ArchiveRig() {
  const { camera, gl } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;
    let down = false;
    let startX = 0;
    let startY = 0;
    let baseA = 0;
    let baseB = 0;
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
      baseA = rigState.yawTarget;
      baseB = rigState.pitchTarget;
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
        // 1.5× a 1:1 grab — grid moves faster than the cursor. Inverted on both axes.
        const worldPerPx = (3 * camera.position.z * Math.tan(halfFov)) / h;
        rigState.gridPanTarget.x = basePanX + dx * worldPerPx;
        rigState.gridPanTarget.y = basePanY - dy * worldPerPx;
        return;
      }

      if (!orbMode()) return;

      const threshold = "ontouchstart" in window ? 15 : ARCHIVE_CONFIG.clickThreshold;
      if (maxTravel > threshold) rigState.isDragging = true;

      // Both axes spin freely — top-to-bottom drag rotates the orb infinitely (no clamp).
      rigState.yawTarget = baseA + dx * ARCHIVE_CONFIG.spinSensitivity;
      rigState.pitchTarget = baseB + dy * ARCHIVE_CONFIG.spinSensitivity;
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
      rigState.yawTarget += ARCHIVE_CONFIG.globeSpin * delta;
      rigState.pitchTarget += ARCHIVE_CONFIG.globeSpin * delta;
    }

    rigState.yaw = damp(rigState.yaw, rigState.yawTarget, 4, delta);
    rigState.pitch = damp(rigState.pitch, rigState.pitchTarget, 5, delta);

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
