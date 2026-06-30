import { Uniform } from "three";
import { Effect } from "postprocessing";
import { wrapEffect } from "@react-three/postprocessing";
import { useDissolveTransitionStore } from "../../store/routeTransition";

/**
 * Live, single-pass center-pierce dissolve. Runs inside the one scene EffectComposer,
 * so it operates on the LIVE rendered frame (`inputBuffer`) — no canvas snapshots, no
 * second renderer, one WebGL context.
 *
 * Driven by `uProgress` = COVER (0 = clean, 1 = fully stylized). A radial disk of the
 * clean live frame is revealed from the centre; everything OUTSIDE the disk is the
 * stylized field (grayscale + Sobel edge-glow) with a bright sparkle front at the
 * boundary. So the destination "pierces through from the centre" and only the edges
 * glow — never a full-frame desaturation. Ported from the reference
 * `shopify-main/src/main.js` `coverFragmentShader`.
 *
 * Direction (open on enter / close on leave) is handled entirely by how the store
 * tweens cover (see routeTransition.ts) — the shader is symmetric.
 *
 * `resolution`, `texelSize`, `aspect`, and `inputBuffer` are provided by the
 * postprocessing EffectPass.
 */
const fragmentShader = /* glsl */ `
  uniform float uProgress;

  float getLuminance(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

  // 3x3 Sobel over the live frame.
  float sobelEdge(vec2 uvc, vec2 ts) {
    mat3 gxK = mat3(-1.0, 0.0, 1.0, -2.0, 0.0, 2.0, -1.0, 0.0, 1.0);
    mat3 gyK = mat3(-1.0, -2.0, -1.0, 0.0, 0.0, 0.0, 1.0, 2.0, 1.0);
    float gx = 0.0;
    float gy = 0.0;
    for (int i = -1; i <= 1; i++) {
      for (int j = -1; j <= 1; j++) {
        float lum = getLuminance(texture(inputBuffer, uvc + vec2(float(i), float(j)) * ts).rgb);
        gx += lum * gxK[i + 1][j + 1];
        gy += lum * gyK[i + 1][j + 1];
      }
    }
    return sqrt(gx * gx + gy * gy);
  }

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

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    float cover = clamp(uProgress, 0.0, 1.0);
    if (cover <= 0.0) { outputColor = inputColor; return; }

    vec3 col = inputColor.rgb;

    // Radial coordinate from centre with block + angular fbm noise → an organic,
    // non-circular dissolve front.
    vec2 c = uv - 0.5;
    c.x *= aspect;
    float dist = length(c);
    float angle = atan(c.y, c.x);
    float blockNoise = fbm(floor(uv * resolution / 6.0) * 6.0 / resolution * 100.0) * 0.15;
    float angularNoise = fbm(vec2(angle * 5.0, 0.0)) * 0.15;
    float maxDist = length(vec2(aspect * 0.5, 0.5));
    float normDist = (dist + blockNoise + angularNoise) / maxDist;

    // cover 0 → threshold high → clean everywhere; cover 1 → threshold 0 → all stylized.
    float threshold = (1.0 - cover) * 1.5;

    // mask: 0 INSIDE the clean disk, 1 OUTSIDE (the stylized field). The clean disk of
    // the live destination grows from the centre as cover falls toward 0.
    float mask = smoothstep(threshold - 0.03, threshold, normDist);

    // Stylized field: grayscale + bright Sobel edge glow (edges only — never the disk).
    float gray = getLuminance(col);
    float edge = clamp(pow(sobelEdge(uv, texelSize), 0.7) * 2.0, 0.0, 1.0);
    vec3 stylized = mix(col, vec3(gray), 0.85) + vec3(1.0) * edge * 0.8;

    // Sparkle ring riding the dissolve front; fades as the field clears (cover → 0).
    float ringWidth = 0.06;
    float ring = smoothstep(threshold - ringWidth, threshold, normDist) *
                 smoothstep(threshold + ringWidth, threshold, normDist);
    float sparkle = hash(floor(uv * resolution / 4.0)) * ring;
    vec3 frontGlow = vec3(sparkle * 2.5 * cover);

    vec3 outc = mix(col, stylized, mask) + frontGlow;
    outputColor = vec4(outc, inputColor.a);
  }
`;

class DissolveEffectImpl extends Effect {
  constructor() {
    super("DissolveTransition", fragmentShader, {
      uniforms: new Map([["uProgress", new Uniform(0)]]),
    });
  }

  // Called by the EffectPass every frame — pull live progress from the store.
  update() {
    const u = this.uniforms.get("uProgress");
    if (u) u.value = useDissolveTransitionStore.getState().progress;
  }
}

// wrapEffect already returns a forwardRef component ready to drop into EffectComposer.
const DissolveTransition = wrapEffect(DissolveEffectImpl);

export default DissolveTransition;
