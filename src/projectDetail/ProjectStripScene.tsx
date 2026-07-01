import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { configureTexture, createColorFallbackTexture, loadTextureAsset } from "../lib/assets";
import { readCssLengthPx } from "../lib/css-length";
import { useProjectCanvasAnchor } from "./ProjectCanvasAnchor";
import { applyClipping, createClipPlanes, screenToWorld, updateClipPlanes } from "./domAnchorUtils";

const ROTATION_DEG = 30;
const STRIP_Z = -5;
const BG_Z = -6;

const stripTextureOptions = {
  colorSpace: THREE.SRGBColorSpace,
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
  generateMipmaps: false,
  anisotropy: 4,
} as const;

function computeLayout(anchorWidth: number, stripCount: number, stripW = 540) {
  const theta = THREE.MathUtils.degToRad(ROTATION_DEG);
  const cosT = Math.cos(theta);
  const gapPx = readCssLengthPx("--spacing-space-3");
  const totalGaps = Math.max(0, stripCount - 1) * gapPx;
  const fitStripW = (anchorWidth * cosT - totalGaps) / stripCount;
  const scaledStripW = fitStripW * 1.43;
  const baseScale = scaledStripW / stripW;
  const spacing = scaledStripW / cosT + gapPx;
  return { spacing, baseScale };
}

type ProjectStripSceneProps = {
  stripPaths: readonly string[];
  stripBg: string;
};

export default function ProjectStripScene({ stripPaths, stripBg }: ProjectStripSceneProps) {
  const { getAnchor } = useProjectCanvasAnchor("strips");
  const fallbackTextures = useMemo(
    () => stripPaths.map(() => createColorFallbackTexture(stripTextureOptions)),
    [stripPaths],
  );
  const [textures, setTextures] = useState<THREE.Texture[] | null>(null);
  const activeTextures = textures ?? fallbackTextures;
  const { size } = useThree();
  const rootRef = useRef<THREE.Group>(null);
  const bgRef = useRef<THREE.Mesh>(null);
  const meshRefs = useRef<THREE.Mesh[]>([]);
  const clipPlanes = useMemo(() => createClipPlanes(), []);

  useEffect(() => {
    if (stripPaths.length === 0) {
      setTextures(null);
      return;
    }
    let cancelled = false;
    Promise.all(stripPaths.map((url) => loadTextureAsset(url, stripTextureOptions)))
      .then((loaded) => {
        if (!cancelled) {
          setTextures(loaded.map((t) => configureTexture(t, stripTextureOptions)));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [stripPaths]);

  const stripDims = useMemo(
    () =>
      activeTextures.map((t) => {
        const img = t.image as HTMLImageElement | undefined;
        const w = img?.naturalWidth ?? img?.width ?? 540;
        const h = img?.naturalHeight ?? img?.height ?? 3596;
        return { w, h };
      }),
    [activeTextures],
  );

  const applyClippingToMeshes = () => {
    const bgMat = bgRef.current?.material as THREE.MeshBasicMaterial | undefined;
    const stripMats = meshRefs.current.map((mesh) => mesh?.material as THREE.MeshBasicMaterial);
    applyClipping(clipPlanes, [bgMat, ...stripMats]);
  };

  useFrame(() => {
    const anchor = getAnchor();
    const root = rootRef.current;
    const bg = bgRef.current;
    if (!root) return;
    if (!anchor) {
      root.visible = false;
      return;
    }

    const rect = anchor.getBoundingClientRect();
    const world = screenToWorld(rect, size.width, size.height);
    root.visible = world.visible;
    if (!world.visible) return;

    updateClipPlanes(clipPlanes, rect, size.width, size.height);
    applyClippingToMeshes();

    root.position.set(world.x, world.y, 0);
    if (bg) bg.scale.set(world.width, world.height, 1);

    const { baseScale, spacing } = computeLayout(
      world.width,
      stripPaths.length,
      stripDims[0]?.w ?? 540,
    );

    const progress = (size.height - rect.top) / (size.height + rect.height);
    const driftAmount = rect.height * 0.25;
    const offset = (progress - 0.5) * 2 * driftAmount;
    const theta = THREE.MathUtils.degToRad(ROTATION_DEG);
    const axisX = -Math.sin(theta);
    const axisY = Math.cos(theta);

    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      mesh.scale.set(baseScale, baseScale, 1);
      const baseX = (i - (stripPaths.length - 1) / 2) * spacing;
      const dir = i % 2 === 0 ? 1 : -1;
      mesh.position.x = baseX + offset * dir * axisX;
      mesh.position.y = offset * dir * axisY;
    });
  });

  const initialSpacing = computeLayout(800, stripPaths.length, stripDims[0]?.w ?? 540).spacing;

  return (
    <group ref={rootRef} renderOrder={1}>
      <mesh ref={bgRef} position={[0, 0, BG_Z]} renderOrder={1}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color={stripBg} />
      </mesh>
      <group position={[0, 0, STRIP_Z]} renderOrder={2}>
        {activeTextures.map((tex, i) => {
          const { w, h } = stripDims[i];
          const x = (i - (stripPaths.length - 1) / 2) * initialSpacing;
          return (
            <mesh
              key={stripPaths[i]}
              ref={(el) => {
                if (el) meshRefs.current[i] = el;
              }}
              position={[x, 0, 0]}
              rotation={[0, 0, THREE.MathUtils.degToRad(ROTATION_DEG)]}
              renderOrder={2}
            >
              <planeGeometry args={[w, h]} />
              <meshBasicMaterial map={tex} transparent />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}
