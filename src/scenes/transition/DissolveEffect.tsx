import { Uniform } from "three";
import * as THREE from "three";
import { Effect } from "postprocessing";
import { wrapEffect } from "@react-three/postprocessing";
import { useDissolveTransitionStore } from "../../store/routeTransition";
import { tryCaptureDepartingHoldout } from "./departingHoldout";

const HOLDOUT_FALLBACK = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
HOLDOUT_FALLBACK.needsUpdate = true;
HOLDOUT_FALLBACK.colorSpace = THREE.SRGBColorSpace;

const NOISE_AMP = 0.192; // 0.24 × 0.8

/**
 * Center-pierce dissolve on the live frame. Archive route changes freeze the departing
 * page into `uHoldout` so the iris opens over the new scene while the sides still show
 * where you came from. Boot uses solid black outside the disk.
 */
const fragmentShader = /* glsl */ `
  uniform float uProgress;
  uniform float uUseHoldout;
  uniform sampler2D uHoldout;

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
    for (int i = 0; i < 5; i++) {
      v += amp * noise(p * freq);
      amp *= 0.5;
      freq *= 2.0;
    }
    return v;
  }

  vec3 sampleInside(vec2 uvc) {
    return texture2D(inputBuffer, clamp(uvc, 0.0, 1.0)).rgb;
  }

  vec3 sampleOutside(vec2 uvc) {
    return uUseHoldout > 0.5 ? texture2D(uHoldout, clamp(uvc, 0.0, 1.0)).rgb : vec3(0.0);
  }

  vec3 chromaMix(vec2 uv, vec2 caDir, float mask) {
    vec3 inside;
    inside.r = sampleInside(uv + caDir).r;
    inside.g = sampleInside(uv).g;
    inside.b = sampleInside(uv - caDir).b;

    vec3 outside;
    outside.r = sampleOutside(uv + caDir).r;
    outside.g = sampleOutside(uv).g;
    outside.b = sampleOutside(uv - caDir).b;

    return mix(inside, outside, mask);
  }

  vec3 bloomWhites(vec2 uv, vec3 white, float edgeMask) {
    vec3 spread = vec3(0.0);
    for (int i = -2; i <= 2; i++) {
      for (int j = -2; j <= 2; j++) {
        vec2 off = vec2(float(i), float(j)) * texelSize * 3.0;
        spread += white + sampleInside(uv + off) * 0.15;
      }
    }
    spread /= 25.0;
    vec3 hot = max(white, vec3(0.0));
    vec3 bloom = hot * hot * 4.0 + spread * edgeMask * 2.8;
    bloom += vec3(edgeMask * 0.85);
    return bloom;
  }

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    float cover = clamp(uProgress, 0.0, 1.0);
    if (cover <= 0.0) { outputColor = inputColor; return; }

    vec2 c = uv - 0.5;
    c.x *= aspect;
    float dist = length(c);
    float angle = atan(c.y, c.x);
    float blockNoise = fbm(floor(uv * resolution / 2.0) * 2.0 / resolution * 100.0) * ${NOISE_AMP.toFixed(3)};
    float angularNoise = fbm(vec2(angle * 6.0, 0.0)) * ${NOISE_AMP.toFixed(3)};
    float maxDist = length(vec2(aspect * 0.5, 0.5));
    float normDist = (dist + blockNoise + angularNoise) / maxDist;

    float threshold = (1.0 - cover) * 1.28;
    float mask = smoothstep(threshold - 0.06, threshold + 0.025, normDist);
    float tailFade = smoothstep(0.0, 0.12, cover);

    float ringWidth = 0.12;
    float ring = smoothstep(threshold - ringWidth, threshold, normDist) *
                 smoothstep(threshold + ringWidth * 0.65, threshold, normDist);
    float sparkle = hash(floor(uv * resolution / 1.5)) * ring;
    vec3 frontGlow = vec3(sparkle * 5.0 * cover);

    float rim = smoothstep(threshold - ringWidth * 0.85, threshold, normDist) *
                (1.0 - smoothstep(threshold, threshold + ringWidth * 0.45, normDist));
    vec3 rimGlow = vec3(1.0) * rim * 0.55 * cover;

    vec3 white = (frontGlow + rimGlow) * tailFade;
    float edgeMask = max(ring, rim) * cover * tailFade;
    vec2 caDir = normalize(c + 0.0001) * edgeMask * 0.022;

    vec3 baseMix = chromaMix(uv, caDir, mask);
    vec3 bloom = bloomWhites(uv, white, edgeMask);

    vec3 outc = baseMix + white + bloom;
    outputColor = vec4(outc, inputColor.a);
  }
`;

class DissolveEffectImpl extends Effect {
  private readonly uHoldout: THREE.Uniform<THREE.Texture>;
  private readonly uUseHoldout: THREE.Uniform<number>;

  constructor() {
    const uHoldout = new Uniform(HOLDOUT_FALLBACK);
    const uUseHoldout = new Uniform(0);

    super("DissolveTransition", fragmentShader, {
      uniforms: new Map([
        ["uProgress", new Uniform(0)],
        ["uHoldout", uHoldout],
        ["uUseHoldout", uUseHoldout],
      ]),
    });

    this.uHoldout = uHoldout;
    this.uUseHoldout = uUseHoldout;
  }

  update(renderer: THREE.WebGLRenderer, inputBuffer: THREE.WebGLRenderTarget, _delta: number) {
    const captured = tryCaptureDepartingHoldout(renderer, inputBuffer);
    if (captured) useDissolveTransitionStore.getState().setHoldout(captured);

    const { progress, holdout, useHoldout } = useDissolveTransitionStore.getState();
    const uProgress = this.uniforms.get("uProgress");
    if (uProgress) uProgress.value = progress;
    this.uUseHoldout.value = useHoldout ? 1 : 0;
    if (holdout) this.uHoldout.value = holdout;
  }
}

const DissolveTransition = wrapEffect(DissolveEffectImpl);

export default DissolveTransition;
