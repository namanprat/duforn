// @ts-nocheck
/**
 * Full pool + water-surface shading, ported from the helperFunctions, water
 * surface shaders, and cube/pool shaders in webgl-water-master/renderer.js to
 * three.js TSL. The water surface ray-traces a reflected and a refracted ray
 * against the cubemap sky and the tiled pool walls (lit by the caustics pass),
 * blended by Fresnel; the pool walls sample the caustics + a rim shadow.
 * (No sphere — this scene has none.)
 */
import * as THREE from "three";

const IOR_AIR = 1.0;
const IOR_WATER = 1.333;
const RATIO = IOR_AIR / IOR_WATER;
const POOL_TOP = 2.0 / 12.0;

export type WaterMaterials = {
  poolMaterial: THREE.Material;
  surfaceAbove: THREE.Material;
  surfaceUnder: THREE.Material;
  /** Repoint at the live sim texture each frame (sim ping-pongs targets). */
  simTexNode: { value: THREE.Texture };
  dispose: () => void;
};

export async function createWaterMaterials(opts: {
  simTexture: THREE.Texture;
  causticTexture: THREE.Texture;
  tiles: THREE.Texture;
  sky: THREE.CubeTexture;
  light: THREE.Vector3;
}): Promise<WaterMaterials> {
  const { simTexture, causticTexture, tiles, sky, light } = opts;
  const { MeshBasicNodeMaterial } = await import("three/webgpu");
  const {
    Fn,
    If,
    Loop,
    vec2,
    vec3,
    vec4,
    float,
    uniform,
    texture,
    cubeTexture,
    positionLocal,
    positionWorld,
    cameraPosition,
    normalize,
    reflect,
    refract,
    dot,
    mix,
    pow,
    max,
    min,
    abs,
    length,
    exp,
    sqrt,
    oneMinus,
  } = await import("three/tsl");

  const simTexNode = texture(simTexture);
  const causticTexNode = texture(causticTexture);
  const tilesNode = texture(tiles);
  const skyNode = cubeTexture(sky);
  const lightDir = uniform(light.clone().normalize());

  // Tweakable uniforms (exposed for the GUI).
  const ABOVE = uniform(new THREE.Vector3(0.25, 1.0, 1.25));
  const UNDER = uniform(new THREE.Vector3(0.4, 0.9, 1.0));
  const uCausticStrength = uniform(2.0);
  const uFresnelAbove = uniform(0.25);
  const uFresnelUnder = uniform(0.5);
  // Index-of-refraction ratio (air/water). 1.0 = no bending (straight through),
  // lower = more refraction. Drives the surface refraction + caustic light.
  const uRefraction = uniform(RATIO);
  // How strongly the wave normal tilts the surface optics (reflect/refract).
  // 0 = optically flat (no wall bending), 1 = full. The geometry still ripples.
  const uDistortion = uniform(0.5);
  // cg-gentlerain specular glint on ripple crests (shaders.js:85-89).
  const uSpecularStrength = uniform(1.5);
  const uSpecularPower = uniform(60);
  const UP = vec3(0, 1, 0);
  const cubeMin = vec3(-1, -1, -1);
  const cubeMax = vec3(1, 2, 1);

  const intersectCube = (origin, ray) => {
    const tMin = cubeMin.sub(origin).div(ray);
    const tMax = cubeMax.sub(origin).div(ray);
    const t1 = min(tMin, tMax);
    const t2 = max(tMin, tMax);
    const tNear = max(max(t1.x, t1.y), t1.z);
    const tFar = min(min(t2.x, t2.y), t2.z);
    return vec2(tNear, tFar);
  };

  const getWallColor = Fn(([point]) => {
    const scale = float(0.5).toVar();
    const wallColor = vec3(0).toVar();
    const normal = vec3(0).toVar();

    If(abs(point.x).greaterThan(0.999), () => {
      wallColor.assign(tilesNode.sample(point.yz.mul(0.5).add(vec2(1.0, 0.5))).rgb);
      normal.assign(vec3(point.x.negate(), 0, 0));
    })
      .ElseIf(abs(point.z).greaterThan(0.999), () => {
        wallColor.assign(tilesNode.sample(point.yx.mul(0.5).add(vec2(1.0, 0.5))).rgb);
        normal.assign(vec3(0, 0, point.z.negate()));
      })
      .Else(() => {
        wallColor.assign(tilesNode.sample(point.xz.mul(0.5).add(0.5)).rgb);
        normal.assign(vec3(0, 1, 0));
      });

    scale.divAssign(length(point)); // pool ambient occlusion

    const refractedLight = refract(lightDir.negate(), UP, uRefraction).negate();
    const diffuse = max(float(0), dot(refractedLight, normal)).toVar();
    const info = simTexNode.sample(point.xz.mul(0.5).add(0.5));

    If(point.y.lessThan(info.x), () => {
      const causticUv = point.xz
        .sub(point.y.mul(refractedLight.xz).div(refractedLight.y))
        .mul(0.75)
        .mul(0.5)
        .add(0.5);
      const caustic = causticTexNode.sample(causticUv);
      scale.addAssign(diffuse.mul(caustic.x).mul(uCausticStrength).mul(caustic.y));
    }).Else(() => {
      const t = intersectCube(point, refractedLight);
      const k = float(-200)
        .div(float(1).add(float(10).mul(t.y.sub(t.x))))
        .mul(point.y.add(refractedLight.y.mul(t.y)).sub(float(POOL_TOP)));
      diffuse.mulAssign(float(1).div(float(1).add(exp(k))));
      scale.addAssign(diffuse.mul(0.5));
    });

    return wallColor.mul(scale);
  });

  const getSurfaceRayColor = Fn(([origin, ray, waterColor]) => {
    const color = vec3(0).toVar();

    If(ray.y.lessThan(0), () => {
      const t = intersectCube(origin, ray);
      color.assign(getWallColor(origin.add(ray.mul(t.y))));
    }).Else(() => {
      const t = intersectCube(origin, ray);
      const hit = origin.add(ray.mul(t.y));
      If(hit.y.lessThan(float(POOL_TOP)), () => {
        color.assign(getWallColor(hit));
      }).Else(() => {
        const skyColor = skyNode.sample(ray).rgb;
        const sun = vec3(pow(max(float(0), dot(lightDir, ray)), float(5000))).mul(vec3(10, 8, 6));
        color.assign(skyColor.add(sun));
      });
    });

    If(ray.y.lessThan(0), () => {
      color.mulAssign(waterColor);
    });

    return color;
  });

  // Vertex displacement shared by both surface passes.
  const positionNode = Fn(() => {
    const pos = positionLocal.toVar();
    const coord = pos.xz.mul(0.5).add(0.5);
    pos.y.addAssign(simTexNode.sample(coord).x);
    return pos;
  });

  // Sample the surface normal with the "peaked" coordinate march (5 steps).
  const surfaceNormal = () => {
    const coord = positionWorld.xz.mul(0.5).add(0.5).toVar();
    const info = simTexNode.sample(coord).toVar();
    Loop(5, () => {
      coord.addAssign(info.zw.mul(float(0.005).mul(uDistortion)));
      info.assign(simTexNode.sample(coord));
    });
    // Scale the horizontal normal by uDistortion so the surface bends the view
    // (and the walls) less without flattening the actual ripple geometry.
    const nxz = info.zw.mul(uDistortion);
    return vec3(nxz.x, sqrt(max(float(0), float(1).sub(dot(nxz, nxz)))), nxz.y);
  };

  const aboveColor = Fn(() => {
    const normal = surfaceNormal().toVar();
    const incomingRay = normalize(positionWorld.sub(cameraPosition));
    const reflectedRay = reflect(incomingRay, normal);
    const refractedRay = refract(incomingRay, normal, uRefraction);
    const fresnel = mix(
      uFresnelAbove,
      float(1),
      pow(oneMinus(dot(normal, incomingRay.negate())), float(3)),
    );
    const reflectedColor = getSurfaceRayColor(positionWorld, reflectedRay, ABOVE);
    const refractedColor = getSurfaceRayColor(positionWorld, refractedRay, ABOVE);
    const surfaceColor = mix(refractedColor, reflectedColor, fresnel).toVar();
    // Sharp specular glint on the ripple crests (cg-gentlerain).
    const specular = pow(max(float(0), dot(normal, lightDir)), uSpecularPower).mul(
      uSpecularStrength,
    );
    surfaceColor.addAssign(vec3(specular));
    return vec4(surfaceColor, float(1));
  });

  const underColor = Fn(() => {
    const normal = surfaceNormal().negate().toVar();
    const incomingRay = normalize(positionWorld.sub(cameraPosition));
    const reflectedRay = reflect(incomingRay, normal);
    const refractedRay = refract(incomingRay, normal, float(1).div(uRefraction));
    const fresnel = mix(
      uFresnelUnder,
      float(1),
      pow(oneMinus(dot(normal, incomingRay.negate())), float(3)),
    );
    const reflectedColor = getSurfaceRayColor(positionWorld, reflectedRay, UNDER);
    const refractedColor = getSurfaceRayColor(positionWorld, refractedRay, vec3(1)).mul(
      vec3(0.8, 1.0, 1.1),
    );
    return vec4(
      mix(reflectedColor, refractedColor, oneMinus(fresnel).mul(length(refractedRay))),
      float(1),
    );
  });

  const poolColor = Fn(() => {
    const c = getWallColor(positionWorld).toVar();
    const info = simTexNode.sample(positionWorld.xz.mul(0.5).add(0.5));
    If(positionWorld.y.lessThan(info.x), () => {
      c.mulAssign(UNDER.mul(1.2));
    });
    return vec4(c, float(1));
  });

  const poolMaterial = new MeshBasicNodeMaterial({ side: THREE.DoubleSide });
  poolMaterial.colorNode = poolColor();

  // Single double-sided surface (the camera stays above water); the above-water
  // shader carries the refraction + caustics. underColor is kept for a later
  // dedicated under-water pass.
  const surfaceAbove = new MeshBasicNodeMaterial({ side: THREE.DoubleSide });
  surfaceAbove.positionNode = positionNode();
  surfaceAbove.colorNode = aboveColor();

  const surfaceUnder = new MeshBasicNodeMaterial({ side: THREE.FrontSide });
  surfaceUnder.positionNode = positionNode();
  surfaceUnder.colorNode = underColor();

  return {
    poolMaterial,
    surfaceAbove,
    surfaceUnder,
    simTexNode,
    uniforms: {
      lightDir,
      causticStrength: uCausticStrength,
      fresnelAbove: uFresnelAbove,
      fresnelUnder: uFresnelUnder,
      refraction: uRefraction,
      distortion: uDistortion,
      specularStrength: uSpecularStrength,
      specularPower: uSpecularPower,
      aboveColor: ABOVE,
      underColor: UNDER,
    },
    dispose: () => {
      poolMaterial.dispose?.();
      surfaceAbove.dispose?.();
      surfaceUnder.dispose?.();
    },
  };
}
