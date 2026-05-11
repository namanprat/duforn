// @ts-nocheck
/**
 * Ping-pong heightfield water simulation (height + velocity in R/G) for WebGPU.
 * Drop splat + wave update match webgpu-water-main update.frag / drop.frag logic.
 */
import * as THREE from "three";

export const DEFAULT_WATER_SIM_SIZE = 128;

function makeSimTarget(size: number) {
  return new THREE.RenderTarget(size, size, {
    type: THREE.HalfFloatType,
    format: THREE.RGBAFormat,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
    depthBuffer: false,
    stencilBuffer: false,
  });
}

export class WaterHeightfieldSim {
  /** @type {import('three/webgpu').WebGPURenderer} */
  renderer;
  size;
  targets;
  readIdx = 0;
  scene;
  camera;
  quad;
  splatQueue = [];
  uPrev;
  uDropCenter;
  uDropRadius;
  uDropStrength;
  uDelta;
  dropMaterial;
  updateMaterial;
  ready = false;
  _initPromise;

  constructor(renderer, size = DEFAULT_WATER_SIM_SIZE) {
    this.renderer = renderer;
    this.size = size;
    this.targets = [makeSimTarget(size), makeSimTarget(size)];
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.camera.position.set(0, 0, 1);
    this.camera.lookAt(0, 0, 0);
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
    this.scene.add(this.quad);
    this._initPromise = this._buildMaterials(size);
  }

  async _buildMaterials(size) {
    const { MeshBasicNodeMaterial } = await import("three/webgpu");
    const tsl = await import("three/tsl");
    const { Fn, float, vec2, vec4, uniform, uv, texture, max, cos, length } = tsl;

    const uPrev = uniform(this.targets[0].texture);
    const uDropCenter = uniform(new THREE.Vector2(0.5, 0.5));
    const uDropRadius = uniform(0.045);
    const uDropStrength = uniform(0.14);
    const uDelta = uniform(new THREE.Vector2(1 / size, 1 / size));

    const dropFrag = Fn(() => {
      const uvCoord = uv();
      const info = texture(uPrev, uvCoord);
      const dist = length(uvCoord.sub(uDropCenter));
      const drop = max(float(0), float(1).sub(dist.div(uDropRadius)));
      const dropVal = float(0.5).sub(cos(drop.mul(float(Math.PI))).mul(0.5));
      const h = info.r.add(dropVal.mul(uDropStrength));
      return vec4(h, info.g, float(0), float(1));
    });

    const dropMaterial = new MeshBasicNodeMaterial();
    dropMaterial.fragmentNode = dropFrag();

    const updateFrag = Fn(() => {
      const uvCoord = uv();
      const info = texture(uPrev, uvCoord);
      const dx = vec2(uDelta.x, float(0));
      const dy = vec2(float(0), uDelta.y);
      const avg = texture(uPrev, uvCoord.sub(dx))
        .r.add(texture(uPrev, uvCoord.sub(dy)).r)
        .add(texture(uPrev, uvCoord.add(dx)).r)
        .add(texture(uPrev, uvCoord.add(dy)).r)
        .mul(0.25);
      const v = info.g.add(avg.sub(info.r).mul(2)).mul(0.995);
      const h = info.r.add(v);
      return vec4(h, v, float(0), float(1));
    });

    const updateMaterial = new MeshBasicNodeMaterial();
    updateMaterial.fragmentNode = updateFrag();

    this.uPrev = uPrev;
    this.uDropCenter = uDropCenter;
    this.uDropRadius = uDropRadius;
    this.uDropStrength = uDropStrength;
    this.uDelta = uDelta;
    this.dropMaterial = dropMaterial;
    this.updateMaterial = updateMaterial;
    this.ready = true;
  }

  async init() {
    await this._initPromise;
    this.clear();
  }

  clear() {
    const gl = this.renderer;
    const prev = gl.getRenderTarget();
    for (const t of this.targets) {
      gl.setRenderTarget(t);
      gl.clear();
    }
    gl.setRenderTarget(prev);
    this.readIdx = 0;
  }

  dispose() {
    this.targets[0]?.dispose();
    this.targets[1]?.dispose();
    this.dropMaterial?.dispose?.();
    this.updateMaterial?.dispose?.();
    this.quad.geometry?.dispose();
  }

  splat(splat) {
    this.splatQueue.push(splat);
  }

  getReadTexture() {
    return this.targets[this.readIdx].texture;
  }

  _blit(material) {
    const gl = this.renderer;
    const read = this.readIdx;
    const write = 1 - read;
    this.uPrev.value = this.targets[read].texture;
    this.quad.material = material;
    gl.setRenderTarget(this.targets[write]);
    gl.clear();
    gl.render(this.scene, this.camera);
    gl.setRenderTarget(null);
    this.readIdx = write;
  }

  /**
   * Run after splats and two wave steps per frame (matches classic water demo stability).
   */
  step() {
    if (!this.ready) return;
    while (this.splatQueue.length > 0) {
      const s = this.splatQueue.shift();
      this.uDropCenter.value.copy(s.uv);
      if (s.radius != null) this.uDropRadius.value = s.radius;
      if (s.strength != null) this.uDropStrength.value = s.strength;
      this._blit(this.dropMaterial);
    }
    this._blit(this.updateMaterial);
    this._blit(this.updateMaterial);
  }
}
