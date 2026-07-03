import { Uniform } from "three";
import * as THREE from "three";
import { Effect } from "postprocessing";
import { wrapEffect } from "@react-three/postprocessing";
import { useDissolveTransitionStore } from "../../store/routeTransition";
import { getDissolveProgress } from "../preloader/bootRevealTimeline";
import { tryCaptureDepartingHoldout } from "./departingHoldout";

const HOLDOUT_FALLBACK = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
HOLDOUT_FALLBACK.needsUpdate = true;
HOLDOUT_FALLBACK.colorSpace = THREE.SRGBColorSpace;

const NOISE_AMP = 0.192;
// Rim/glow fade as the iris finishes opening: 1 at open=FADE_START → 0 at open=FADE_END.
// Kills the "bright ring lingering off-screen after reveal" pop.
const GLOW_FADE_START = 0.45;
const GLOW_FADE_END = 0.85;
// Wide soft bloom halo around the crisp rim. Larger width = more spread; higher
// intensity = brighter, more intense glow.
const GLOW_WIDTH = 0.22;
const GLOW_INTENSITY = 2.6;

/**
 * Center-pierce dissolve on the live frame. Boot uses solid black outside the iris;
 * archive route changes freeze the departing page into uHoldout. Both use the full
 * stylized pierce (stars, rim glow, hold beat).
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
    vec3 desat = mix(vec3(lum), live, 0.18);
    desat = pow(desat, vec3(1.35));
    desat *= 0.22;
    float edge = abs(luminance(sampleInside(uvc + texelSize)) - luminance(sampleInside(uvc - texelSize)));
    edge += abs(luminance(sampleInside(uvc + vec2(texelSize.x, 0.0))) - luminance(sampleInside(uvc - vec2(texelSize.x, 0.0))));
    float sketch = smoothstep(0.02, 0.14, edge) * 0.55;
    desat += vec3(sketch);
    float vig = 1.0 - smoothstep(0.2, 0.85, length(uvc - 0.5) * 1.4);
    return desat * vig;
  }

  vec3 starBurst(vec2 uv, float open, float cover) {
    vec2 c = uv - 0.5;
    c.x *= aspect;
    float dist = length(c);
    float angle = atan(c.y, c.x);

    float gather = smoothstep(0.0, 0.22, open);
    float burst = smoothstep(0.18, 0.42, open) * (1.0 - smoothstep(0.5, 0.82, open));
    float voidRadius = mix(0.28, 0.0, open) * length(vec2(aspect * 0.5, 0.5));
    float inVoid = 1.0 - smoothstep(voidRadius * 0.7, voidRadius, dist);

    vec2 polar = vec2(angle * 8.0 + open * 4.0, dist * 120.0 - open * 80.0);
    float stars = 0.0;
    for (int i = 0; i < 3; i++) {
      float fi = float(i);
      vec2 cell = floor(polar * (1.0 + fi * 0.4));
      float h = hash(cell + fi * 17.0);
      float size = 0.0026 + h * 0.0052;
      float d = length(fract(polar * (1.0 + fi * 0.4)) - 0.5);
      stars += smoothstep(size, 0.0, d) * h;
    }

    float scatter = dist * burst * 2.5;
    stars *= inVoid * (gather * 0.6 + burst * 1.8);
    stars *= 1.0 + scatter;

    vec3 tint = mix(vec3(1.0), vec3(1.0, 0.92, 0.72), burst);
    return tint * stars * cover * 3.5;
  }

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    float cover = clamp(uProgress, 0.0, 1.0);
    if (cover <= 0.0) { outputColor = inputColor; return; }

    float open = 1.0 - cover;

    vec2 c = uv - 0.5;
    c.x *= aspect;
    float dist = length(c);
    float angle = atan(c.y, c.x);
    // Organic, rounded iris edge: smooth flow noise sampled continuously around
    // the ring (cos/sin so it wraps) and along the radius — no blocky quantization
    // and no fixed-N angular symmetry, so the pierce reads radial, not star-shaped.
    vec2 edgeSample = vec2(cos(angle), sin(angle)) * 1.7 + dist * 1.5;
    float edgeNoise = (fbm(edgeSample + open) - 0.5) * ${(NOISE_AMP * 1.6).toFixed(3)};
    float maxDist = length(vec2(aspect * 0.5, 0.5));
    float normDist = (dist + edgeNoise) / maxDist;

    float radius = open * 1.28;
    float mask = smoothstep(radius - 0.082, radius + 0.039, normDist);

    // Fully closed — dark preview everywhere (no center pinhole)
    if (open < 0.02) {
      vec3 closed = sampleOutside(uv) + starBurst(uv, open, cover);
      outputColor = vec4(closed, inputColor.a);
      return;
    }

    // Fade the white out as the iris finishes opening so it dissolves away
    // smoothly instead of brightening while it decelerates off-screen.
    float exitFade = 1.0 - smoothstep(${GLOW_FADE_START.toFixed(3)}, ${GLOW_FADE_END.toFixed(3)}, open);

    float ringWidth = 0.144;
    float ringInner = smoothstep(radius - ringWidth, radius, normDist);
    float ringOuter = 1.0 - smoothstep(radius, radius + ringWidth * 0.6, normDist);
    float ring = ringInner * ringOuter;

    float sparkle = hash(floor(uv * resolution / 1.5)) * ring;
    vec3 rimGlow = vec3(1.0, 0.96, 0.88) * ring * (1.2 + sparkle * 4.0) * open;

    // Wide soft bloom halo centered on the iris edge — the bright, intense glow.
    float halo = exp(-pow((normDist - radius) / ${GLOW_WIDTH.toFixed(3)}, 2.0));
    rimGlow += vec3(1.0, 0.96, 0.88) * halo * ${GLOW_INTENSITY.toFixed(3)} * open;

    vec2 rimOff = normalize(c + 0.0001) * texelSize * 2.5;
    vec3 insideRim = sampleInside(uv + rimOff);
    vec3 outsideRim = sampleOutside(uv - rimOff);
    rimGlow += mix(outsideRim, insideRim, 0.5) * ring * 0.35;

    rimGlow *= exitFade;

    vec3 inside = sampleInside(uv);
    vec3 outside = sampleOutside(uv);
    vec3 baseMix = mix(inside, outside, mask);

    vec3 stars = starBurst(uv, open, cover) * exitFade;
    vec3 outc = baseMix + stars + rimGlow;
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

    const { holdout, useHoldout, active } = useDissolveTransitionStore.getState();
    const uProgress = this.uniforms.get("uProgress");
    if (uProgress) uProgress.value = active ? getDissolveProgress() : 0;
    this.uUseHoldout.value = useHoldout ? 1 : 0;
    if (holdout) this.uHoldout.value = holdout;
  }
}

const DissolveTransition = wrapEffect(DissolveEffectImpl);

export default DissolveTransition;
