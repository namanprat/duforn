import { Effect } from "postprocessing";
import * as THREE from "three";
import type { PostFxControls } from "./config/postFxDefaults";
import { usePostFxControlsStore } from "../store/postFx";

/** ACES + radial CA + film grain in one full-screen pass (replaces 3 composer children). */
const gradeShader = /* glsl */ `
uniform float toneEnabled;
uniform float caEnabled;
uniform vec2 caOffset;
uniform float radialModulation;
uniform float modulationOffset;
uniform float grainEnabled;
uniform float grainOpacity;
uniform float time;

vec3 acesFilm(vec3 x) {
  float a = 2.51;
  float b = 0.03;
  float c = 2.43;
  float d = 0.59;
  float e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec3 color;

  if (caEnabled > 0.5) {
    vec2 center = uv - 0.5;
    float dist = length(center);
    vec2 dir = dist > 1e-5 ? center / dist : vec2(0.0);
    float mod = radialModulation > 0.5 ? max(dist - modulationOffset, 0.0) : 1.0;
    vec2 off = caOffset * mod;
    color.r = texture2D(inputBuffer, uv + dir * off).r;
    color.g = texture2D(inputBuffer, uv).g;
    color.b = texture2D(inputBuffer, uv - dir * off).b;
  } else {
    color = texture2D(inputBuffer, uv).rgb;
  }

  if (toneEnabled > 0.5) {
    color = acesFilm(color);
  }

  if (grainEnabled > 0.5) {
    float n = fract(sin(dot(gl_FragCoord.xy + time, vec2(12.9898, 78.233))) * 43758.5453);
    color += (n - 0.5) * grainOpacity;
  }

  outputColor = vec4(color, inputColor.a);
}
`;

export class SceneGradeEffect extends Effect {
  constructor() {
    super("SceneGradeEffect", gradeShader, {
      uniforms: new Map<string, THREE.Uniform<number | THREE.Vector2>>([
        ["toneEnabled", new THREE.Uniform(1)],
        ["caEnabled", new THREE.Uniform(1)],
        ["caOffset", new THREE.Uniform(new THREE.Vector2(0.0012, 0.0012))],
        ["radialModulation", new THREE.Uniform(1)],
        ["modulationOffset", new THREE.Uniform(0.38)],
        ["grainEnabled", new THREE.Uniform(1)],
        ["grainOpacity", new THREE.Uniform(0.03)],
        ["time", new THREE.Uniform(0)],
      ]),
    });
  }

  syncFromControls(fx: PostFxControls, elapsed: number): void {
    const u = this.uniforms;
    (u.get("toneEnabled") as THREE.Uniform<number>).value = fx.toneMapping.enabled ? 1 : 0;
    (u.get("caEnabled") as THREE.Uniform<number>).value = fx.chromaticAberration.enabled ? 1 : 0;
    const caOff = u.get("caOffset") as THREE.Uniform<THREE.Vector2>;
    caOff.value.set(fx.chromaticAberration.offsetX, fx.chromaticAberration.offsetY);
    (u.get("radialModulation") as THREE.Uniform<number>).value = fx.chromaticAberration
      .radialModulation
      ? 1
      : 0;
    (u.get("modulationOffset") as THREE.Uniform<number>).value =
      fx.chromaticAberration.modulationOffset;
    (u.get("grainEnabled") as THREE.Uniform<number>).value = fx.grain.enabled ? 1 : 0;
    (u.get("grainOpacity") as THREE.Uniform<number>).value = fx.grain.opacity;
    (u.get("time") as THREE.Uniform<number>).value = elapsed;
  }

  update(
    _renderer: THREE.WebGLRenderer,
    _inputBuffer: THREE.WebGLRenderTarget,
    deltaTime: number,
  ): void {
    const timeUniform = this.uniforms.get("time") as THREE.Uniform<number>;
    timeUniform.value += deltaTime;
    this.syncFromControls(usePostFxControlsStore.getState().controls, timeUniform.value);
  }
}
