import * as THREE from "three";
import { POOL_SIM_DEFAULTS } from "../config/poolWaterDefaults";
import { ShallowWaterState, createShallowWaterParams } from "./shallowWaterCPU";

/** WebGL: CPU shallow water + height DataTexture for materials. */
export class PoolShallowWaterSimCPU {
  readonly nw: number;
  readonly nh: number;
  ready = true;
  private state: ShallowWaterState;
  private heightTexture: THREE.DataTexture;
  private impulsePending = false;
  private impulseX = 0;
  private impulseY = 0;
  private impulseStrengthScale = 1;

  constructor(
    nw = POOL_SIM_DEFAULTS.gridSize,
    nh = nw,
    simOpts: Partial<{
      modifier: number;
      impulseStrength: number;
      impulseRadius: number;
    }> = {},
  ) {
    this.nw = nw;
    this.nh = nh;
    this.state = new ShallowWaterState(createShallowWaterParams(nw, nh, simOpts));
    this.heightTexture = new THREE.DataTexture(
      new Uint8Array(nw * nh * 4),
      nw,
      nh,
      THREE.RGBAFormat,
    );
    this.heightTexture.minFilter = THREE.LinearFilter;
    this.heightTexture.magFilter = THREE.LinearFilter;
    this.heightTexture.wrapS = THREE.ClampToEdgeWrapping;
    this.heightTexture.wrapT = THREE.ClampToEdgeWrapping;
    this.heightTexture.needsUpdate = true;
  }

  getResolutionW() {
    return this.nw;
  }

  getResolutionH() {
    return this.nh;
  }

  getHeightTexture() {
    return this.heightTexture;
  }

  setImpulse(gx: number, gy: number, strengthScale = 1) {
    this.impulseX = gx;
    this.impulseY = gy;
    this.impulseStrengthScale = strengthScale;
    this.impulsePending = true;
  }

  step({ substeps = POOL_SIM_DEFAULTS.substeps } = {}) {
    if (this.impulsePending) {
      this.state.applyImpulse(this.impulseX, this.impulseY, this.impulseStrengthScale);
      this.impulsePending = false;
      this.impulseStrengthScale = 1;
    }
    for (let s = 0; s < substeps; s++) this.state.substep();
    this.uploadHeightTexture();
  }

  async stepAsync(opts?: { substeps?: number }) {
    return this.step(opts);
  }

  private uploadHeightTexture() {
    const { nw, nh } = this;
    const data = this.heightTexture.image.data as Uint8Array;
    const h = this.state.h;
    for (let j = 0; j < nh; j++) {
      for (let i = 0; i < nw; i++) {
        const k = (j * nw + i) * 4;
        const v = h[i + nw * j];
        data[k] = Math.min(255, Math.max(0, Math.round((v * 0.5 + 0.5) * 255)));
        data[k + 3] = 255;
      }
    }
    this.heightTexture.needsUpdate = true;
  }

  dispose() {
    this.heightTexture.dispose();
  }
}
