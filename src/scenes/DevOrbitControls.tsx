import { OrbitControls as DreiOrbitControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { cameraBasePoseRef, cameraRigControlsRef } from "./cam/pose";

/** Dev-only manual orbit — disables CameraRig while active. */
export default function DevOrbitControls() {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const enabled = cameraRigControlsRef.current.orbitControlEnabled;
    controls.enabled = enabled;
    if (!enabled) return;

    const base = cameraBasePoseRef.current;
    controls.target.set(base.orbitCenterX, base.orbitCenterY, base.orbitCenterZ);
  });

  return (
    <DreiOrbitControls
      ref={controlsRef}
      enabled={false}
      enableDamping
      dampingFactor={0.08}
    />
  );
}
