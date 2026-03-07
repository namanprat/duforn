import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import {
  cloneSceneGraph,
  configureTexture,
  createColorFallbackTexture,
} from '../scripts/runtime/assets.js';

describe('runtime asset helpers', () => {
  it('clones mesh materials independently', () => {
    const original = new THREE.Group();
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: '#ffffff' })
    );
    original.add(mesh);

    const cloned = cloneSceneGraph(original);
    const originalMesh = original.children[0];
    const clonedMesh = cloned.children[0];

    expect(clonedMesh).not.toBe(originalMesh);
    expect(clonedMesh.material).not.toBe(originalMesh.material);
  });

  it('configures fallback textures consistently', () => {
    const texture = createColorFallbackTexture();
    configureTexture(texture);

    expect(texture.colorSpace).toBe(THREE.SRGBColorSpace);
    expect(texture.magFilter).toBe(THREE.LinearFilter);
    expect(texture.generateMipmaps).toBe(true);
  });
});