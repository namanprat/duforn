/**
 * ASCII post-processing shader.
 *
 * Converts a rendered scene into ASCII characters by sampling brightness
 * per cell and mapping to a character ramp. Output is green-on-black
 * for vintage terminal aesthetic.
 *
 * Uses a pre-rendered font atlas texture for the ASCII characters.
 */

import * as THREE from "three";

// ── Character ramp (dark → light) ──────────────────────────────────────────────

const ASCII_CHARS = " .:-=+*#%@";

// ── Font atlas generator ───────────────────────────────────────────────────────

/**
 * Renders all ASCII_CHARS into a horizontal strip texture.
 * Each character occupies one cell of `cellSize × cellSize` pixels.
 */
function createASCIIAtlas(cellSize = 16, fontFamily = "monospace") {
  const charCount = ASCII_CHARS.length;
  const canvas = document.createElement("canvas");
  canvas.width = cellSize * charCount;
  canvas.height = cellSize;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${Math.floor(cellSize * 0.85)}px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let i = 0; i < charCount; i++) {
    ctx.fillText(ASCII_CHARS[i], i * cellSize + cellSize / 2, cellSize / 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.needsUpdate = true;

  return { texture, charCount };
}

// ── ASCII Shader ───────────────────────────────────────────────────────────────

export function ASCIIShader({
  cellSize = 8,
  color = new THREE.Color(0x00ff41),
  fontFamily = "monospace",
} = {}) {
  const { texture: asciiAtlas, charCount } = createASCIIAtlas(cellSize * 2, fontFamily);

  return {
    name: "ASCIIShader",
    uniforms: {
      tDiffuse: { value: null },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uCellSize: { value: cellSize },
      uCharCount: { value: charCount },
      uASCIIAtlas: { value: asciiAtlas },
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
      uniform float uCellSize;
      uniform float uCharCount;
      uniform sampler2D uASCIIAtlas;
      uniform vec3 uColor;

      varying vec2 vUv;

      void main() {
        // Calculate cell coordinates
        vec2 pixelCoord = vUv * uResolution;
        vec2 cellCoord = floor(pixelCoord / uCellSize);
        vec2 cellCenter = (cellCoord + 0.5) * uCellSize / uResolution;

        // Sample the original scene at the cell center
        vec4 sceneColor = texture2D(tDiffuse, cellCenter);

        // Calculate luminance
        float lum = dot(sceneColor.rgb, vec3(0.299, 0.587, 0.114));

        // Map luminance to character index
        float charIndex = floor(lum * (uCharCount - 1.0) + 0.5);
        charIndex = clamp(charIndex, 0.0, uCharCount - 1.0);

        // Sample from the ASCII atlas
        vec2 localUV = fract(pixelCoord / uCellSize);
        float atlasX = (charIndex + localUV.x) / uCharCount;
        float atlasY = localUV.y;
        float charSample = texture2D(uASCIIAtlas, vec2(atlasX, atlasY)).r;

        // Output: green character on black background
        // Modulate brightness by original luminance for depth
        float intensity = charSample * (0.5 + lum * 0.5);
        vec3 finalColor = uColor * intensity;

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
  };
}
