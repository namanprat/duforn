import { Effect } from "postprocessing";
import * as THREE from "three";

/** Original dithering pattern: https://www.shadertoy.com/view/ltSSzW */
const ditheringShader = /*glsl*/ `
uniform float ditheringEnabled;
uniform vec2 resolution;
uniform float gridSize;
uniform float luminanceMethod;
uniform float invertColor;
uniform float pixelSizeRatio;
uniform float grayscaleOnly;

bool getValue(float brightness, vec2 pos) {
  if (brightness > 16.0 / 17.0) return false;
  if (brightness < 1.0 / 17.0) return true;

  vec2 pixel = floor(mod(pos.xy / gridSize, 4.0));
  int x = int(pixel.x);
  int y = int(pixel.y);

  if (x == 0) {
    if (y == 0) return brightness < 16.0 / 17.0;
    if (y == 1) return brightness < 5.0 / 17.0;
    if (y == 2) return brightness < 13.0 / 17.0;
    return brightness < 1.0 / 17.0;
  } else if (x == 1) {
    if (y == 0) return brightness < 8.0 / 17.0;
    if (y == 1) return brightness < 12.0 / 17.0;
    if (y == 2) return brightness < 4.0 / 17.0;
    return brightness < 9.0 / 17.0;
  } else if (x == 2) {
    if (y == 0) return brightness < 14.0 / 17.0;
    if (y == 1) return brightness < 2.0 / 17.0;
    if (y == 2) return brightness < 15.0 / 17.0;
    return brightness < 3.0 / 17.0;
  } else {
    if (y == 0) return brightness < 6.0 / 17.0;
    if (y == 1) return brightness < 10.0 / 17.0;
    if (y == 2) return brightness < 7.0 / 17.0;
    return brightness < 11.0 / 17.0;
  }
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec2 fragCoord = uv * resolution;
  vec3 baseColor;

  float pixelSize = gridSize * pixelSizeRatio;
  vec2 pixelatedUV = floor(fragCoord / pixelSize) * pixelSize / resolution;
  baseColor = texture2D(inputBuffer, pixelatedUV).rgb;

  float luminance = dot(baseColor, vec3(1.,1.,1.));

  if (grayscaleOnly > 0.0) {
    baseColor = vec3(luminance);
  }

  bool dithered = getValue(luminance, fragCoord);
  vec3 ditherColor = dithered ? vec3(0.0) : baseColor;

  vec2 currentPixel = floor(fragCoord / pixelSize);
  vec2 originalPixel = floor(uv * resolution / pixelSize);

  baseColor = (currentPixel == originalPixel) ? ditherColor : baseColor;

  if (invertColor > 0.0) {
    baseColor = 1.0 - baseColor;
  }

  outputColor = vec4(baseColor, inputColor.a);
}`;

export interface DitheringEffectOptions {
  time?: number;
  resolution?: THREE.Vector2;
  gridSize?: number;
  luminanceMethod?: number;
  invertColor?: boolean;
  pixelSizeRatio?: number;
  grayscaleOnly?: boolean;
}

export class DitheringEffect extends Effect {
  uniforms: Map<string, THREE.Uniform<number | THREE.Vector2>>;

  constructor({
    time = 0,
    resolution = new THREE.Vector2(1, 1),
    gridSize = 4.0,
    luminanceMethod = 0,
    invertColor = false,
    pixelSizeRatio = 1,
    grayscaleOnly = false,
  }: DitheringEffectOptions = {}) {
    const uniforms = new Map<string, THREE.Uniform<number | THREE.Vector2>>([
      ["time", new THREE.Uniform(time)],
      ["resolution", new THREE.Uniform(resolution)],
      ["gridSize", new THREE.Uniform(gridSize)],
      ["luminanceMethod", new THREE.Uniform(luminanceMethod)],
      ["invertColor", new THREE.Uniform(invertColor ? 1 : 0)],
      ["ditheringEnabled", new THREE.Uniform(1)],
      ["pixelSizeRatio", new THREE.Uniform(pixelSizeRatio)],
      ["grayscaleOnly", new THREE.Uniform(grayscaleOnly ? 1 : 0)],
    ]);

    super("DitheringEffect", ditheringShader, { uniforms });
    this.uniforms = uniforms;
  }

  update(
    _renderer: THREE.WebGLRenderer,
    inputBuffer: THREE.WebGLRenderTarget,
    deltaTime: number,
  ): void {
    const timeUniform = this.uniforms.get("time");
    if (timeUniform !== undefined && typeof timeUniform.value === "number") {
      timeUniform.value += deltaTime;
    }

    const resolutionUniform = this.uniforms.get("resolution");
    if (resolutionUniform !== undefined && resolutionUniform.value instanceof THREE.Vector2) {
      resolutionUniform.value.set(inputBuffer.width, inputBuffer.height);
    }
  }
}
