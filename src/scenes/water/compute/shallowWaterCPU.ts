// @ts-nocheck
/**
 * CPU wave-equation step — port of the 2D wave shader by Nikos Papadopoulos
 * (4rknova, 2019, CC BY-NC-SA 3.0). Single height field, two-frame history:
 *
 *   h_n = MODIFIER * ( -h_{n-2} + 0.5 * (hL + hR + hU + hD)_{n-1} )
 *         + STRENGTH * impulse
 *
 * Drives the ripple buffer that the pool material samples. Class name kept
 * (`ShallowWaterState`) so the WebGL fallback and unit tests stay wired.
 */

import { POOL_SIM_DEFAULTS } from "../config/poolWaterDefaults";

export type ShallowWaterParams = {
  nw: number;
  nh: number;
  /** Wave propagation damping per step (MODIFIER in shader). */
  modifier: number;
  /** Impulse amplitude (STRENGTH in shader). */
  impulseStrength: number;
  /** Impulse falloff radius in cells. */
  impulseRadius: number;
};

export function createShallowWaterParams(
  nw: number,
  nh: number,
  opts: Partial<ShallowWaterParams> & { K?: number; G?: number; H?: number; dt?: number } = {},
): ShallowWaterParams {
  return {
    nw,
    nh,
    modifier: opts.modifier ?? POOL_SIM_DEFAULTS.modifier,
    impulseStrength: opts.impulseStrength ?? POOL_SIM_DEFAULTS.impulseStrength,
    impulseRadius: opts.impulseRadius ?? POOL_SIM_DEFAULTS.impulseRadius,
  };
}

export class ShallowWaterState {
  /** Most recent (signed) height field. */
  readonly h: Float32Array;
  /** One step ago. */
  readonly hPrev: Float32Array;
  private hNext: Float32Array;

  constructor(readonly params: ShallowWaterParams) {
    const { nw, nh } = params;
    this.h = new Float32Array(nw * nh);
    this.hPrev = new Float32Array(nw * nh);
    this.hNext = new Float32Array(nw * nh);
  }

  applyImpulse(gx: number, gy: number, strengthScale = 1): void {
    const { nw, nh, impulseRadius, impulseStrength } = this.params;
    const r = Math.max(3, Math.ceil(impulseRadius * 2.5));
    const i0 = Math.max(0, Math.floor(gx - r));
    const i1 = Math.min(nw - 1, Math.ceil(gx + r));
    const j0 = Math.max(0, Math.floor(gy - r));
    const j1 = Math.min(nh - 1, Math.ceil(gy + r));
    // smoothstep(radius, radius*0.16, dist) — matches shader's smoothstep(3, 0.5, len).
    const outer = impulseRadius;
    const inner = impulseRadius * 0.16;
    for (let j = j0; j <= j1; j++) {
      for (let i = i0; i <= i1; i++) {
        const dx = i - gx;
        const dy = j - gy;
        const d = Math.sqrt(dx * dx + dy * dy);
        const t = Math.max(0, Math.min(1, (outer - d) / Math.max(1e-6, outer - inner)));
        const w = t * t * (3 - 2 * t);
        this.h[i + nw * j] += impulseStrength * strengthScale * w;
      }
    }
  }

  substep(): void {
    const { nw, nh, modifier } = this.params;
    const h = this.h;
    const hPrev = this.hPrev;
    const hNext = this.hNext;
    // Absorbing boundary — matches GPU sim. Waves fade as they approach the
    // outer ~10 cells instead of reflecting (Neumann clamp).
    const edgeBand = 10;
    for (let j = 0; j < nh; j++) {
      const jUp = Math.max(0, j - 1);
      const jDn = Math.min(nh - 1, j + 1);
      const distJ = Math.min(j, nh - 1 - j);
      for (let i = 0; i < nw; i++) {
        const iL = Math.max(0, i - 1);
        const iR = Math.min(nw - 1, i + 1);
        const sum = h[iL + nw * j] + h[iR + nw * j] + h[i + nw * jUp] + h[i + nw * jDn];
        const idx = i + nw * j;
        const distI = Math.min(i, nw - 1 - i);
        const minEdgeDist = Math.min(distI, distJ);
        const t = Math.max(0, Math.min(1, minEdgeDist / edgeBand));
        const smooth = t * t * (3 - 2 * t);
        const edgeAttenuation = 0.7 + 0.3 * smooth;
        hNext[idx] = modifier * (-hPrev[idx] + 0.5 * sum) * edgeAttenuation;
      }
    }
    // rotate: prev <- curr, curr <- next
    this.hPrev.set(h);
    this.h.set(hNext);
  }

  maxAbsH(): number {
    const h = this.h;
    let m = 0;
    for (let k = 0; k < h.length; k++) {
      const a = Math.abs(h[k]);
      if (a > m) m = a;
    }
    return m;
  }

  totalMass(): number {
    const h = this.h;
    let s = 0;
    for (let k = 0; k < h.length; k++) s += h[k];
    return s;
  }
}
