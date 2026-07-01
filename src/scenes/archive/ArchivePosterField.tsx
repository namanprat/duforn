import { useMemo, useRef } from "react";
import { SWATCH_LIGHT } from "../../lib/siteColors";
import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import ArchiveRig from "./ArchiveRig";
import PosterTile, { buildTileData, type TileData } from "./PosterTile";
import { ARCHIVE_CONFIG, ARCHIVE_PRIMARY_FONT } from "./archiveConfig";
import { fibonacciSpherePoints } from "./archiveLayout";
import { rigState } from "./rigState";
import { useArchiveTextures } from "./useArchiveTextures";

export default function ArchivePosterField() {
  const textures = useArchiveTextures();
  const textMat = useRef<{ opacity: number } | null>(null);

  const tiles = useMemo<TileData[]>(() => {
    if (!textures.length) return [];

    const pts = fibonacciSpherePoints(ARCHIVE_CONFIG.tileCount, ARCHIVE_CONFIG.sphereRadius);
    const globePositions: typeof rigState.globePositions = [];
    const tileTextureIndices: number[] = [];
    const built = pts.map((globePos, i) => {
      const texIdx = Math.floor(Math.random() * textures.length);
      const texture = textures[texIdx]!;
      const img = texture.image as { width: number; height: number } | undefined;
      const aspect = img && img.height ? img.width / img.height : 1;
      globePositions.push(globePos);
      tileTextureIndices.push(texIdx);
      return buildTileData(globePos, i, texture, aspect);
    });
    rigState.globePositions = globePositions;
    rigState.tileTextureIndices = tileTextureIndices;
    return built;
  }, [textures]);

  useFrame(() => {
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
          color={SWATCH_LIGHT}
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
