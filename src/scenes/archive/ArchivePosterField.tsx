import { useMemo, useRef } from "react";
import { Text } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import ArchiveRig from "./ArchiveRig";
import PosterTile, { buildTileData, type TileData } from "./PosterTile";
import { assignGridSlots } from "./archiveGridPool";
import { ARCHIVE_CONFIG, ARCHIVE_PRIMARY_FONT } from "./archiveConfig";
import { fibonacciSpherePoints } from "./archiveLayout";
import { rigState } from "./rigState";
import { useArchiveTextures } from "./useArchiveTextures";

export default function ArchivePosterField() {
  const textures = useArchiveTextures();
  const { size } = useThree();
  const textMat = useRef<{ opacity: number } | null>(null);

  const tiles = useMemo<TileData[]>(() => {
    if (!textures.length) return [];

    const pts = fibonacciSpherePoints(ARCHIVE_CONFIG.tileCount, ARCHIVE_CONFIG.sphereRadius);
    return pts.map((globePos, i) => {
      const texture = textures[Math.floor(Math.random() * textures.length)]!;
      const img = texture.image as { width: number; height: number } | undefined;
      const aspect = img && img.height ? img.width / img.height : 1;
      return buildTileData(globePos, i, texture, aspect);
    });
  }, [textures]);

  useFrame(() => {
    if (rigState.morph > 0.95) {
      assignGridSlots(
        rigState.gridSlots,
        rigState.gridPan.x,
        rigState.gridPan.y,
        size.width,
        size.height,
        ARCHIVE_CONFIG.gridCameraZ,
        75,
      );
    }

    if (textMat.current) {
      textMat.current.opacity = 1 - rigState.morph;
    }
  });

  return (
    <>
      <ArchiveRig />
      <Text
        font={ARCHIVE_PRIMARY_FONT}
        fontSize={1.05}
        anchorX="center"
        anchorY="middle"
        position={[0, 0, 0]}
        renderOrder={0}
      >
        Archive
        <meshBasicMaterial
          ref={textMat}
          color="#f6f6f6"
          transparent
          opacity={1}
          depthTest
          depthWrite={false}
          toneMapped={false}
        />
      </Text>
      {tiles.map((t) => (
        <PosterTile key={t.index} data={t} textures={textures} />
      ))}
    </>
  );
}
