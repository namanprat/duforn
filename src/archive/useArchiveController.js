import { useEffect, useRef, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { debounce } from "../../scripts/runtime/timing.js";

const SCROLL_DELTA_PER_WHEEL = 0.002;
const SPIN_VELOCITY_PER_WHEEL = 0.004;
const SCROLL_LERP_BASE = 0.12;
const SPIN_DAMPING = 0.92;
const BASE_SPEED = 0.25;
const CENTER_STRENGTH = 0.4;
const CENTER_LERP = 0.08;

export function useArchiveController() {
  const { camera } = useThree();

  const state = useRef({
    tubeScrollTarget: 0,
    tubeScrollCurrent: 0,
    tubeSpinVelocity: 0,
    tubeNaturalDir: 1,
    tubeAngle: 0,
    rotationSpeedScaleTarget: 1,
    rotationSpeedScale: 1,
    targetCenterUv: new THREE.Vector2(0.5, 0.5),
    currentCenterUv: new THREE.Vector2(0.5, 0.5),
    mouseNdc: null,
    hoveredProject: null,
    time: 0,
  });

  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const tubeMeshesRef = useRef([]);

  const setTubeMeshes = useCallback((meshes) => {
    tubeMeshesRef.current = meshes;
  }, []);

  useEffect(() => {
    const onWheel = (e) => {
      e.preventDefault();
      state.current.tubeScrollTarget += e.deltaY * SCROLL_DELTA_PER_WHEEL;
      state.current.tubeSpinVelocity += e.deltaY * SPIN_VELOCITY_PER_WHEEL;
      if (e.deltaY < 0) state.current.tubeNaturalDir = -1;
      else if (e.deltaY > 0) state.current.tubeNaturalDir = 1;
    };

    const onMouseMove = (e) => {
      const nx = e.clientX / window.innerWidth;
      const ny = e.clientY / window.innerHeight;

      const cx = 0.5 + (Math.min(1, Math.max(0, nx)) - 0.5) * CENTER_STRENGTH;
      const cy = 0.5 + (Math.min(1, Math.max(0, ny)) - 0.5) * CENTER_STRENGTH;
      state.current.targetCenterUv.set(cx, cy);

      state.current.mouseNdc = new THREE.Vector2(nx * 2 - 1, -(ny * 2 - 1));

      mouseRef.current.set(nx * 2 - 1, -(ny * 2 - 1));
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const s = state.current;

    // Tube scroll lerp
    const scrollLerp = Math.min(SCROLL_LERP_BASE * (dt / 0.01666), 1.0);
    s.tubeScrollCurrent += (s.tubeScrollTarget - s.tubeScrollCurrent) * scrollLerp;

    // Spin damping
    s.tubeSpinVelocity *= Math.pow(SPIN_DAMPING, dt * 60);
    s.tubeSpinVelocity = Math.max(-2.0, Math.min(2.0, s.tubeSpinVelocity));

    // Rotation speed scale
    s.rotationSpeedScale += (s.rotationSpeedScaleTarget - s.rotationSpeedScale) * 0.12;
    const scaledDt = dt * s.rotationSpeedScale;
    const baseSpeed = s.tubeNaturalDir * BASE_SPEED;
    s.tubeAngle += (baseSpeed + s.tubeSpinVelocity) * scaledDt;

    // Grid center lerp
    s.currentCenterUv.lerp(s.targetCenterUv, CENTER_LERP);

    // Time
    s.time += dt;

    // Raycasting for hover
    if (tubeMeshesRef.current.length > 0) {
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(tubeMeshesRef.current);
      if (intersects.length > 0) {
        const name = intersects[0].object.userData.projectName;
        if (s.hoveredProject !== name) s.hoveredProject = name;
      } else if (s.hoveredProject !== null) {
        s.hoveredProject = null;
      }
    }
  });

  return { state, setTubeMeshes };
}
