import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { getCaseStudy } from "../content/projects";
import { configureTexture, createColorFallbackTexture, loadTextureAsset } from "../lib/assets";
import { useProjectCanvasAnchor } from "./ProjectCanvasAnchor";
import {
  applyClipping,
  coverPlaneScale,
  createClipPlanes,
  screenToWorld,
  updateClipPlanes,
} from "./domAnchorUtils";

const COVER_Z = -5;

const coverTextureOptions = {
  colorSpace: THREE.SRGBColorSpace,
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
  generateMipmaps: false,
  anisotropy: 4,
} as const;

/** Hero cover image rendered into the unified canvas, tracking the DOM anchor
 *  reserved by ProjectCoverAnchor — same screen-to-world approach as the strips. */
export default function ProjectCoverScene() {
  const { pathname } = useLocation();
  const coverSrc = getCaseStudy(pathname)?.coverSrc ?? "";
  const { getAnchor } = useProjectCanvasAnchor("cover");
  const fallbackTexture = useMemo(
    () => createColorFallbackTexture(coverTextureOptions),
    [],
  );
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const activeTexture = texture ?? fallbackTexture;
  const { size } = useThree();
  const rootRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const clipPlanes = useMemo(() => createClipPlanes(), []);

  useEffect(() => {
    if (!coverSrc) {
      setTexture(null);
      return;
    }
    let cancelled = false;
    loadTextureAsset(coverSrc, coverTextureOptions)
      .then((loaded) => {
        if (!cancelled) setTexture(configureTexture(loaded, coverTextureOptions));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [coverSrc]);

  const imageSize = useMemo(() => {
    const img = activeTexture.image as HTMLImageElement | undefined;
    return {
      w: img?.naturalWidth ?? img?.width ?? 1,
      h: img?.naturalHeight ?? img?.height ?? 1,
    };
  }, [activeTexture]);

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
        <meshBasicMaterial map={activeTexture} transparent />
      </mesh>
    </group>
  );
}
