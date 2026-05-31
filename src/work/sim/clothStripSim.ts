/**
 * Rest-anchored position-based cloth for the work strip.
 *
 * Ports the physics ideas from the reference `Cloth_Simulation_WebGPU` demo
 * (particle network + spring/shear/bend connections + aerodynamic wind +
 * integration with damping) but adapts them so the curved image carousel keeps
 * its shape: every particle is softly tethered to its arc rest position, and
 * the rigid edge (matching the shader's `looseness`) is hard-pinned.
 *
 * Motion is driven by a continuously evolving turbulent wind field — it never
 * settles to a static pose, so the strip ripples perpetually. The anchor is
 * gentle on the free edge (visible flutter) and firm near the pinned edge
 * (shape retention), so the carousel never collapses into a hanging sheet.
 *
 * Runs on the CPU over a small grid (~COLS*ROWS particles) and writes straight
 * into the geometry's position attribute, so the same animated mesh renders
 * identically on the WebGPU and WebGL paths.
 */

export interface ClothStripSimParams {
  /** Local-space downward acceleration magnitude (units/s²). */
  gravity: number;
  /** Aerodynamic wind force magnitude. */
  windStrength: number;
  /** Wind direction in local space (need not be normalized). */
  windDir: readonly [number, number, number];
  /** Spatial frequency of the wind-ripple field. */
  gustFrequency: number;
  /** Temporal speed of the wind-ripple field. */
  windSpeed: number;
  /** Fraction of velocity retained each step (0..1); higher = livelier. */
  damping: number;
  /** Distance-constraint stiffness (0..1). */
  stiffness: number;
  /** Pull back toward the rest arc (0..1), scaled per-row by rigidity. */
  anchorStiffness: number;
  /** Constraint solver iterations per step. */
  iterations: number;
  /** Seconds elapsed (drives the wind field). */
  time: number;
}

export interface ClothStripSim {
  /** Live position buffer (cols*rows*3), shared with the geometry attribute. */
  readonly positions: Float32Array;
  /** Advance the simulation by `dt` seconds. */
  step(dt: number, params: ClothStripSimParams): void;
  /** Snap every particle back to its rest arc position. */
  reset(): void;
}

interface DistanceConstraint {
  i: number;
  j: number;
  rest: number;
}

const MAX_DT = 1 / 30;
const EPSILON = 1e-6;

function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function restLength(rest: Float32Array, i: number, j: number): number {
  const oi = i * 3;
  const oj = j * 3;
  return Math.hypot(rest[oj] - rest[oi], rest[oj + 1] - rest[oi + 1], rest[oj + 2] - rest[oi + 2]);
}

/** Structural (axis), shear (diagonal), and bend (2-step) connections. */
function buildConstraints(cols: number, rows: number, rest: Float32Array): DistanceConstraint[] {
  const constraints: DistanceConstraint[] = [];
  const add = (i: number, j: number) => constraints.push({ i, j, rest: restLength(rest, i, j) });

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      if (c + 1 < cols) add(i, i + 1);
      if (r + 1 < rows) add(i, i + cols);
      if (c + 1 < cols && r + 1 < rows) add(i, i + cols + 1);
      if (c - 1 >= 0 && r + 1 < rows) add(i, i + cols - 1);
      if (c + 2 < cols) add(i, i + 2);
      if (r + 2 < rows) add(i, i + 2 * cols);
    }
  }
  return constraints;
}

/** Approximate surface normal at particle `i` from its grid neighbours. */
function particleNormal(
  pos: Float32Array,
  cols: number,
  rows: number,
  i: number,
  out: { x: number; y: number; z: number },
): void {
  const r = (i / cols) | 0;
  const c = i % cols;
  const left = c > 0 ? i - 1 : i;
  const right = c < cols - 1 ? i + 1 : i;
  const down = r > 0 ? i - cols : i;
  const up = r < rows - 1 ? i + cols : i;

  const ux = pos[right * 3] - pos[left * 3];
  const uy = pos[right * 3 + 1] - pos[left * 3 + 1];
  const uz = pos[right * 3 + 2] - pos[left * 3 + 2];
  const vx = pos[up * 3] - pos[down * 3];
  const vy = pos[up * 3 + 1] - pos[down * 3 + 1];
  const vz = pos[up * 3 + 2] - pos[down * 3 + 2];

  let nx = uy * vz - uz * vy;
  let ny = uz * vx - ux * vz;
  let nz = ux * vy - uy * vx;
  const len = Math.hypot(nx, ny, nz);
  if (len < EPSILON) {
    out.x = 0;
    out.y = 0;
    out.z = 1;
    return;
  }
  nx /= len;
  ny /= len;
  nz /= len;
  out.x = nx;
  out.y = ny;
  out.z = nz;
}

/**
 * Turbulent gust field in roughly [-1.3, 1.3]: three travelling waves over the
 * (u, v) surface coordinates and time. Never repeats over a short window, so it
 * keeps injecting energy and the cloth never settles.
 */
function gustField(u: number, v: number, phase: number, freq: number): number {
  return (
    Math.sin(u * freq * 6.0 - phase * 1.3) * 0.6 +
    Math.sin(v * freq * 4.0 + u * 3.0 - phase * 0.9) * 0.4 +
    Math.sin((u + v) * freq * 3.0 - phase * 2.1) * 0.3
  );
}

