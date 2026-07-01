import { PerspectiveCamera } from "@react-three/drei";
import { ARCHIVE_FOV } from "../cam/transitionFov";

export default function ArchiveCameras() {
  return (
    <PerspectiveCamera
      makeDefault
      position={[0, 0, 10]}
      fov={ARCHIVE_FOV}
      near={0.1}
      far={1000}
    />
  );
}
