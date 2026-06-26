import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { rigState } from "./rigState";

const SIZE = 120;
const DIVISIONS = 60;
const COLOR = "#5a5a5a";
const ORB_Z = -9;
const SHIFT = 1;
const TILT = 0.08;
const lerp = THREE.MathUtils.lerp;

/** Line spacing (world units). Wrapping pan by this tiles the grid infinitely. */
const SPACING = SIZE / DIVISIONS;
const wrap = (v: number) => v - Math.round(v / SPACING) * SPACING;

/** Graph-paper backdrop — parallax orb grid morphs flat and follows pan. */
export default function ArchiveGridScene() {
  const ref = useRef<THREE.GridHelper>(null);

  useFrame(() => {
    const grid = ref.current;
    if (!grid) return;

    const m = rigState.morph;
    const materials = Array.isArray(grid.material) ? grid.material : [grid.material];
    for (const mat of materials) {
      if (mat) mat.opacity = lerp(0.55, 0.35, m);
    }

    if (m < 0.02) {
      const s = Math.sin(rigState.yaw);
      // Y stays put — the backdrop ignores the (infinite) pitch spin.
      grid.position.set(s * SHIFT, 0, ORB_Z);
      grid.rotation.set(Math.PI / 2, s * TILT, 0);
      grid.scale.setScalar(1);
      return;
    }

    if (m > 0.98) {
      // Stay at the orb depth so the grid keeps its orb size (no zoom-in). Wrap pan
      // by the line spacing — the uniform grid loops seamlessly = infinite.
      grid.position.set(wrap(rigState.gridPan.x), wrap(rigState.gridPan.y), ORB_Z);
      grid.rotation.set(Math.PI / 2, 0, 0);
      grid.scale.setScalar(1);
      return;
    }

    const eased = m * m * (3 - 2 * m);
    const s = Math.sin(rigState.yaw);
    grid.position.set(
      lerp(s * SHIFT, rigState.gridPan.x, eased),
      lerp(0, rigState.gridPan.y, eased),
      ORB_Z,
    );
    grid.rotation.set(Math.PI / 2, lerp(s * TILT, 0, eased), 0);
    grid.scale.setScalar(1);
  });

  return (
    <gridHelper
      ref={(node) => {
        ref.current = node;
        if (node) {
          node.renderOrder = -1;
          const materials = Array.isArray(node.material) ? node.material : [node.material];
          for (const mat of materials) {
            if (mat) {
              mat.transparent = true;
              mat.opacity = 0.55;
            }
          }
        }
      }}
      args={[SIZE, DIVISIONS, COLOR, COLOR]}
      rotation={[Math.PI / 2, 0, 0]}
      position={[0, 0, ORB_Z]}
    />
  );
}
