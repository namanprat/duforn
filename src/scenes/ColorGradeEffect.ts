import { Uniform } from "three";
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

vec3 applyLevels(vec3 c) {
  c = clamp((c - uLevelsInLow) / max(uLevelsInHigh - uLevelsInLow, 1e-4), 0.0, 1.0);
  c = pow(c, vec3(1.0 / max(uLevelsGamma, 1e-4)));
  return mix(vec3(uLevelsOutLow), vec3(uLevelsOutHigh), c);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec3 color = inputColor.rgb;
  color *= exp2(uExposure);
  color = applyLevels(color);
  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
  color = mix(vec3(luma), color, uSaturation);
  color = (color - 0.5) * uContrast + 0.5;
  color *= uBrightness;
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
