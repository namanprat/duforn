import * as THREE from 'three';
import { archiveItems } from '../data/archive-items.js';

/**
 * Archive Matrix Tiles - 4-column grid layout with infinite vertical scroll
 * Ported from brev and archive-tube concepts, redesigned for matrix flow
 */

export async function createMatrixTiles(scene, shared) {
  const config = {
    cols: 4,
    rows: 3,              // Visible rows per frame
    tileWidth: 1.4,
    tileHeight: 1.75,
    colSpacing: 2.0,      // Distance between columns
    rowSpacing: 2.2,      // Distance between rows
    aspectRatio: 0.8,     // Width / Height of each tile
  };

  const tileState = {
    config,
    group: new THREE.Group(),
    tiles: [],            // All tile meshes
    textures: [],
    geometry: null,
    raycaster: new THREE.Raycaster(),
    mouse: new THREE.Vector2(),
    intersected: null,
  };

  // Load textures from archiveItems
  const loader = new THREE.TextureLoader();
  tileState.textures = await Promise.all(
    archiveItems.map(
      item =>
        new Promise(resolve => {
          loader.load(item.image, resolve, undefined, () => {
            // Fallback: create placeholder canvas texture
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 512;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(0, 0, 512, 512);
            ctx.fillStyle = '#444';
            ctx.font = 'bold 20px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(item.title, 256, 256);
            resolve(new THREE.CanvasTexture(canvas));
          });
        })
    )
  );

  // Create shared geometry for all tiles
  tileState.geometry = new THREE.PlaneGeometry(config.tileWidth, config.tileHeight);

  // Create grid of tiles (render many rows worth)
  const totalTiles = config.cols * config.rows * 3; // Extra rows for seamless wrapping
  for (let i = 0; i < totalTiles; i++) {
    const col = i % config.cols;
    const row = Math.floor(i / config.cols);

    // Position in grid
    const x = (col - (config.cols - 1) / 2) * config.colSpacing;
    const y = row * config.rowSpacing;

    // Material with texture
    const texIndex = i % archiveItems.length;
    const material = new THREE.MeshBasicMaterial({
      map: tileState.textures[texIndex],
      side: THREE.DoubleSide,
      toneMapped: false,
    });

    // Create mesh
    const mesh = new THREE.Mesh(tileState.geometry, material);
    mesh.position.set(x, y, 0);

    // Store metadata
    const item = archiveItems[texIndex];
    mesh.userData = {
      archiveId: item.id,
      archiveTitle: item.title,
      archiveYear: item.year,
      archiveDescription: item.description,
      archiveCategory: item.category,
      gridIndex: i,
      originalY: y,
    };

    tileState.tiles.push(mesh);
    tileState.group.add(mesh);
  }

  scene.add(tileState.group);
  return tileState;
}

export function updateMatrixTiles(tiles, dt, shared) {
  if (!tiles) return;

  const cfg = tiles.config;

  // Apply scroll damping
  shared.scrollVelocity *= Math.pow(0.92, dt * 60);
  shared.scrollVelocity = Math.max(-2.0, Math.min(2.0, shared.scrollVelocity));

  // Update scroll position
  shared.scrollCurrent += shared.scrollVelocity;

  // Wrapping height
  const wrapHeight = cfg.rows * cfg.rowSpacing * 1.5;

  // Wrap around
  if (shared.scrollCurrent > wrapHeight) {
    shared.scrollCurrent -= wrapHeight;
  } else if (shared.scrollCurrent < -wrapHeight) {
    shared.scrollCurrent += wrapHeight;
  }

  // Update tile positions based on scroll
  tiles.tiles.forEach(tile => {
    const newY = tile.userData.originalY - shared.scrollCurrent;
    tile.position.y = newY;

    // Apply perspective scaling based on distance from center (Z-depth effect)
    const distFromCenter = Math.abs(newY);
    const maxDist = cfg.rowSpacing * cfg.rows;
    const scale = Math.max(0.3, 1 - (distFromCenter / maxDist) * 0.4);
    tile.scale.set(scale, scale, 1);

    // Fade out far tiles
    const fadeStart = cfg.rowSpacing * cfg.rows * 0.7;
    if (Math.abs(newY) > fadeStart) {
      const fadeAmount = Math.min(1, (Math.abs(newY) - fadeStart) / (cfg.rowSpacing * 2));
      tile.material.opacity = Math.max(0.1, 1 - fadeAmount);
      tile.material.transparent = true;
    } else {
      tile.material.opacity = 1;
      tile.material.transparent = false;
    }
  });
}

export function raycastMatrixTiles(tiles, camera, shared) {
  if (!tiles) return;

  tiles.raycaster.setFromCamera(tiles.mouse, camera);

  // Only raycast visible tiles
  const visibleTiles = tiles.tiles.filter(t => {
    return Math.abs(t.position.y) < tiles.config.rowSpacing * tiles.config.rows;
  });

  const hits = tiles.raycaster.intersectObjects(visibleTiles);

  if (hits.length > 0) {
    const obj = hits[0].object;
    if (tiles.intersected !== obj) {
      tiles.intersected = obj;
      shared.hoveredProject = {
        title: obj.userData.archiveTitle,
        id: obj.userData.archiveId,
        year: obj.userData.archiveYear,
        description: obj.userData.archiveDescription,
        category: obj.userData.archiveCategory,
      };
    }
  } else {
    if (tiles.intersected) {
      tiles.intersected = null;
      shared.hoveredProject = null;
    }
  }
}

export function updateMatrixTilesMouseMove(tiles, event) {
  if (!tiles) return;
  tiles.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  tiles.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

export function destroyMatrixTiles(tiles) {
  if (!tiles) return;

  // Dispose all materials and textures
  tiles.tiles.forEach(tile => {
    if (tile.material) {
      tile.material.dispose();
      if (tile.material.map) tile.material.map.dispose();
    }
  });

  // Dispose geometry
  if (tiles.geometry) tiles.geometry.dispose();

  // Dispose textures
  tiles.textures.forEach(tex => tex.dispose());

  // Remove from scene
  if (tiles.group.parent) {
    tiles.group.parent.remove(tiles.group);
  }

  tiles.tiles = [];
  tiles.textures = [];
}
