import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

/**
 * Archive Helmet - Glass material model rotating with tube
 * Ported from brev/js/Helmet.js to project conventions
 */

export async function createArchiveHelmet(scene) {
  const helmetState = {
    model: null,
    helmetScene: null,
    baseRotation: { x: Math.PI / 8, y: Math.PI / 2 },
  };

  // Create glass material
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    transmission: 1,
    thickness: 10,
    roughness: 0,
    metalness: 0.1,
    ior: 1.5,
    clearcoat: 0.1,
    clearcoatRoughness: 1.1,
    iridescenceThicknessRange: [100, 400],
    color: 0xffffff,
    opacity: 0.15,
    transparent: true,
    depthWrite: true,
  });

  // Load model
  return new Promise((resolve) => {
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      '/models/helmet.glb',
      (gltf) => {
        helmetState.helmetScene = gltf.scene;

        helmetState.helmetScene.traverse((object) => {
          if (object.isMesh) {
            object.scale.set(0.21, 0.21, 0.21);
            object.material = glassMaterial;
          }
        });

        helmetState.model = new THREE.Group();
        helmetState.model.add(helmetState.helmetScene);
        helmetState.model.rotation.set(helmetState.baseRotation.x, helmetState.baseRotation.y, 0);

        scene.add(helmetState.model);
        resolve(helmetState);
      },
      undefined,
      (error) => {
        console.warn('Failed to load helmet model:', error);
        // Return empty state if model fails to load
        resolve(helmetState);
      }
    );
  });
}

export function updateArchiveHelmet(helmetState, sharedState) {
  if (!helmetState || !helmetState.model) return;

  // Apply rotation based on tube angle
  helmetState.model.rotation.y = helmetState.baseRotation.y - sharedState.tubeAngle;
}

export function destroyArchiveHelmet(helmetState) {
  if (!helmetState) return;

  if (helmetState.model) {
    helmetState.model.traverse((object) => {
      if (object.isMesh) {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(m => m.dispose());
          } else {
            object.material.dispose();
          }
        }
      }
    });

    if (helmetState.model.parent) {
      helmetState.model.parent.remove(helmetState.model);
    }
  }

  helmetState.model = null;
  helmetState.helmetScene = null;
}
