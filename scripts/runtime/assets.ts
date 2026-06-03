// @ts-nocheck
import * as THREE from "three";

export function cloneSceneGraph(root, options = {}) {
  if (!root) return null;

  const { cloneMaterials = true, cloneGeometries = false } = options;

  const clonedRoot = root.clone(true);
  if (!cloneMaterials && !cloneGeometries) return clonedRoot;

  const sourceNodes = [];
  const clonedNodes = [];

  root.traverse((node) => {
    sourceNodes.push(node);
  });

  clonedRoot.traverse((node) => {
    clonedNodes.push(node);
  });

  for (let i = 0; i < sourceNodes.length; i += 1) {
    const sourceNode = sourceNodes[i];
    const clonedNode = clonedNodes[i];
    if (!sourceNode?.isMesh || !clonedNode?.isMesh) continue;

    if (cloneGeometries && sourceNode.geometry?.clone) {
      clonedNode.geometry = sourceNode.geometry.clone();
    }

    if (cloneMaterials && sourceNode.material) {
      if (Array.isArray(sourceNode.material)) {
        clonedNode.material = sourceNode.material.map(
          (material) => material?.clone?.() ?? material,
        );
      } else {
        clonedNode.material = sourceNode.material.clone?.() ?? sourceNode.material;
      }
    }
  }

  return clonedRoot;
}

export {
  configureTexture,
  createColorFallbackTexture,
  loadTextureAsset,
} from "../../src/lib/assets";

export function createLabelFallbackTexture(label, options = {}) {
  const {
    width = 512,
    height = 512,
    backgroundColor = "#333333",
    textColor = "#666666",
    font = "24px sans-serif",
  } = options;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return createColorFallbackTexture();

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = textColor;
  ctx.font = font;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, width / 2, height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  return configureTexture(texture);
}

export function loadTextureAssets(urls, options = {}) {
  return Promise.all(urls.map((url) => loadTextureAsset(url, options)));
}
