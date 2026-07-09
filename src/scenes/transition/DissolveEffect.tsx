import { Uniform } from "three";
import * as THREE from "three";
import { Effect } from "postprocessing";
import { wrapEffect } from "@react-three/postprocessing";
import { useDissolveTransitionStore } from "../../store/routeTransition";
import { usePostFxControlsStore } from "../../store/postFx";
import { getDissolveProgress } from "../preloader/bootRevealTimeline";
import { tryCaptureDepartingHoldout } from "./departingHoldout";

const HOLDOUT_FALLBACK = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
HOLDOUT_FALLBACK.needsUpdate = true;
HOLDOUT_FALLBACK.colorSpace = THREE.SRGBColorSpace;

/**
 * Center-pierce dissolve on the live frame. Boot uses solid black outside the iris;
 * archive route changes freeze the departing page into uHoldout. Both use the full
 * stylized pierce (stars, rim glow, hold beat).
 */
const fragmentShader = /* glsl */ `
  uniform float uProgress;
  uniform float uUseHoldout;
  uniform sampler2D uHoldout;
  uniform float uOutsideDarkness;
  uniform float uOutsideDesat;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float amp = 0.5;
    float freq = 1.0;
    for (int i = 0; i < 3; i++) {
      v += amp * noise(p * freq);
      amp *= 0.5;
      freq *= 2.0;
    }
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
    float cover = clamp(uProgress, 0.0, 1.0);
    if (cover <= 0.0) { outputColor = inputColor; return; }

    // Torn boundary — domain-warped fbm, driven by cover (no time).
    vec2 p = uv - 0.5;
    p.x *= aspect;
    float dist = length(p);

    vec2 q = vec2(fbm(p * 3.0), fbm(p * 3.0 + vec2(5.2, 1.3)));
    float edgeNoise = fbm(p * 5.0 + q * 2.5);
    float maxDist = length(vec2(aspect * 0.5, 0.5));
    float norm = (dist + (edgeNoise - 0.5) * 0.45) / maxDist;

    // cover 1 → void covers everything; cover 0 → no void (caught by early-out).
    float threshold = cover * 1.3;
    float inside = 1.0 - smoothstep(threshold - 0.01, threshold + 0.01, norm);

    // inside the tear = departing/void (black holdout on boot, washed old page on archive);
    // outside = the revealed live scene.
    vec3 col = mix(sampleInside(uv), sampleOutside(uv), inside);

    // Soft glowing rim — layered falloffs off the boundary distance.
    float ad = abs(norm - threshold);
    float core = smoothstep(0.035, 0.0, ad);
    float mid  = smoothstep(0.12, 0.0, ad);
    float wide = smoothstep(0.30, 0.0, ad);
    float glow = core + mid * 0.6 + wide * 0.25;
    glow *= 0.65 + 0.7 * fbm(uv * vec2(aspect, 1.0) * 14.0);
    glow = 1.0 - exp(-glow * 2.0);

    col = mix(col, vec3(1.0, 0.98, 0.93), glow);

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
      uniforms: new Map([
        ["uProgress", new Uniform(0)],
        ["uHoldout", uHoldout],
        ["uUseHoldout", uUseHoldout],
        ["uOutsideDarkness", new Uniform(dissolve.outsideDarkness)],
        ["uOutsideDesat", new Uniform(dissolve.outsideDesat)],
      ]),
    });

    this.uHoldout = uHoldout;
    this.uUseHoldout = uUseHoldout;
  }

  private syncDissolveUniforms(dissolve: ReturnType<typeof usePostFxControlsStore.getState>["controls"]["dissolve"]) {
    const set = (key: string, value: number) => {
      const uniform = this.uniforms.get(key) as THREE.Uniform<number> | undefined;
      if (uniform) uniform.value = value;
    };

    set("uOutsideDarkness", dissolve.outsideDarkness);
    set("uOutsideDesat", dissolve.outsideDesat);
  }

  update(renderer: THREE.WebGLRenderer, inputBuffer: THREE.WebGLRenderTarget, _delta: number) {
    const captured = tryCaptureDepartingHoldout(renderer, inputBuffer);
    if (captured) useDissolveTransitionStore.getState().setHoldout(captured);

    const { holdout, useHoldout, active } = useDissolveTransitionStore.getState();
    const dissolve = usePostFxControlsStore.getState().controls.dissolve;
    this.syncDissolveUniforms(dissolve);

    const devPreview = import.meta.env.DEV && dissolve.devPreview;
    const progress = devPreview ? dissolve.devProgress : active ? getDissolveProgress() : 0;

    const uProgress = this.uniforms.get("uProgress");
    if (uProgress) uProgress.value = progress;
    this.uUseHoldout.value = useHoldout ? 1 : 0;
    if (holdout) this.uHoldout.value = holdout;
  }
}

const DissolveTransition = wrapEffect(DissolveEffectImpl);

export default DissolveTransition;
