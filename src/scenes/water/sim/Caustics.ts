// @ts-nocheck
/**
 * Caustics pass, ported from updateCaustics() + the caustics shader in
 * webgl-water-master/renderer.js. A grid mesh is projected along the refracted
 * light ray onto the pool floor; where the projected triangles shrink the light
 * concentrates (brighter), where they stretch it dims. The result is written to
 * a render target sampled by the pool + surface materials. (No sphere blob
 * shadow — this scene has no sphere.)
 */
import * as THREE from "three";

const RATIO = 1.0 / 1.333; // IOR_AIR / IOR_WATER
const CUBE_MIN = [-1, -1, -1];
const CUBE_MAX = [1, 2, 1];

export type Caustics = {
  readonly texture: THREE.Texture;
  /** Repoint at the live sim texture, then render the caustics for this frame. */
  update: (simTexture: THREE.Texture) => void;
  dispose: () => void;
};

export async function createCaustics(
  renderer: unknown,
  light: THREE.Vector3,
  size = 1024,
): Promise<Caustics> {
  const { MeshBasicNodeMaterial } = await import("three/webgpu");
  const {
    Fn,
    vec2,
    vec3,
    vec4,
    float,
    uniform,
    texture,
    varying,
    positionLocal,
    refract,
    normalize,
    dot,
    sqrt,
    max,
    min,
    length,
    dFdx,
    dFdy,
  } = await import("three/tsl");

  const lightDir = uniform(light.clone().normalize());
  const uRefraction = uniform(RATIO);

  const target = new THREE.RenderTarget(size, size, {
    type: THREE.HalfFloatType,
    format: THREE.RGBAFormat,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    depthBuffer: false,
    generateMipmaps: false,
  });

  const simTex = texture(null);

  const cubeMin = vec3(...CUBE_MIN);
  const cubeMax = vec3(...CUBE_MAX);

  const intersectCube = (origin, ray) => {
    const tMin = cubeMin.sub(origin).div(ray);
    const tMax = cubeMax.sub(origin).div(ray);
    const t1 = min(tMin, tMax);
    const t2 = max(tMin, tMax);
    const tNear = max(max(t1.x, t1.y), t1.z);
    const tFar = min(min(t2.x, t2.y), t2.z);
    return vec2(tNear, tFar);
  };

  // Project a point along `ray` onto the pool floor plane (y = -1).
  const project = (origin, ray, refractedLight) => {
    const tcube = intersectCube(origin, ray);
    const o = origin.add(ray.mul(tcube.y));
    const tplane = o.y.negate().sub(1).div(refractedLight.y);
    return o.add(refractedLight.mul(tplane));
  };

  // Build the projection as plain node expressions and wrap oldPos/newPos as
  // varyings (computed in the vertex stage, interpolated to the fragment) so
  // dFdx/dFdy produce real screen-space derivatives.
  const refractedLight = refract(lightDir.negate(), vec3(0, 1, 0), uRefraction);
  const cInfo = simTex.sample(positionLocal.xy.mul(0.5).add(0.5));
  const cNxz = cInfo.zw.mul(0.5);
  const cNormal = normalize(
    vec3(cNxz.x, sqrt(max(float(0), float(1).sub(dot(cNxz, cNxz)))), cNxz.y),
  );
  const cRay = refract(lightDir.negate(), cNormal, uRefraction);
  const cBase = vec3(positionLocal.x, float(0), positionLocal.y);
  const vOldPos = varying(project(cBase, refractedLight, refractedLight));
  const vNewPos = varying(project(cBase.add(vec3(0, cInfo.x, 0)), cRay, refractedLight));

  const material = new MeshBasicNodeMaterial({ side: THREE.DoubleSide });
  material.depthTest = false;
  material.depthWrite = false;

  material.vertexNode = vec4(
    vNewPos.xz.add(refractedLight.xz.div(refractedLight.y)).mul(0.75),
    float(0),
    float(1),
  );

  material.colorNode = Fn(() => {
    const oldArea = length(dFdx(vOldPos)).mul(length(dFdy(vOldPos)));
    const newArea = length(dFdx(vNewPos)).mul(length(dFdy(vNewPos)));
    const r = oldArea
      .div(max(newArea, float(1e-6)))
      .mul(0.2)
      .toVar();

    return vec4(r, float(1), float(0), float(1));
  })();

  const geometry = new THREE.PlaneGeometry(2, 2, 200, 200);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  const scene = new THREE.Scene();
  scene.add(mesh);
  // vertexNode emits clip-space directly, so the projection is unused — but the
  // WebGPU render path calls camera.updateProjectionMatrix(), which a bare
  // THREE.Camera lacks. An OrthographicCamera satisfies that without affecting
  // the (overridden) projection.
  const camera = new THREE.OrthographicCamera();

  return {
    get texture() {
      return target.texture;
    },
    lightDir,
    refraction: uRefraction,
    update(simTexture) {
      simTex.value = simTexture;
      renderer.setRenderTarget(target);
      renderer.setClearColor(0x000000, 1);
      renderer.clear();
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);
    },
    dispose() {
      target.dispose();
      geometry.dispose();
      material.dispose();
    },
  };
}
