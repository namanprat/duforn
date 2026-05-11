// @ts-nocheck
import * as THREE from "three";

/**
 * Wraps a submerged mesh's existing material with a TSL `MeshStandardNodeMaterial`
 * that preserves the source albedo/normal/roughness textures and adds an animated
 * caustic light pattern modulated by depth (distance below the water plane).
 *
 * The caustic intensity falls off with depth so deep meshes stay calm and the
 * light dapples concentrate near the waterline, matching how real caustics
 * focus on shallow surfaces.
 */
export async function createCausticMaterial({
  source,
  waterY,
  timeUniform,
  depthFalloff = 1.5,
  scale = 2.5,
  intensity = 1.6,
  color = new THREE.Color(0.55, 0.95, 1.0),
}) {
  const { MeshStandardNodeMaterial } = await import("three/webgpu");
  const tsl = await import("three/tsl");
  const {
    Fn,
    float,
    vec2,
    vec3,
    uniform,
    positionWorld,
    sin,
    cos,
    abs,
    max,
    min,
    exp,
    smoothstep,
    mx_noise_float,
  } = tsl;

  const uniforms = {
    uCausticTime: timeUniform ?? uniform(0),
    uWaterY: uniform(waterY),
    uDepthFalloff: uniform(depthFalloff),
    uCausticScale: uniform(scale),
    uCausticIntensity: uniform(intensity),
    uCausticColor: uniform(color.clone()),
  };

  const causticEmissive = Fn(() => {
    // Distance below water plane (positive when submerged).
    const depth = max(float(0), uniforms.uWaterY.sub(positionWorld.y));
    // Intensity falls off exponentially with depth.
    const depthAtt = exp(depth.div(uniforms.uDepthFalloff).negate());
    // Two crossed sine waves form the classic caustic web.
    const t = uniforms.uCausticTime;
    const xz = vec2(positionWorld.x, positionWorld.z).mul(uniforms.uCausticScale);
    const w1 = sin(xz.x.add(t.mul(1.7))).mul(cos(xz.y.mul(1.13).sub(t.mul(0.9))));
    const w2 = sin(xz.x.mul(0.71).add(t.mul(0.6)).add(xz.y.mul(0.83)));
    const w3 = sin(xz.y.mul(1.27).sub(t.mul(1.3)));
    const lattice = abs(w1)
      .mul(abs(w2))
      .mul(abs(w3.mul(0.5).add(0.5)));
    const noise = mx_noise_float(vec3(xz.x, xz.y, t.mul(0.2)))
      .mul(0.4)
      .add(0.6);
    const caustic = smoothstep(float(0.15), float(0.85), lattice.mul(noise));
    const tinted = uniforms.uCausticColor
      .mul(caustic)
      .mul(depthAtt)
      .mul(uniforms.uCausticIntensity);
    return tinted;
  });

  const mat = new MeshStandardNodeMaterial({
    color: source?.color?.clone ? source.color.clone() : new THREE.Color(0xffffff),
    map: source?.map ?? null,
    normalMap: source?.normalMap ?? null,
    roughnessMap: source?.roughnessMap ?? null,
    metalnessMap: source?.metalnessMap ?? null,
    aoMap: source?.aoMap ?? null,
    roughness: source?.roughness ?? 0.85,
    metalness: source?.metalness ?? 0.0,
    name: source?.name ? `${source.name}__caustic` : "caustic",
  });
  mat.emissiveNode = causticEmissive();
  mat.userData.isCausticMaterial = true;

  return { material: mat, uniforms };
}
