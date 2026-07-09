import { MathUtils, Uniform } from "three";
import type * as THREE from "three";
import { Effect } from "postprocessing";
import { wrapEffect } from "@react-three/postprocessing";
import { usePostFxControlsStore } from "../store/postFx";
import type { PostFxControls } from "./config/postFxDefaults";

/** Scene-wide exposure / levels / color — same math as the work cloth strip shader. */
const fragmentShader = /* glsl */ `
uniform float uExposure;
uniform float uLevelsInLow;
uniform float uLevelsInHigh;
uniform float uLevelsGamma;
uniform float uLevelsOutLow;
uniform float uLevelsOutHigh;
uniform float uBrightness;
uniform float uContrast;
uniform float uSaturation;
uniform float uHue;
uniform float uTint;

vec3 applyLevels(vec3 c) {
  c = clamp((c - uLevelsInLow) / max(uLevelsInHigh - uLevelsInLow, 1e-4), 0.0, 1.0);
  c = pow(c, vec3(1.0 / max(uLevelsGamma, 1e-4)));
  return mix(vec3(uLevelsOutLow), vec3(uLevelsOutHigh), c);
}

vec3 applyHue(vec3 c, float angle) {
  float cosA = cos(angle);
  float sinA = sin(angle);
  mat3 m = mat3(
    0.299 + 0.701 * cosA + 0.168 * sinA, 0.587 - 0.587 * cosA + 0.330 * sinA, 0.114 - 0.114 * cosA - 0.497 * sinA,
    0.299 - 0.299 * cosA - 0.328 * sinA, 0.587 + 0.413 * cosA + 0.035 * sinA, 0.114 - 0.114 * cosA + 0.292 * sinA,
    0.299 - 0.300 * cosA + 1.250 * sinA, 0.587 - 0.588 * cosA - 1.050 * sinA, 0.114 + 0.886 * cosA - 0.203 * sinA
  );
  return clamp(m * c, 0.0, 1.0);
}

// Green (-) ↔ magenta (+) white-balance tint.
vec3 applyTint(vec3 c, float tint) {
  c.g -= tint * 0.08;
  c.r += tint * 0.04;
  c.b += tint * 0.04;
  return c;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec3 color = inputColor.rgb;
  color *= exp2(uExposure);
  color = applyLevels(color);
  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
  color = mix(vec3(luma), color, uSaturation);
  color = (color - 0.5) * uContrast + 0.5;
  color *= uBrightness;
  color = applyHue(color, uHue);
  color = applyTint(color, uTint);
  outputColor = vec4(color, inputColor.a);
}
`;

function syncColorGradeUniforms(
  uniforms: Map<string, THREE.Uniform<unknown>>,
  cg: PostFxControls["colorGrade"],
) {
  const set = (key: string, value: number) => {
    const uniform = uniforms.get(key) as THREE.Uniform<number> | undefined;
    if (uniform) uniform.value = value;
  };

  set("uExposure", cg.exposure);
  set("uLevelsInLow", cg.levelsInLow);
  set("uLevelsInHigh", cg.levelsInHigh);
  set("uLevelsGamma", cg.levelsGamma);
  set("uLevelsOutLow", cg.levelsOutLow);
  set("uLevelsOutHigh", cg.levelsOutHigh);
  set("uBrightness", cg.brightness);
  set("uContrast", cg.contrast);
  set("uSaturation", cg.saturation);
  set("uHue", MathUtils.degToRad(cg.hue));
  set("uTint", cg.tint);
}

class ColorGradeEffectImpl extends Effect {
  constructor(cg: PostFxControls["colorGrade"]) {
    super("ColorGradeEffect", fragmentShader, {
      uniforms: new Map([
        ["uExposure", new Uniform(cg.exposure)],
        ["uLevelsInLow", new Uniform(cg.levelsInLow)],
        ["uLevelsInHigh", new Uniform(cg.levelsInHigh)],
        ["uLevelsGamma", new Uniform(cg.levelsGamma)],
        ["uLevelsOutLow", new Uniform(cg.levelsOutLow)],
        ["uLevelsOutHigh", new Uniform(cg.levelsOutHigh)],
        ["uBrightness", new Uniform(cg.brightness)],
        ["uContrast", new Uniform(cg.contrast)],
        ["uSaturation", new Uniform(cg.saturation)],
        ["uHue", new Uniform(MathUtils.degToRad(cg.hue))],
        ["uTint", new Uniform(cg.tint)],
      ]),
    });
  }

  update(_renderer: THREE.WebGLRenderer, _inputBuffer: THREE.WebGLRenderTarget, _delta: number) {
    syncColorGradeUniforms(
      this.uniforms,
      usePostFxControlsStore.getState().controls.colorGrade,
    );
  }
}

const ColorGrade = wrapEffect(ColorGradeEffectImpl);
export default ColorGrade;
