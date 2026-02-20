/**
 * Shared post-processing shaders.
 *
 * Canonical definitions of VignetteShader, GrainShader, and EdgeDistortionShader
 * used across the home, work, archive, and film pages.
 *
 * Each shader is exported as a factory function that returns a fresh object
 * (with its own uniform instances) so multiple ShaderPass users never share
 * mutable state.
 */

// ── Vignette ────────────────────────────────────────────────────────────────────

export function VignetteShader({
    darkness = 0.15,
    offset = 1.0,
} = {}) {
    return {
        name: 'VignetteShader',
        uniforms: {
            tDiffuse: { value: null },
            uDarkness: { value: darkness },
            uOffset: { value: offset },
        },
        vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
        fragmentShader: /* glsl */ `
      uniform sampler2D tDiffuse;
      uniform float uDarkness;
      uniform float uOffset;
      varying vec2 vUv;
      void main() {
        vec4 texel = texture2D(tDiffuse, vUv);
        vec2 uv = (vUv - 0.5) * 2.0;
        float vignette = 1.0 - dot(uv, uv) * uDarkness;
        vignette = smoothstep(0.0, uOffset, clamp(vignette, 0.0, 1.0));
        gl_FragColor = vec4(texel.rgb * vignette, texel.a);
      }
    `,
    };
}

// ── Film Grain ──────────────────────────────────────────────────────────────────

export function GrainShader({
    grain = 0.015,
} = {}) {
    return {
        name: 'GrainShader',
        uniforms: {
            tDiffuse: { value: null },
            uTime: { value: 0 },
            uGrain: { value: grain },
        },
        vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
        fragmentShader: /* glsl */ `
      uniform sampler2D tDiffuse;
      uniform float uTime;
      uniform float uGrain;
      varying vec2 vUv;

      float random(vec2 p) {
        vec2 k1 = vec2(
          23.14069263277926, // e^pi  (Gelfond's constant)
          2.665144142690225  // 2^sqrt(2) (Gelfond–Schneider constant)
        );
        return fract(cos(dot(p, k1)) * 12345.6789);
      }

      void main() {
        vec4 texel = texture2D(tDiffuse, vUv);
        vec2 uvRandom = vUv;
        uvRandom.y *= random(vec2(uvRandom.y, uTime));
        float grain = random(uvRandom);

        vec3 color = texel.rgb;
        color += (grain - 0.5) * uGrain;

        gl_FragColor = vec4(color, texel.a);
      }
    `,
    };
}

// ── Chromatic Edge Distortion ────────────────────────────────────────────────────

export function EdgeDistortionShader({
    shift = 0.0056,
    edgeStart = 0.2,
    edgeEnd = 0.75,
    preserveAlpha = false,
} = {}) {
    return {
        name: 'EdgeDistortionShader',
        uniforms: {
            tDiffuse: { value: null },
            uShift: { value: shift },
            uEdgeStart: { value: edgeStart },
            uEdgeEnd: { value: edgeEnd },
        },
        vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
        fragmentShader: /* glsl */ `
      uniform sampler2D tDiffuse;
      uniform float uShift;
      uniform float uEdgeStart;
      uniform float uEdgeEnd;
      varying vec2 vUv;

      void main() {
        vec2 uv = vUv;
        vec2 center = uv - 0.5;
        float dist = length(center);
        float edge = smoothstep(uEdgeStart, uEdgeEnd, dist);

        float shift = uShift * edge;
        vec4 r = texture2D(tDiffuse, uv + vec2(shift, 0.0));
        vec4 g = texture2D(tDiffuse, uv);
        vec4 b = texture2D(tDiffuse, uv - vec2(shift, 0.0));

        gl_FragColor = vec4(r.r, g.g, b.b, ${preserveAlpha ? 'g.a' : '1.0'});
      }
    `,
    };
}

// ── Shared post-FX uniform block ────────────────────────────────────────────────

export function createPostFXUniforms() {
    return {
        uTime: { value: 0 },
        uGrain: { value: 0.03 },
    };
}
