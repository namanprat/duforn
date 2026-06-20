// @ts-nocheck
import * as THREE from "three";

const PLANE_ASPECT = 0.28 / 0.235;

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
  uniform sampler2D uImage;
  uniform float uTime;
  uniform float uImageAspect;
  uniform float uResolutionY;

  void main() {
    vec2 baseUv = vUv;
    vec2 coveredUv;
    if (uImageAspect <= ${PLANE_ASPECT.toFixed(6)}) {
      float yScale = uImageAspect / ${PLANE_ASPECT.toFixed(6)};
      coveredUv = vec2(baseUv.x, baseUv.y * yScale + (1.0 - yScale) * 0.5);
    } else {
      float xScale = ${PLANE_ASPECT.toFixed(6)} / uImageAspect;
      coveredUv = vec2(baseUv.x * xScale + (1.0 - xScale) * 0.5, baseUv.y);
    }

    float rgbShift = 0.0025;
    vec3 source = texture2D(uImage, coveredUv).rgb;
    float red = texture2D(uImage, coveredUv + vec2(rgbShift, rgbShift)).r;
    float blue = texture2D(uImage, coveredUv + vec2(-rgbShift, 0.0)).b;
    vec3 crtRgb = vec3(red, source.g, blue) * vec3(0.95, 1.05, 0.95);

    float scanline = sin(coveredUv.y * uResolutionY * 1.5 + uTime * 10.0) * 0.2 + 0.8;
    float vignette = pow(
      coveredUv.x * coveredUv.y * (1.0 - coveredUv.x) * (1.0 - coveredUv.y) * 16.0,
      0.12
    );
    vec3 crt = crtRgb * scanline * vignette;
    vec3 boosted = clamp(crt * 1.08, 0.0, 1.0);
    gl_FragColor = vec4(boosted, 1.0);
  }
`;

/**
 * WebGPU TSL — CRT monitor screen (object-fit cover, scanlines, vignette, RGB shift).
 */
export async function buildNotFoundScreenMaterialWebGpu(imageTexture) {
  const { MeshBasicNodeMaterial } = await import("three/webgpu");
  const { clamp, float, mix, sin, step, texture, uniform, uv, vec2, vec3 } =
    await import("three/tsl");

  const timeUniform = uniform(0);
  const imageAspectUniform = uniform(1);
  const resolutionYUniform = uniform(1);
  const planeAspect = float(PLANE_ASPECT);
  const imageAspect = imageAspectUniform;
  const branch = step(imageAspect, planeAspect);
  const one = float(1);

  const material = new MeshBasicNodeMaterial();
  const baseUv = uv();
  const yScale = imageAspect.div(planeAspect);
  const xScale = planeAspect.div(imageAspect);
  const coveredUv = vec2(
    mix(baseUv.x.mul(xScale).add(one.sub(xScale).mul(0.5)), baseUv.x, branch),
    mix(baseUv.y, baseUv.y.mul(yScale).add(one.sub(yScale).mul(0.5)), branch),
  );

  const rgbShift = float(0.0025);
  const rUv = coveredUv.add(vec2(rgbShift, rgbShift));
  const bUv = coveredUv.add(vec2(rgbShift.mul(-1), float(0)));
  const source = texture(imageTexture, coveredUv).rgb;
  const red = texture(imageTexture, rUv).r;
  const blue = texture(imageTexture, bUv).b;
  const crtRgb = vec3(red, source.g, blue).mul(vec3(0.95, 1.05, 0.95));

  const scanline = sin(coveredUv.y.mul(resolutionYUniform).mul(1.5).add(timeUniform.mul(10)))
    .mul(0.2)
    .add(0.8);
  const vignette = coveredUv.x
    .mul(coveredUv.y)
    .mul(one.sub(coveredUv.x))
    .mul(one.sub(coveredUv.y))
    .mul(16)
    .pow(0.12);
  const crt = crtRgb.mul(scanline).mul(vignette);
  const boosted = clamp(crt.mul(1.08), vec3(0), vec3(1));

  material.colorNode = boosted;

  return {
    material,
    uniforms: {
      uTime: timeUniform,
      uImageAspect: imageAspectUniform,
      uResolutionY: resolutionYUniform,
    },
  };
}

/**
 * WebGL ShaderMaterial — same CRT look as {@link buildNotFoundScreenMaterialWebGpu}.
 */
export function buildNotFoundScreenMaterialWebGl(imageTexture) {
  const uniforms = {
    uImage: { value: imageTexture },
    uTime: { value: 0 },
    uImageAspect: { value: 1 },
    uResolutionY: { value: 1 },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: WEBGL_VERT,
    fragmentShader: WEBGL_FRAG,
  });

  return { material, uniforms };
}
