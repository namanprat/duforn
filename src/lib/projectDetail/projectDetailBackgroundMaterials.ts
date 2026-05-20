// @ts-nocheck
import * as THREE from "three";

function createColor(value) {
  return new THREE.Color(value);
}

function createBackgroundUniforms(controls) {
  return {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uPointer: { value: new THREE.Vector2(0, 0) },
    uVelocity: { value: new THREE.Vector2(0, 0) },
    uSwirlStrength: { value: controls.swirlStrength },
    uSwirlDensity: { value: controls.swirlDensity },
    uDistortion: { value: controls.distortion },
    uPointerInfluence: { value: controls.pointerInfluence },
    uFadeStrength: { value: controls.fadeStrength },
    uLargeNoiseScale: { value: controls.largeNoiseScale },
    uMediumNoiseScale: { value: controls.mediumNoiseScale },
    uFineNoiseScale: { value: controls.fineNoiseScale },
    uColorOuter: { value: createColor(controls.colorOuter) },
    uColorMid: { value: createColor(controls.colorMid) },
    uColorCore: { value: createColor(controls.colorCore) },
    uColorShade: { value: createColor(controls.colorShade) },
  };
}

const WEBGL_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const WEBGL_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uPointer;
  uniform vec2 uVelocity;
  uniform float uSwirlStrength;
  uniform float uSwirlDensity;
  uniform float uDistortion;
  uniform float uPointerInfluence;
  uniform float uFadeStrength;
  uniform float uLargeNoiseScale;
  uniform float uMediumNoiseScale;
  uniform float uFineNoiseScale;
  uniform vec3 uColorOuter;
  uniform vec3 uColorMid;
  uniform vec3 uColorCore;
  uniform vec3 uColorShade;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 345.45));
    p += dot(p, p + 34.345);
    return fract(p.x * p.y);
  }

  float valueNoise(vec3 p) {
    vec2 pxy = p.xy + p.z * 17.0;
    vec2 i = floor(pxy);
    vec2 f = fract(pxy);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  void main() {
    float aspect = max(uResolution.x / max(uResolution.y, 1.0), 1.0);
    vec2 coord = (vUv - 0.5) * vec2(aspect, 1.0);
    vec2 pointer = vec2(uPointer.x * aspect, uPointer.y);
    float velocity = clamp(length(uVelocity) * 14.0, 0.0, 1.0);
    vec2 pointerShift = pointer * uPointerInfluence;
    float radial = length(coord * vec2(0.88, 1.12));
    float envelope = 1.0 - smoothstep(0.18, 1.18, radial);

    vec2 swirl = vec2(
      sin(
        coord.y * uSwirlDensity + coord.x * 1.8 + uTime * 0.12 + radial * 4.2
      ),
      cos(
        coord.x * uSwirlDensity * 0.92 - coord.y * 1.4 - uTime * 0.1 - radial * 3.4
      )
    ) * uSwirlStrength * (envelope + 0.2);

    vec2 warped = coord + pointerShift + swirl;
    float largeNoise = valueNoise(vec3(warped * uLargeNoiseScale, uTime * 0.08));
    float mediumNoise = valueNoise(
      vec3(
        (warped + vec2(largeNoise * 0.2, largeNoise * -0.14)) * uMediumNoiseScale,
        uTime * 0.05 + 4.2
      )
    );
    float fineNoise = valueNoise(
      vec3(
        (warped + vec2(mediumNoise * 0.08, largeNoise * 0.08)) * uFineNoiseScale,
        uTime * 0.03 + 8.4
      )
    );

    float liquid = largeNoise * 0.55 + mediumNoise * 0.3 + fineNoise * 0.15;
    float pulse = sin(
      warped.x * 3.6 + warped.y * 2.8 - radial * 6.4 + uTime * 0.1 + liquid * 2.4
    ) * 0.5 + 0.5;
    pulse *= uDistortion;
    float pointerBloom = 1.0 - smoothstep(0.04, 0.58, length(coord - pointer * 0.22));
    float height = liquid + envelope * 0.18 + pointerBloom * 0.06;
    float field = clamp(
      liquid * 0.78 + pulse * 0.22 + envelope * uFadeStrength + pointerBloom * 0.08 + velocity * 0.04,
      0.0,
      1.0
    );

    vec3 milky = mix(uColorOuter, uColorMid, smoothstep(0.08, 0.78, field));
    vec3 core = mix(milky, uColorCore, smoothstep(0.38, 0.94, liquid + envelope * 0.1));
    vec3 baseColor = mix(core, uColorShade, smoothstep(0.6, 1.02, liquid + pulse * 0.45));

    float eps = 0.006;
    float hC = height;
    float hX =
      valueNoise(vec3((warped + vec2(eps, 0.0)) * uLargeNoiseScale, uTime * 0.08)) * 0.55 +
      mediumNoise * 0.3 + fineNoise * 0.15;
    float hY =
      valueNoise(vec3((warped + vec2(0.0, eps)) * uLargeNoiseScale, uTime * 0.08)) * 0.55 +
      mediumNoise * 0.3 + fineNoise * 0.15;
    vec2 grad = vec2(hX - hC, hY - hC);
    vec3 normal = normalize(vec3(grad.x * -1.9, grad.y * -1.9, 1.0));
    vec3 lightDir = normalize(vec3(0.25, 0.55, 0.95));
    float diff = clamp(dot(normal, lightDir), 0.0, 1.0);
    vec3 halfDir = normalize(lightDir + vec3(0.0, 0.0, 1.0));
    float spec = pow(clamp(dot(normal, halfDir), 0.0, 1.0), 28.0) * 0.12;
    vec3 lit = baseColor * mix(0.9, 1.12, diff) + vec3(spec);

    gl_FragColor = vec4(lit, 1.0);
  }
`;

/**
 * WebGPU TSL — liquid marble project-detail background.
 */
export async function buildProjectDetailBackgroundMaterialWebGpu(controls) {
  const tsl = await import("three/tsl");
  const { MeshBasicNodeMaterial } = await import("three/webgpu");
  const {
    Fn,
    float,
    vec2,
    vec3,
    uniform,
    uv,
    mix,
    clamp,
    smoothstep,
    length,
    max,
    sin,
    cos,
    dot,
    normalize,
    pow,
    mx_noise_float,
  } = tsl;

  const uniforms = {
    uTime: uniform(0),
    uResolution: uniform(new THREE.Vector2(1, 1)),
    uPointer: uniform(new THREE.Vector2(0, 0)),
    uVelocity: uniform(new THREE.Vector2(0, 0)),
    uSwirlStrength: uniform(controls.swirlStrength),
    uSwirlDensity: uniform(controls.swirlDensity),
    uDistortion: uniform(controls.distortion),
    uPointerInfluence: uniform(controls.pointerInfluence),
    uFadeStrength: uniform(controls.fadeStrength),
    uLargeNoiseScale: uniform(controls.largeNoiseScale),
    uMediumNoiseScale: uniform(controls.mediumNoiseScale),
    uFineNoiseScale: uniform(controls.fineNoiseScale),
    uColorOuter: uniform(createColor(controls.colorOuter)),
    uColorMid: uniform(createColor(controls.colorMid)),
    uColorCore: uniform(createColor(controls.colorCore)),
    uColorShade: uniform(createColor(controls.colorShade)),
  };

  const material = new MeshBasicNodeMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: false,
  });

  material.colorNode = Fn(() => {
    const aspect = max(
      uniforms.uResolution.x.div(max(uniforms.uResolution.y, float(1.0))),
      float(1.0),
    );
    const coord = uv()
      .sub(0.5)
      .mul(vec2(aspect, float(1.0)));
    const pointer = vec2(uniforms.uPointer.x.mul(aspect), uniforms.uPointer.y);
    const velocity = clamp(length(uniforms.uVelocity).mul(14), 0, 1);
    const pointerShift = pointer.mul(uniforms.uPointerInfluence);
    const radial = length(coord.mul(vec2(0.88, float(1.12))));
    const envelope = float(1).sub(smoothstep(float(0.18), float(1.18), radial));

    const swirl = vec2(
      sin(
        coord.y
          .mul(uniforms.uSwirlDensity)
          .add(coord.x.mul(1.8))
          .add(uniforms.uTime.mul(0.12))
          .add(radial.mul(4.2)),
      ),
      cos(
        coord.x
          .mul(uniforms.uSwirlDensity.mul(0.92))
          .sub(coord.y.mul(1.4))
          .sub(uniforms.uTime.mul(0.1))
          .sub(radial.mul(3.4)),
      ),
    ).mul(uniforms.uSwirlStrength.mul(envelope.add(float(0.2))));

    const warped = coord.add(pointerShift).add(swirl);
    const largeNoise = mx_noise_float(
      vec3(warped.mul(uniforms.uLargeNoiseScale), uniforms.uTime.mul(0.08)),
    );
    const mediumNoise = mx_noise_float(
      vec3(
        warped
          .add(vec2(largeNoise.mul(0.2), largeNoise.mul(-0.14)))
          .mul(uniforms.uMediumNoiseScale),
        uniforms.uTime.mul(0.05).add(4.2),
      ),
    );
    const fineNoise = mx_noise_float(
      vec3(
        warped.add(vec2(mediumNoise.mul(0.08), largeNoise.mul(0.08))).mul(uniforms.uFineNoiseScale),
        uniforms.uTime.mul(0.03).add(8.4),
      ),
    );

    const liquid = largeNoise.mul(0.55).add(mediumNoise.mul(0.3)).add(fineNoise.mul(0.15));
    const pulse = sin(
      warped.x
        .mul(3.6)
        .add(warped.y.mul(2.8))
        .sub(radial.mul(6.4))
        .add(uniforms.uTime.mul(0.1))
        .add(liquid.mul(2.4)),
    )
      .mul(0.5)
      .add(0.5)
      .mul(uniforms.uDistortion);
    const pointerBloom = float(1).sub(
      smoothstep(float(0.04), float(0.58), length(coord.sub(pointer.mul(0.22)))),
    );
    const height = liquid.add(envelope.mul(0.18)).add(pointerBloom.mul(0.06));
    const field = clamp(
      liquid
        .mul(0.78)
        .add(pulse.mul(0.22))
        .add(envelope.mul(uniforms.uFadeStrength))
        .add(pointerBloom.mul(0.08))
        .add(velocity.mul(0.04)),
      0,
      1,
    );
    const milky = mix(
      uniforms.uColorOuter,
      uniforms.uColorMid,
      smoothstep(float(0.08), float(0.78), field),
    );
    const core = mix(
      milky,
      uniforms.uColorCore,
      smoothstep(float(0.38), float(0.94), liquid.add(envelope.mul(0.1))),
    );

    const baseColor = mix(
      core,
      uniforms.uColorShade,
      smoothstep(float(0.6), float(1.02), liquid.add(pulse.mul(0.45))),
    );

    const eps = float(0.006);
    const hC = height;
    const hX = mx_noise_float(
      vec3(warped.add(vec2(eps, 0)).mul(uniforms.uLargeNoiseScale), uniforms.uTime.mul(0.08)),
    )
      .mul(0.55)
      .add(mediumNoise.mul(0.3))
      .add(fineNoise.mul(0.15));
    const hY = mx_noise_float(
      vec3(warped.add(vec2(0, eps)).mul(uniforms.uLargeNoiseScale), uniforms.uTime.mul(0.08)),
    )
      .mul(0.55)
      .add(mediumNoise.mul(0.3))
      .add(fineNoise.mul(0.15));
    const grad = vec2(hX.sub(hC), hY.sub(hC));
    const normal = normalize(vec3(grad.x.mul(-1.9), grad.y.mul(-1.9), float(1)));
    const lightDir = normalize(vec3(0.25, 0.55, 0.95));
    const diff = clamp(dot(normal, lightDir), 0, 1);
    const viewDir = vec3(0, 0, 1);
    const halfDir = normalize(lightDir.add(viewDir));
    const spec = pow(clamp(dot(normal, halfDir), 0, 1), float(28)).mul(0.12);
    const lit = baseColor.mul(mix(float(0.9), float(1.12), diff)).add(vec3(spec));

    return lit;
  })();

  material.opacityNode = float(1);

  return { material, uniforms };
}

/**
 * WebGL ShaderMaterial — same liquid marble look as WebGPU path.
 */
export function buildProjectDetailBackgroundMaterialWebGl(controls) {
  const uniforms = createBackgroundUniforms(controls);
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: false,
    uniforms,
    vertexShader: WEBGL_VERT,
    fragmentShader: WEBGL_FRAG,
  });

  return { material, uniforms };
}
