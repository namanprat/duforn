// @ts-nocheck
import * as THREE from "three";
import { SPIRAL_CONFIG, SPIRAL_TOTAL_TILES } from "./spiralConfig";

export type SpiralTileLayout = {
  geometry: THREE.BufferGeometry;
  textureIndex: number;
  tileRotationY: number;
  meshPositionY: number;
};

/** Build curved spiral tile geometries — same layout math as deadlock-studios Spiral.jsx */
export function buildSpiralTileLayouts(): SpiralTileLayout[] {
  const angleStep = (Math.PI * 2) / SPIRAL_CONFIG.tilesPerRevolution;
  const tileEdgesY = [0];

  for (let i = 0; i < SPIRAL_TOTAL_TILES; i++) {
    const progress = i / SPIRAL_TOTAL_TILES;
    const radius =
      SPIRAL_CONFIG.startRadius + (SPIRAL_CONFIG.endRadius - SPIRAL_CONFIG.startRadius) * progress;
    const arcWidth = (2 * Math.PI * radius) / SPIRAL_CONFIG.tilesPerRevolution;
    const tileHeight = arcWidth * SPIRAL_CONFIG.tileHeightRatio;
    tileEdgesY.push(
      tileEdgesY[i] - (tileHeight + SPIRAL_CONFIG.spiralGap) / SPIRAL_CONFIG.tilesPerRevolution,
    );
  }

  const layouts: SpiralTileLayout[] = [];

  for (let i = 0; i < SPIRAL_TOTAL_TILES; i++) {
    const progress = i / SPIRAL_TOTAL_TILES;
    const radius =
      SPIRAL_CONFIG.startRadius + (SPIRAL_CONFIG.endRadius - SPIRAL_CONFIG.startRadius) * progress;
    const arcWidth = (2 * Math.PI * radius) / SPIRAL_CONFIG.tilesPerRevolution;
    const tileHeight = arcWidth * SPIRAL_CONFIG.tileHeightRatio;
    const tileAngle = arcWidth / radius + SPIRAL_CONFIG.tileOverlap;

    const centerY = (tileEdgesY[i] + tileEdgesY[i + 1]) / 2;
    const slope = tileEdgesY[i + 1] - tileEdgesY[i];

    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    const segments = SPIRAL_CONFIG.tileSegments;

    for (let row = 0; row <= 1; row++) {
      for (let col = 0; col <= segments; col++) {
        const angle = (col / segments - 0.5) * tileAngle;
        positions.push(
          Math.sin(angle) * radius,
          (row - 0.5) * tileHeight + (col / segments - 0.5) * slope,
          Math.cos(angle) * radius,
        );
        uvs.push(col / segments, row);
      }
    }

    for (let col = 0; col < segments; col++) {
      const current = col;
      const below = current + segments + 1;
      indices.push(current, below, current + 1, below, below + 1, current + 1);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    layouts.push({
      geometry,
      textureIndex: i,
      tileRotationY: i * angleStep,
      meshPositionY: centerY,
    });
  }

  return layouts;
}

export function getSpiralHeight(): number {
  const tileEdgesY = [0];
  for (let i = 0; i < SPIRAL_TOTAL_TILES; i++) {
    const progress = i / SPIRAL_TOTAL_TILES;
    const radius =
      SPIRAL_CONFIG.startRadius + (SPIRAL_CONFIG.endRadius - SPIRAL_CONFIG.startRadius) * progress;
    const arcWidth = (2 * Math.PI * radius) / SPIRAL_CONFIG.tilesPerRevolution;
    const tileHeight = arcWidth * SPIRAL_CONFIG.tileHeightRatio;
    tileEdgesY.push(
      tileEdgesY[i] - (tileHeight + SPIRAL_CONFIG.spiralGap) / SPIRAL_CONFIG.tilesPerRevolution,
    );
  }
  return Math.abs(tileEdgesY[SPIRAL_TOTAL_TILES]);
}
