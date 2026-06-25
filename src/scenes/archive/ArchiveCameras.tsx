import { PerspectiveCamera } from "@react-three/drei";

export default function ArchiveCameras() {
  return (
    <PerspectiveCamera
      makeDefault
      position={[0, 0, 10]}
      fov={75}
      near={0.1}
      far={1000}
    />
  );
}
