/**
 * Halftone Glitch Shader
 *
 * Adapted from "deadly_halftones" by Julien Vergnaud
 * https://www.shadertoy.com/view/MstXzs
 * License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
 */

import * as THREE from "three";

export function HalftoneGlitchShader({ color = new THREE.Color("#00ff41") } = {}) {
  return {
    name: "HalftoneGlitchShader",
    uniforms: {
      tDiffuse: { value: null },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uColor: { value: color },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      precision highp float;

      uniform sampler2D tDiffuse;
      uniform vec2 uResolution;
      uniform float uTime;
      uniform vec3 uColor;

      varying vec2 vUv;

      // Dave Hoskins hash2
      float hash2(vec2 p) {  
          vec3 p3  = fract(vec3(p.xyx) * 0.2831);
          p3 += dot(p3, p3.yzx + 19.19);
          return fract((p3.x + p3.y) * p3.z);
      }

      float get_cel_size() {
          float slices = floor(uResolution.y / 320.0);
          if(slices < 1.0) return 4.0;
          if(slices == 1.0) return 6.0;
          if(slices == 2.0) return 8.0;
          if(slices >= 3.0) return 10.0;
          return 12.0;
      }

      float make_dot(vec2 uv, float r, float c) {  
         return smoothstep(r - 0.1, r, min(length((uv - vec2(c / 2.0)) * 2.0), r));   
      }

      vec4 get_pass1_color(vec2 uv) {
          float CEL = get_cel_size();
          vec2 R = uResolution;
          vec2 U = uv * R;
          vec2 V = 1.0 - 2.0 * uv;
          float amp = 0.0; // Assume no sound
          
          vec2 off = vec2(smoothstep(0.0, amp * CEL * 0.5, cos(uTime + uv.y * 5.0)), 0.0) - vec2(0.5, 0.0);
          
          float r = texture2D(tDiffuse, uv + 0.03 * off).r;
          float g = texture2D(tDiffuse, uv + 0.04 * off).g;
          float b = texture2D(tDiffuse, uv + 0.05 * off).b;
          
          vec4 C = vec4(0.0, 0.1, 0.2, 1.0);
          C += 0.06 * hash2(uTime + V * vec2(1462.439, 297.185)); // animated grain
          C += vec4(r, g, b, 0.0);
          C *= 1.25 * vec4(1.0 - smoothstep(0.1, 1.8, length(V * V))); // vignetting
          
          U = mod(U, CEL);
          C *= 0.4 + sign(smoothstep(0.99, 1.0, U.y));
          C += 0.14 * vec4(pow(max(0.0, 1.0 - length(V * vec2(0.5, 0.35))), 3.0), 0.0, 0.0, 1.0);
          
          return C;
      }

      void main() {
          vec2 R = uResolution;
          vec2 U = vUv * R;
          float CEL = get_cel_size();

          // Calculate cell brightness from Pass 1 output
          vec2 cellCenterU = ceil(U / CEL) * CEL;
          vec2 cellCenterUV = cellCenterU / R;
          
          vec4 tex_col = get_pass1_color(cellCenterUV);
          float pixel_color = 0.45 * (tex_col.r + tex_col.g + tex_col.b);
          float dot_radius = pixel_color;
          
          // Make dots
          vec2 localU = mod(U, CEL);
          float dot_val = make_dot(localU, ceil(dot_radius * CEL), CEL);
          
          float dot_intensity = 1.0 - dot_val;
          
          // Colorize with brand color
          vec3 finalColor = uColor * dot_intensity;

          gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
  };
}
