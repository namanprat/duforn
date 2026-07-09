import * as THREE from "three";
import { POOL_SIM_DEFAULTS, SIM_EDGE_BAND } from "../config/poolWaterDefaults";
import { halfFloatMinMagFilter } from "../halfFloatTextureFilter";

/**
 * GPU ping-pong shallow-water sim — same wave equation as the CPU reference
 * (`shallowWaterCPU.ts`, validated by its selfcheck), ported to a fragment
 * shader so the whole ripple field lives on the GPU. Half-float state removes
 * the 8-bit quantization that made the old CPU height map look stair-stepped,
 * and frees the main thread (no per-frame JS grid loop or texture upload).
 *
 * State packing (per texel): R = encode(h_current), G = encode(h_previous),
 * where encode(h) = h*0.5 + 0.5 — identical to the CPU texture encoding, so the
 * water material and caustics `decodeH()` need no changes.
 */

const MAX_IMPULSES = 8;

const QUAD_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const SIM_FRAG = /* glsl */ `
  precision highp float;
  #define MAX_IMPULSES ${MAX_IMPULSES}
  varying vec2 vUv;

  uniform sampler2D uState;
  uniform vec2 uTexel;       // 1 / resolution
  uniform vec2 uRes;         // grid resolution (cells)
  uniform float uModifier;
  uniform float uEdgeBand;
  uniform int uImpulseCount;
  // xy = center in grid cells, z = strength, w = outer radius (cells)
  uniform vec4 uImpulses[MAX_IMPULSES];

  float decodeH(float r) { return (r - 0.5) * 2.0; }
  float encodeH(float h) { return h * 0.5 + 0.5; }

  void main() {
    vec4 c = texture2D(uState, vUv);
    float cur = decodeH(c.r);
    float prev = decodeH(c.g);

    float hL = decodeH(texture2D(uState, vUv + vec2(-uTexel.x, 0.0)).r);
    float hR = decodeH(texture2D(uState, vUv + vec2( uTexel.x, 0.0)).r);
    float hU = decodeH(texture2D(uState, vUv + vec2(0.0, -uTexel.y)).r);
    float hD = decodeH(texture2D(uState, vUv + vec2(0.0,  uTexel.y)).r);
    float sum = hL + hR + hU + hD;

    // Edge attenuation — port of the CPU edge band (damps reflections at walls).
    vec2 g = vUv * uRes;
    float distI = min(g.x, uRes.x - g.x);
    float distJ = min(g.y, uRes.y - g.y);
    float minEdge = min(distI, distJ);
    float t = clamp(minEdge / uEdgeBand, 0.0, 1.0);
    float smoothT = t * t * (3.0 - 2.0 * t);
    float edgeAtt = 0.7 + 0.3 * smoothT;

    float next = uModifier * (-prev + 0.5 * sum) * edgeAtt;

    for (int i = 0; i < MAX_IMPULSES; i++) {
      if (i >= uImpulseCount) break;
      vec4 imp = uImpulses[i];
      float dist = length(g - imp.xy);
      float outer = imp.w;
      float inner = imp.w * 0.16;
      float tt = clamp((outer - dist) / max(1e-6, outer - inner), 0.0, 1.0);
      float w = tt * tt * (3.0 - 2.0 * tt);
      next += imp.z * w;
    }

    gl_FragColor = vec4(encodeH(next), encodeH(cur), 0.0, 1.0);
  }
`;

function makeStateTarget(gl: THREE.WebGLRenderer, nw: number, nh: number) {
  const filter = halfFloatMinMagFilter(gl);
  const target = new THREE.WebGLRenderTarget(nw, nh, {
    type: THREE.HalfFloatType,
    format: THREE.RGBAFormat,
    minFilter: filter,
    magFilter: filter,
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
    depthBuffer: false,
    stencilBuffer: false,
    generateMipmaps: false,
  });
  return target;
}

/** GPU shallow water + half-float height texture for materials and caustics. */
export class PoolShallowWaterSimGPU {
  readonly nw: number;
  readonly nh: number;
  ready = true;

  private gl: THREE.WebGLRenderer;
  private read: THREE.WebGLRenderTarget;
  private write: THREE.WebGLRenderTarget;
  private material: THREE.ShaderMaterial;
  private quad: THREE.Mesh;
  private camera: THREE.OrthographicCamera;
  private scene: THREE.Scene;
  private impulses: number[] = []; // flat [gx, gy, strength, radius] * n
  private impulseBuffer: THREE.Vector4[];
  private modifier: number;
  private impulseStrength: number;
  private impulseRadius: number;

