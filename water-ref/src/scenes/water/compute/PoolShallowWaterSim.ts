// @ts-nocheck
/**
 * WebGPU ripple sim — TSL port of the 2D wave-equation shader by
 * Nikos Papadopoulos (4rknova, 2019, CC BY-NC-SA 3.0).
 *
 *   h_n = MODIFIER * (-h_{n-2} + 0.5 * Σneighbors_{n-1}) + STRENGTH * impulse
 *
 * Buffers: hCurr (D_{n-1}, sampled by material), hPrev (D_{n-2}),
 * hScratch (D_n in progress). Two compute dispatches per step: write new
 * heights into scratch, then rotate (hPrev ← hCurr, hCurr ← hScratch).
 */
import * as THREE from "three";
import { POOL_SIM_DEFAULTS } from "../config/poolWaterDefaults";

export class PoolShallowWaterSim {
  readonly nw: number;
  readonly nh: number;
  ready = false;

  hBuffer = null;
  renderer = null;

  #hPrev = null;
  #hScratch = null;
  #uniforms = null;
  #stepKernel = null;
  #rotateKernel = null;
  #impulsePending = false;
  #impulseX = 0;
  #impulseY = 0;
  #impulseStrengthScale = 1;
  #cellCount = 0;
  #simOpts;

  constructor(gl, nw = POOL_SIM_DEFAULTS.gridSize, nh = nw, simOpts = {}) {
    this.renderer = gl;
    this.nw = nw;
    this.nh = nh;
    this.#cellCount = nw * nh;
    this.#simOpts = {
      modifier: simOpts.modifier ?? POOL_SIM_DEFAULTS.modifier,
      impulseRadius: simOpts.impulseRadius ?? POOL_SIM_DEFAULTS.impulseRadius,
      impulseStrength: simOpts.impulseStrength ?? POOL_SIM_DEFAULTS.impulseStrength,
    };
  }

  async init() {
    const { nw, nh } = this;
    const opts = this.#simOpts;
    const cellCount = this.#cellCount;

    const tsl = await import("three/tsl");
    const { Fn, instancedArray, instanceIndex, uniform, min, max, int, float, smoothstep, sqrt } =
      tsl;

    this.hBuffer = instancedArray(cellCount, "float");
    this.#hPrev = instancedArray(cellCount, "float");
    this.#hScratch = instancedArray(cellCount, "float");

    const uNw = uniform(nw);
    const uNh = uniform(nh);
    const uModifier = uniform(opts.modifier);
    const uImpulse = uniform(new THREE.Vector2(-1, -1));
    const uImpulseActive = uniform(0);
    const uImpulseRadius = uniform(opts.impulseRadius);
    const uImpulseStrength = uniform(opts.impulseStrength);
    const uImpulseStrengthScale = uniform(1);

    this.#uniforms = {
      uImpulse,
      uImpulseActive,
      uImpulseStrengthScale,
    };

    const hCurr = this.hBuffer;
    const hPrev = this.#hPrev;
    const hScratch = this.#hScratch;

    const idH = (i, j) => i.add(j.mul(uNw));
    const clampI = (i) => max(int(0), min(uNw.sub(int(1)), i));
    const clampJ = (j) => max(int(0), min(uNh.sub(int(1)), j));

    this.#stepKernel = Fn(() => {
      const idx = instanceIndex;
      const i = idx.mod(uNw);
      const j = idx.div(uNw);
      const iL = clampI(i.sub(int(1)));
      const iR = clampI(i.add(int(1)));
      const jU = clampJ(j.sub(int(1)));
      const jD = clampJ(j.add(int(1)));

      const sL = hCurr.element(idH(iL, j));
      const sR = hCurr.element(idH(iR, j));
      const sU = hCurr.element(idH(i, jU));
      const sD = hCurr.element(idH(i, jD));
      const s0 = hPrev.element(idx);

      const neighborAvg = sL.add(sR).add(sU).add(sD).mul(float(0.5));
      let d = neighborAvg.sub(s0).mul(uModifier);

      // Absorbing boundary — fade height over the outer 10 cells instead of
      // reflecting waves at the walls.
      const edgeBand = float(10);
      const distI = min(i.toFloat(), uNw.sub(int(1)).toFloat().sub(i.toFloat()));
      const distJ = min(j.toFloat(), uNh.sub(int(1)).toFloat().sub(j.toFloat()));
      const minEdgeDist = min(distI, distJ);
      const edgeAttenuation = smoothstep(float(0), edgeBand, minEdgeDist)
        .mul(float(0.3))
        .add(float(0.7));
      d = d.mul(edgeAttenuation);

      const dxi = i.toFloat().sub(uImpulse.x);
      const dyi = j.toFloat().sub(uImpulse.y);
      const dist = sqrt(dxi.mul(dxi).add(dyi.mul(dyi)));
      const inner = uImpulseRadius.mul(float(0.16));
      const outer = uImpulseRadius;
      const falloff = float(1).sub(smoothstep(inner, outer, dist));
      const impulse = uImpulseStrength.mul(uImpulseStrengthScale).mul(falloff).mul(uImpulseActive);
      d = d.add(impulse);

      hScratch.element(idx).assign(d);
    })().compute(cellCount);

    // Single rotation kernel — within one invocation hCurr is read into hPrev
    // before hCurr is overwritten by hScratch, and only the same idx is
    // touched on either buffer, so there is no cross-invocation race.
    this.#rotateKernel = Fn(() => {
      const idx = instanceIndex;
      const curr = hCurr.element(idx);
      hPrev.element(idx).assign(curr);
      hCurr.element(idx).assign(hScratch.element(idx));
    })().compute(cellCount);

    this.ready = true;
  }

  getResolutionW() {
    return this.nw;
  }
  getResolutionH() {
    return this.nh;
  }

  getHeightBuffer() {
    return this.hBuffer;
  }

  setImpulse(gx, gy, strengthScale = 1) {
    this.#impulseX = gx;
    this.#impulseY = gy;
    this.#impulseStrengthScale = strengthScale;
    this.#impulsePending = true;
  }

  async stepAsync({ substeps = POOL_SIM_DEFAULTS.substeps } = {}) {
    if (!this.ready) return;
    const u = this.#uniforms;
    for (let s = 0; s < substeps; s++) {
      const applyImpulse = this.#impulsePending && s === 0;
      if (applyImpulse) {
        u.uImpulse.value.set(this.#impulseX, this.#impulseY);
        u.uImpulseActive.value = 1;
        u.uImpulseStrengthScale.value = this.#impulseStrengthScale;
        this.#impulsePending = false;
        this.#impulseStrengthScale = 1;
      } else {
        u.uImpulseActive.value = 0;
        u.uImpulseStrengthScale.value = 1;
      }
      // Awaiting only the last dispatch still serializes compute → render
      // because the GPU command queue executes them in submit order.
      this.renderer.compute(this.#stepKernel);
      await this.renderer.computeAsync(this.#rotateKernel);
    }
  }

  step(opts) {
    return this.stepAsync(opts);
  }

  dispose() {
    this.ready = false;
  }
}
