import { useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { getCaseStudy } from "../content/projects";
import { useProjectCanvasAnchor } from "./ProjectCanvasAnchor";
import {
  applyClipping,
  coverPlaneScale,
  createClipPlanes,
  screenToWorld,
  updateClipPlanes,
} from "./domAnchorUtils";

const COVER_Z = -5;

/** Hero cover image rendered into the unified canvas, tracking the DOM anchor
 *  reserved by ProjectCoverAnchor — same screen-to-world approach as the strips. */
export default function ProjectCoverScene() {
  const { pathname } = useLocation();
  const coverSrc = getCaseStudy(pathname)?.coverSrc ?? "";
  const { getAnchor } = useProjectCanvasAnchor("cover");
  const texture = useTexture(coverSrc);
  const { size } = useThree();
  const rootRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const clipPlanes = useMemo(() => createClipPlanes(), []);

  useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = 4;
  }, [texture]);

  const imageSize = useMemo(() => {
    const img = texture.image as HTMLImageElement | undefined;
    return {
      w: img?.naturalWidth ?? img?.width ?? 1,
      h: img?.naturalHeight ?? img?.height ?? 1,
    };
  }, [texture]);

  useFrame(() => {
    const anchor = getAnchor();
    const root = rootRef.current;
    const mesh = meshRef.current;
    if (!root || !mesh) return;
    if (!anchor || !coverSrc) {
      root.visible = false;
      return;
    }

    const rect = anchor.getBoundingClientRect();
    const world = screenToWorld(rect, size.width, size.height);
    root.visible = world.visible;
    if (!world.visible) return;

    updateClipPlanes(clipPlanes, rect, size.width, size.height);
    applyClipping(clipPlanes, [mesh.material as THREE.Material]);

    root.position.set(world.x, world.y, 0);
    const { x, y } = coverPlaneScale(imageSize.w, imageSize.h, world.width, world.height);
    mesh.scale.set(x, y, 1);
  });

  return (
    <group ref={rootRef} renderOrder={1}>
      <mesh ref={meshRef} position={[0, 0, COVER_Z]} renderOrder={2}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={texture} transparent />
      </mesh>
    </group>
  );
}