  constructor(
    gl: THREE.WebGLRenderer,
    nw = POOL_SIM_DEFAULTS.gridSize,
    nh = nw,
    simOpts: Partial<{
      modifier: number;
      impulseStrength: number;
      impulseRadius: number;
    }> = {},
  ) {
    this.gl = gl;
    this.nw = nw;
    this.nh = nh;
    this.modifier = simOpts.modifier ?? POOL_SIM_DEFAULTS.modifier;
    this.impulseStrength = simOpts.impulseStrength ?? POOL_SIM_DEFAULTS.impulseStrength;
    this.impulseRadius = simOpts.impulseRadius ?? POOL_SIM_DEFAULTS.impulseRadius;

    this.read = makeStateTarget(gl, nw, nh);
    this.write = makeStateTarget(gl, nw, nh);

    this.impulseBuffer = Array.from({ length: MAX_IMPULSES }, () => new THREE.Vector4());

    this.material = new THREE.ShaderMaterial({
      vertexShader: QUAD_VERT,
      fragmentShader: SIM_FRAG,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uState: { value: this.read.texture },
        uTexel: { value: new THREE.Vector2(1 / nw, 1 / nh) },
        uRes: { value: new THREE.Vector2(nw, nh) },
        uModifier: { value: this.modifier },
        uEdgeBand: { value: SIM_EDGE_BAND },
        uImpulseCount: { value: 0 },
        uImpulses: { value: this.impulseBuffer },
      },
    });

    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.scene = new THREE.Scene();
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material);
    this.quad.frustumCulled = false;
    this.scene.add(this.quad);

    // Initialize both targets to flat water: encode(0) = 0.5.
    this.clearTarget(this.read);
    this.clearTarget(this.write);
  }

  /** Clear a state target to flat water: encode(0) = 0.5 in R (cur) and G (prev). */
  private clearTarget(target: THREE.WebGLRenderTarget) {
    const prevTarget = this.gl.getRenderTarget();
    const prevClear = this.gl.getClearColor(new THREE.Color());
    const prevAlpha = this.gl.getClearAlpha();
    this.gl.setRenderTarget(target);
    this.gl.setClearColor(new THREE.Color(0.5, 0.5, 0.5), 1);
    this.gl.clear(true, false, false);
    this.gl.setRenderTarget(prevTarget);
    this.gl.setClearColor(prevClear, prevAlpha);
  }

  getResolutionW() {
    return this.nw;
  }

  getResolutionH() {
    return this.nh;
  }

  getHeightTexture(): THREE.Texture {
    return this.read.texture;
  }

  /** Queue a ripple impulse at grid cell (gx, gy). Drained on the next step(). */
  setImpulse(gx: number, gy: number, strengthScale = 1, radiusScale = 1) {
    if (this.impulses.length >= MAX_IMPULSES * 4) return;
    this.impulses.push(
      gx,
      gy,
      this.impulseStrength * strengthScale,
      this.impulseRadius * radiusScale,
    );
  }

  setSimParams(
    next: Partial<{ modifier: number; impulseStrength: number; impulseRadius: number }> = {},
  ) {
    if (next.modifier !== undefined) {
      this.modifier = next.modifier;
      this.material.uniforms.uModifier.value = next.modifier;
    }
    if (next.impulseStrength !== undefined) this.impulseStrength = next.impulseStrength;
    if (next.impulseRadius !== undefined) this.impulseRadius = next.impulseRadius;
  }

  step({ substeps = POOL_SIM_DEFAULTS.substeps } = {}) {
    const u = this.material.uniforms;
    const prevTarget = this.gl.getRenderTarget();

    for (let s = 0; s < substeps; s++) {
      // Apply queued impulses on the first substep only, then let them propagate.
      if (s === 0 && this.impulses.length > 0) {
        const count = Math.min(MAX_IMPULSES, this.impulses.length / 4);
        for (let i = 0; i < count; i++) {
          const o = i * 4;
          this.impulseBuffer[i].set(
            this.impulses[o],
            this.impulses[o + 1],
            this.impulses[o + 2],
            this.impulses[o + 3],
          );
        }
        u.uImpulseCount.value = count;
      } else {
        u.uImpulseCount.value = 0;
      }

      u.uState.value = this.read.texture;
      this.gl.setRenderTarget(this.write);
      this.gl.render(this.scene, this.camera);

      const tmp = this.read;
      this.read = this.write;
      this.write = tmp;
    }

    this.impulses.length = 0;
    this.gl.setRenderTarget(prevTarget);
  }

  dispose() {
    this.read.dispose();
    this.write.dispose();
    this.material.dispose();
    (this.quad.geometry as THREE.BufferGeometry).dispose();
  }
}
