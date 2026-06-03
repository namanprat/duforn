// @ts-nocheck
/**
 * GPU heightfield water simulation, ported from webgl-water-master/water.js to
 * three.js TSL + WebGPU. The sim texture stores (height, velocity, normal.x,
 * normal.z) per texel and is ping-ponged between two float render targets.
 *
 * Passes (fullscreen QuadMesh):
 *   - drop:   add a raised-cosine impulse to the height channel
 *   - update: wave equation (move toward neighbour average, damp, integrate)
 *   - normal: finite-difference surface normal into the b/a channels
 */
import * as THREE from "three";

export type WaterSim = {
  /** Current readable sim texture (height + normal), for the surface material. */
  readonly texture: THREE.Texture;
  addDrop: (x: number, y: number, radius: number, strength: number) => void;
  step: () => void;
  dispose: () => void;
};

export async function createWaterSim(renderer: unknown, size = 256): Promise<WaterSim> {
  const { QuadMesh } = await import("three/webgpu");
  const { MeshBasicNodeMaterial } = await import("three/webgpu");
  const {
    Fn,
    vec2,
    vec3,
    vec4,
    float,
    uniform,
    uv,
    texture,
    max,
    cos,
    length,
    cross,
    normalize,
    clamp,
  } = await import("three/tsl");

  const PI = float(Math.PI);
  const delta = uniform(new THREE.Vector2(1 / size, 1 / size));

  const makeTarget = () => {
    const rt = new THREE.RenderTarget(size, size, {
      type: THREE.FloatType,
      format: THREE.RGBAFormat,
      // NEAREST: float32 linear filtering is unreliable across GPUs (returns
      // garbage/NaN without float32-filterable) and a half-texel blend injects
      // energy that destabilises the wave integration. Exact texel reads are
      // both correct and stable here.
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      depthBuffer: false,
      generateMipmaps: false,
    });
    return rt;
  };

  let rtA = makeTarget();
  let rtB = makeTarget();

  // --- drop pass uniforms ---
  const uCenter = uniform(new THREE.Vector2());
  const uRadius = uniform(0.03);
  const uStrength = uniform(0.01);

  // --- tweakable simulation uniforms (exposed for the GUI) ---
  // Defaults tuned to cg-gentlerain's gentler decay: ripples travel a little
  // faster (height integrates with the step), spring back (uRestoring) and
  // linger longer (softer friction/decay) for the "gentle rain" ring look.
  const uWaveSpeed = uniform(1.4);
  const uDamping = uniform(0.997);
  const uHeightDecay = uniform(0.999);
  const uRestoring = uniform(0.005);

  // One source-texture node shared by every pass; its `.value` is repointed at
  // the current read target before each render (correct ping-pong).
  const src = texture(rtA.texture);

  const makeMat = (node) => {
    const m = new MeshBasicNodeMaterial();
    m.colorNode = node();
    m.depthTest = false;
    m.depthWrite = false;
    return m;
  };

  const dropMat = makeMat(
    Fn(() => {
      const coord = uv();
      const info = src.sample(coord).toVar();
      const dist = length(uCenter.mul(0.5).add(0.5).sub(coord)).div(uRadius);
      const drop = max(float(0), float(1).sub(dist));
      const shaped = float(0.5).sub(cos(drop.mul(PI)).mul(0.5));
      info.x.addAssign(shaped.mul(uStrength));
      return info;
    }),
  );

  const updateMat = makeMat(
    Fn(() => {
      const coord = uv();
      const info = src.sample(coord).toVar();
      const dx = vec2(delta.x, float(0));
      const dy = vec2(float(0), delta.y);
      const average = src
        .sample(coord.sub(dx))
        .x.add(src.sample(coord.sub(dy)).x)
        .add(src.sample(coord.add(dx)).x)
        .add(src.sample(coord.add(dy)).x)
        .mul(0.25);
      // cg-gentlerain semi-implicit Euler (shaders.js:17-50). The wave operator
      // `(average - height) * waveSpeed` is identical to the original port;
      // gentlerain's distinct ripple feel comes from the spring restoring term
      // and integrating height with the step (height += vel * waveSpeed).
      // Clamps stay as a stability backstop (coefficient ~1.4 sits near the
      // stability boundary and can otherwise drift to Inf/NaN here).
      const vel = clamp(
        info.y
          .add(average.sub(info.x).mul(uWaveSpeed))
          .sub(info.x.mul(uRestoring).mul(uWaveSpeed))
          .mul(uDamping),
        float(-0.25),
        float(0.25),
      );
      // Gentle pull of the surface level back to rest. The wave operator
      // conserves the mean (DC) height, so without this every drop's added
      // volume accumulates and the whole plane creeps upward.
      const height = clamp(
        info.x.add(vel.mul(uWaveSpeed)).mul(uHeightDecay),
        float(-0.5),
        float(0.5),
      );
      return vec4(height, vel, info.z, info.w);
    }),
  );

  const normalMat = makeMat(
    Fn(() => {
      const coord = uv();
      const info = src.sample(coord).toVar();
      const dx = vec3(
        delta.x,
        src.sample(vec2(coord.x.add(delta.x), coord.y)).x.sub(info.x),
        float(0),
      );
      const dy = vec3(
        float(0),
        src.sample(vec2(coord.x, coord.y.add(delta.y))).x.sub(info.x),
        delta.y,
      );
      const n = normalize(cross(dy, dx));
      return vec4(info.x, info.y, n.x, n.z);
    }),
  );

  const quad = new QuadMesh();

  // Clear both targets to a flat, still surface.
  for (const rt of [rtA, rtB]) {
    renderer.setRenderTarget(rt);
    renderer.setClearColor(0x000000, 0);
    renderer.clear();
  }
  renderer.setRenderTarget(null);

  const runPass = (mat) => {
    src.value = rtA.texture;
    quad.material = mat;
    renderer.setRenderTarget(rtB);
    quad.render(renderer);
    renderer.setRenderTarget(null);
    const tmp = rtA;
    rtA = rtB;
    rtB = tmp;
  };

  return {
    get texture() {
      return rtA.texture;
    },
    uniforms: {
      waveSpeed: uWaveSpeed,
      damping: uDamping,
      heightDecay: uHeightDecay,
      restoring: uRestoring,
    },
    addDrop(x, y, radius, strength) {
      uCenter.value.set(x, y);
      uRadius.value = radius;
      uStrength.value = strength;
      runPass(dropMat);
    },
    step() {
      runPass(updateMat);
      runPass(updateMat);
      runPass(normalMat);
    },
    dispose() {
      rtA.dispose();
      rtB.dispose();
      dropMat.dispose();
      updateMat.dispose();
      normalMat.dispose();
    },
  };
}
