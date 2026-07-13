import { Uniform } from "three";
import * as THREE from "three";
import { Effect } from "postprocessing";
import { wrapEffect } from "@react-three/postprocessing";
import { useDissolveTransitionStore } from "../../store/routeTransition";
import { usePostFxControlsStore } from "../../store/postFx";
import { getDissolveProgress } from "../preloader/bootRevealTimeline";

const HOLDOUT_FALLBACK = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
HOLDOUT_FALLBACK.needsUpdate = true;
HOLDOUT_FALLBACK.colorSpace = THREE.SRGBColorSpace;

/**
 * Exact codegrid-ironhill wipe on the live frame.
 * uProgress matches the demo: 0 = open (live), 1.1 = closed (holdout).
 * Holdout fills where ironhill drew solid color — black on boot only.
 */
const fragmentShader = /* glsl */ `
  uniform float uProgress;
  uniform float uUseHoldout;
  uniform sampler2D uHoldout;
  uniform float uOutsideDarkness;
  uniform float uOutsideDesat;
  uniform float uSpread;

  float Hash(vec2 p) {
    vec3 p2 = vec3(p.xy, 1.0);
    return fract(sin(dot(p2, vec3(37.1, 61.7, 12.4))) * 3758.5453123);
  }

  float noise(in vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f *= f * (3.0 - 2.0 * f);
    return mix(
      mix(Hash(i + vec2(0.0, 0.0)), Hash(i + vec2(1.0, 0.0)), f.x),
      mix(Hash(i + vec2(0.0, 1.0)), Hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    v += noise(p * 1.0) * 0.5;
    v += noise(p * 2.0) * 0.25;
    v += noise(p * 4.0) * 0.125;
    return v;
  }

  float luminance(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

  vec3 sampleInside(vec2 uvc) {
    return texture2D(inputBuffer, clamp(uvc, 0.0, 1.0)).rgb;
  }

  vec3 sampleOutside(vec2 uvc) {
    if (uUseHoldout > 0.5) {
      return texture2D(uHoldout, clamp(uvc, 0.0, 1.0)).rgb;
    }
    vec3 live = sampleInside(uvc);
    float lum = luminance(live);
    vec3 desat = mix(vec3(lum), live, uOutsideDesat);
    desat = pow(desat, vec3(1.35));
    desat *= uOutsideDarkness;
    float edge = abs(luminance(sampleInside(uvc + texelSize)) - luminance(sampleInside(uvc - texelSize)));
    edge += abs(luminance(sampleInside(uvc + vec2(texelSize.x, 0.0))) - luminance(sampleInside(uvc - vec2(texelSize.x, 0.0))));
    float sketch = smoothstep(0.02, 0.14, edge) * 0.55;
    desat += vec3(sketch);
    float vig = 1.0 - smoothstep(0.2, 0.85, length(uvc - 0.5) * 1.4);
    return desat * vig;
  }

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    float progress = uProgress;
    if (progress <= 0.0) { outputColor = inputColor; return; }
    if (progress >= 1.1) {
      outputColor = vec4(sampleOutside(uv), inputColor.a);
      return;
    }

    // Flipped ironhill edge — wipe travels the opposite vertical direction.
    vec2 centeredUv = (uv - 0.5) * vec2(aspect, 1.0);
    float dissolveEdge = (1.0 - uv.y) - progress * 1.2;
    float noiseValue = fbm(centeredUv * 15.0);
    float d = dissolveEdge + noiseValue * uSpread;
    float pixelSize = texelSize.y;
    float alpha = 1.0 - smoothstep(-pixelSize, pixelSize, d);

    vec3 col = mix(sampleInside(uv), sampleOutside(uv), alpha);
    outputColor = vec4(col, inputColor.a);
  }
`;

class DissolveEffectImpl extends Effect {
  private readonly uHoldout: THREE.Uniform<THREE.Texture>;
  private readonly uUseHoldout: THREE.Uniform<number>;

  constructor() {
    const uHoldout = new Uniform(HOLDOUT_FALLBACK);
    const uUseHoldout = new Uniform(0);
    const dissolve = usePostFxControlsStore.getState().controls.dissolve;

    super("DissolveTransition", fragmentShader, {
      uniforms: new Map<string, Uniform<unknown>>([
        ["uProgress", new Uniform(0)],
        ["uHoldout", uHoldout],
        ["uUseHoldout", uUseHoldout],
        ["uOutsideDarkness", new Uniform(dissolve.outsideDarkness)],
        ["uOutsideDesat", new Uniform(dissolve.outsideDesat)],
        ["uSpread", new Uniform(dissolve.edgeNoiseAmp)],
      ]),
    });

    this.uHoldout = uHoldout;
    this.uUseHoldout = uUseHoldout;
  }

  private syncDissolveUniforms(dissolve: ReturnType<typeof usePostFxControlsStore.getState>["controls"]["dissolve"]) {
    const set = (key: "uOutsideDarkness" | "uOutsideDesat" | "uSpread", value: number) => {
      const uniform = this.uniforms.get(key) as THREE.Uniform<number> | undefined;
      if (uniform) uniform.value = value;
    };

    set("uOutsideDarkness", dissolve.outsideDarkness);
    set("uOutsideDesat", dissolve.outsideDesat);
    set("uSpread", dissolve.edgeNoiseAmp);
  }

  update(_renderer: THREE.WebGLRenderer, inputBuffer: THREE.WebGLRenderTarget, _delta: number) {
    const { holdout, useHoldout, active } = useDissolveTransitionStore.getState();
    const dissolve = usePostFxControlsStore.getState().controls.dissolve;
    const devPreview = import.meta.env.DEV && dissolve.devPreview;
    const progress = active ? getDissolveProgress() : devPreview ? dissolve.devProgress : 0;

    const uProgress = this.uniforms.get("uProgress");
    if (uProgress) uProgress.value = progress;

    // ponytail: idle pass is a no-op — skip uniform churn when the wipe isn't running
    if (progress <= 0 && !active) return;

    this.syncDissolveUniforms(dissolve);
    this.uUseHoldout.value = useHoldout ? 1 : 0;
    if (holdout) this.uHoldout.value = holdout;
  }
}

const DissolveTransition = wrapEffect(DissolveEffectImpl);

export default DissolveTransition;
