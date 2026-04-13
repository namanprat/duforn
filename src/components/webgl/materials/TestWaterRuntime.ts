// @ts-nocheck
import * as THREE from "three";

const TMP_V2 = new THREE.Vector2();

class RippleSimulation {
  constructor(size = 128, damping = 0.985) {
    this.size = size;
    this.damping = damping;
    this.curr = new Float32Array(size * size);
    this.prev = new Float32Array(size * size);
    this.normalBytes = new Uint8Array(size * size * 4);
    this.texture = new THREE.DataTexture(this.normalBytes, size, size, THREE.RGBAFormat);
    this.texture.wrapS = THREE.RepeatWrapping;
    this.texture.wrapT = THREE.RepeatWrapping;
    this.texture.needsUpdate = true;
    this.texture.colorSpace = THREE.NoColorSpace;
  }

  addDrop(u, v, radius = 0.03, strength = 0.45) {
    const size = this.size;
    const cx = Math.floor(THREE.MathUtils.clamp(u, 0, 1) * (size - 1));
    const cy = Math.floor((1 - THREE.MathUtils.clamp(v, 0, 1)) * (size - 1));
    const rr = Math.max(2, Math.floor(radius * size));

    for (let y = -rr; y <= rr; y += 1) {
      for (let x = -rr; x <= rr; x += 1) {
        const px = cx + x;
        const py = cy + y;
        if (px < 1 || px >= size - 1 || py < 1 || py >= size - 1) continue;
        const dist = Math.sqrt(x * x + y * y) / rr;
        if (dist > 1) continue;
        const falloff = Math.cos(dist * Math.PI) * 0.5 + 0.5;
        this.curr[py * size + px] += strength * falloff;
      }
    }
  }

  step() {
    const size = this.size;
    const next = this.prev;
    const curr = this.curr;

    for (let y = 1; y < size - 1; y += 1) {
      for (let x = 1; x < size - 1; x += 1) {
        const i = y * size + x;
        const sum = curr[i - 1] + curr[i + 1] + curr[i - size] + curr[i + size];
        next[i] = (sum * 0.5 - next[i]) * this.damping;
      }
    }

    this.curr = next;
    this.prev = curr;

    for (let y = 1; y < size - 1; y += 1) {
      for (let x = 1; x < size - 1; x += 1) {
        const i = y * size + x;
        const hL = this.curr[i - 1];
        const hR = this.curr[i + 1];
        const hD = this.curr[i - size];
        const hU = this.curr[i + size];

        const nx = THREE.MathUtils.clamp((hL - hR) * 0.5 + 0.5, 0, 1);
        const ny = THREE.MathUtils.clamp((hD - hU) * 0.5 + 0.5, 0, 1);

        const b = i * 4;
        this.normalBytes[b] = (nx * 255) | 0;
        this.normalBytes[b + 1] = (ny * 255) | 0;
        this.normalBytes[b + 2] = 255;
        this.normalBytes[b + 3] = 255;
      }
    }

    this.texture.needsUpdate = true;
  }

  dispose() {
    this.texture.dispose();
  }
}

export function createWaterMaterial(simulation, controls) {
  const mat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#5f8fa5"),
    roughness: controls.waterRoughness,
    metalness: controls.waterMetalness,
    clearcoat: controls.waterClearcoat,
    clearcoatRoughness: controls.waterClearcoatRoughness,
    transmission: controls.waterTransmission,
    ior: controls.waterIor,
    thickness: controls.waterThickness,
    envMapIntensity: controls.waterEnvReflection,
    transparent: true,
    opacity: 0.98,
    normalMap: simulation.texture,
    normalScale: new THREE.Vector2(controls.waterNormalScale, controls.waterNormalScale),
  });
  mat.name = "TestWaterMaterial";
  return mat;
}

export function updateWaterMaterial(material, controls, elapsedTime) {
  if (!material) return;
  material.roughness = controls.waterRoughness;
  material.metalness = controls.waterMetalness;
  material.clearcoat = controls.waterClearcoat;
  material.clearcoatRoughness = controls.waterClearcoatRoughness;
  material.transmission = controls.waterTransmission;
  material.ior = controls.waterIor;
  material.thickness = controls.waterThickness;
  material.envMapIntensity = controls.waterEnvReflection;
  material.normalScale.set(controls.waterNormalScale, controls.waterNormalScale);

  TMP_V2.set(elapsedTime * 0.02, elapsedTime * 0.014);
  material.normalMap.offset.copy(TMP_V2);
}

export { RippleSimulation };
