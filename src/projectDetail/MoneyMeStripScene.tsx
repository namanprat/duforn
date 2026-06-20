import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { MONEY_ME_STRIPS_BG, STRIP_PATHS } from "./moneyMeStrips/config";
import { readCssLengthPx } from "../lib/css-length";
import { useProjectCanvasAnchor } from "./ProjectCanvasAnchor";
import { applyClipping, createClipPlanes, screenToWorld, updateClipPlanes } from "./domAnchorUtils";

const ROTATION_DEG = 30;
const STRIP_Z = -5;
const BG_Z = -6;

function computeLayout(anchorWidth: number, stripW = 540) {
  const count = STRIP_PATHS.length;
  const theta = THREE.MathUtils.degToRad(ROTATION_DEG);
  const cosT = Math.cos(theta);
  const gapPx = readCssLengthPx("--spacing-space-3");
  const totalGaps = Math.max(0, count - 1) * gapPx;
  const fitStripW = (anchorWidth * cosT - totalGaps) / count;
  const scaledStripW = fitStripW * 1.43;
  const baseScale = scaledStripW / stripW;
  const spacing = scaledStripW / cosT + gapPx;
  return { spacing, baseScale };
}

export default function MoneyMeStripScene() {
  const { getAnchor } = useProjectCanvasAnchor("strips");
  const textures = useTexture([...STRIP_PATHS]);
  const { size } = useThree();
  const rootRef = useRef<THREE.Group>(null);
  const bgRef = useRef<THREE.Mesh>(null);
  const meshRefs = useRef<THREE.Mesh[]>([]);
  const clipPlanes = useMemo(() => createClipPlanes(), []);

  useMemo(() => {
    textures.forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.minFilter = THREE.LinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.anisotropy = 4;
    });
  }, [textures]);

  const stripDims = useMemo(
    () =>
      textures.map((t) => {
        const img = t.image as HTMLImageElement | undefined;
        const w = img?.naturalWidth ?? img?.width ?? 540;
        const h = img?.naturalHeight ?? img?.height ?? 3596;
        return { w, h };
      }),
    [textures],
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

    const { baseScale, spacing } = computeLayout(world.width, stripDims[0]?.w ?? 540);

    // Continuous parallax: drift the diagonal strips as the section passes through
    // the viewport. progress ~0 as the anchor enters from the bottom, ~1 as it
    // exits past the top — unbounded across the whole pass so the strip "scrolls
    // past" with the page. No ScrollTrigger; driven live off the anchor rect.
    const progress = (size.height - rect.top) / (size.height + rect.height);
    const driftAmount = rect.height * 0.25;
    const offset = (progress - 0.5) * 2 * driftAmount;
    const theta = THREE.MathUtils.degToRad(ROTATION_DEG);
    const axisX = -Math.sin(theta);
    const axisY = Math.cos(theta);

    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      mesh.scale.set(baseScale, baseScale, 1);
      const baseX = (i - (STRIP_PATHS.length - 1) / 2) * spacing;
      const dir = i % 2 === 0 ? 1 : -1;
      mesh.position.x = baseX + offset * dir * axisX;
      mesh.position.y = offset * dir * axisY;
    });
  });

  const initialSpacing = computeLayout(800, stripDims[0]?.w ?? 540).spacing;

  return (
    <group ref={rootRef} renderOrder={1}>
      <mesh ref={bgRef} position={[0, 0, BG_Z]} renderOrder={1}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color={MONEY_ME_STRIPS_BG} />
      </mesh>
      <group position={[0, 0, STRIP_Z]} renderOrder={2}>
        {textures.map((tex, i) => {
          const { w, h } = stripDims[i];
          const x = (i - (STRIP_PATHS.length - 1) / 2) * initialSpacing;
          return (
            <mesh
              key={STRIP_PATHS[i]}
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