export function createClothStripSim(
  cols: number,
  rows: number,
  restPositions: Float32Array,
  livePositions: Float32Array,
): ClothStripSim {
  const count = cols * rows;
  const rest = Float32Array.from(restPositions);
  const pos = livePositions;
  pos.set(rest);
  const prev = Float32Array.from(rest);

  // Per-particle rigidity mirrors the shader's `looseness = smoothstep(0, 0.25, v)`:
  // the v=0 edge is rigid (rigidity 1) and hard-pinned; the far edge is free.
  const rigidity = new Float32Array(count);
  const pinned = new Uint8Array(count);
  for (let r = 0; r < rows; r++) {
    const v = rows > 1 ? r / (rows - 1) : 0;
    const rig = 1 - smoothstep(0, 0.25, v);
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      rigidity[idx] = rig;
      pinned[idx] = r === 0 ? 1 : 0;
    }
  }

  const constraints = buildConstraints(cols, rows, rest);
  const normal = { x: 0, y: 0, z: 1 };

  function reset(): void {
    pos.set(rest);
    prev.set(rest);
  }

  function step(dt: number, p: ClothStripSimParams): void {
    const h = Math.min(dt, MAX_DT);
    if (h <= 0) return;
    const h2 = h * h;
    const damp = clamp(p.damping, 0, 1);

    let wx = p.windDir[0];
    let wy = p.windDir[1];
    let wz = p.windDir[2];
    const wlen = Math.hypot(wx, wy, wz) || 1;
    wx /= wlen;
    wy /= wlen;
    wz /= wlen;
    const hasWind = p.windStrength > 0;
    const phase = p.time * p.windSpeed;

    const colsMinus1 = cols > 1 ? cols - 1 : 1;
    const rowsMinus1 = rows > 1 ? rows - 1 : 1;

    // 1) Verlet integration with gravity + turbulent aerodynamic wind.
    for (let i = 0; i < count; i++) {
      if (pinned[i]) continue;
      const o = i * 3;
      const free = 1 - rigidity[i];

      let ax = 0;
      let ay = -p.gravity * free;
      let az = 0;

      if (hasWind) {
        particleNormal(pos, cols, rows, i, normal);
        const c = i % cols;
        const r = (i / cols) | 0;
        const u = c / colsMinus1;
        const v = r / rowsMinus1;
        // Aerodynamic facing: a sheet catches more wind when its normal opposes
        // the wind, but keep a floor so the strip always breathes.
        const facing = 0.45 + 0.55 * Math.abs(normal.x * wx + normal.y * wy + normal.z * wz);
        const gust = gustField(u, v, phase, p.gustFrequency);
        const w = p.windStrength * gust * facing * (0.3 + 0.7 * free);
        ax += normal.x * w;
        ay += normal.y * w;
        az += normal.z * w;
      }

      const px = pos[o];
      const py = pos[o + 1];
      const pz = pos[o + 2];
      pos[o] = px + (px - prev[o]) * damp + ax * h2;
      pos[o + 1] = py + (py - prev[o + 1]) * damp + ay * h2;
      pos[o + 2] = pz + (pz - prev[o + 2]) * damp + az * h2;
      prev[o] = px;
      prev[o + 1] = py;
      prev[o + 2] = pz;
    }

    // 2) Constraint projection (Gauss-Seidel) + gentle rest anchoring.
    const stiff = clamp(p.stiffness, 0, 1);
    const anchor = clamp(p.anchorStiffness, 0, 1);
    const iters = Math.max(1, p.iterations | 0);
    for (let it = 0; it < iters; it++) {
      for (let k = 0; k < constraints.length; k++) {
        const { i, j, rest: restLen } = constraints[k];
        const oi = i * 3;
        const oj = j * 3;
        const dx = pos[oj] - pos[oi];
        const dy = pos[oj + 1] - pos[oi + 1];
        const dz = pos[oj + 2] - pos[oi + 2];
        const d = Math.hypot(dx, dy, dz);
        if (d < EPSILON) continue;

        const wi = pinned[i] ? 0 : 1;
        const wj = pinned[j] ? 0 : 1;
        const wsum = wi + wj;
        if (wsum === 0) continue;

        const diff = ((d - restLen) / d) * stiff;
        const si = (wi / wsum) * diff;
        const sj = (wj / wsum) * diff;
        pos[oi] += dx * si;
        pos[oi + 1] += dy * si;
        pos[oi + 2] += dz * si;
        pos[oj] -= dx * sj;
        pos[oj + 1] -= dy * sj;
        pos[oj + 2] -= dz * sj;
      }

      if (anchor > 0) {
        for (let i = 0; i < count; i++) {
          if (pinned[i]) continue;
          // Firm near the rigid edge, barely-there on the free edge so flutter
          // survives while the overall arc shape is retained.
          const a = anchor * (0.03 + 0.7 * rigidity[i] * rigidity[i]);
          if (a <= 0) continue;
          const o = i * 3;
          pos[o] += (rest[o] - pos[o]) * a;
          pos[o + 1] += (rest[o + 1] - pos[o + 1]) * a;
          pos[o + 2] += (rest[o + 2] - pos[o + 2]) * a;
        }
      }
    }

    // 3) Re-assert hard pins.
    for (let i = 0; i < count; i++) {
      if (!pinned[i]) continue;
      const o = i * 3;
      pos[o] = rest[o];
      pos[o + 1] = rest[o + 1];
      pos[o + 2] = rest[o + 2];
    }

    // 4) Blow-up guard: if anything diverged, snap back to rest.
    if (!Number.isFinite(pos[0]) || !Number.isFinite(pos[count * 3 - 1])) {
      reset();
    }
  }

  return { positions: pos, step, reset };
}
