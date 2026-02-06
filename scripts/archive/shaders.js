// Archive WebGL Shaders

// Shared vertex shader
export const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Background grid shader
export const gridFragmentShader = /* glsl */ `
  uniform vec2 uResolution;
  uniform float uGridSize;
  uniform float uTime;
  uniform float uMousePressed;
  uniform float uZoom;
  uniform float uDistortion;
  uniform vec2 uOffset;
  uniform float uLineThickness;
  uniform float uFocusState;
  uniform vec2 uMouseParallax;

  varying vec2 vUv;

  void main() {
    vec2 screenUV = (vUv - 0.5) * 2.0;

    // Apply zoom
    screenUV /= uZoom;

    // Fisheye distortion - flattens when mouse is pressed
    float radius = length(screenUV);
    float effectiveDistortion = mix(uDistortion, 0.0, uMousePressed);
    float distortion = 1.0 - effectiveDistortion * radius * radius;
    vec2 distortedUV = screenUV * distortion;

    vec2 aspectRatio = vec2(uResolution.x / uResolution.y, 1.0);

    // Apply subtle parallax to grid (disabled when focused)
    vec2 parallaxOffset = uMouseParallax * 0.5 * (1.0 - uFocusState);

    // Grid moves with offset (infinite scrolling)
    vec2 gridCoord = (distortedUV * aspectRatio + uOffset + parallaxOffset) / uGridSize;
    vec2 gridCell = fract(gridCoord);

    // Line thickness
    float lineWidth = uLineThickness;

    // Calculate distance to nearest grid line
    float distX = min(gridCell.x, 1.0 - gridCell.x);
    float distY = min(gridCell.y, 1.0 - gridCell.y);

    // Draw lines
    float lines = step(lineWidth, distX) * step(lineWidth, distY);
    float gridLine = 1.0 - lines;

    // 50% grey color, dim when focused
    vec3 gridColor = vec3(0.5);
    float opacity = gridLine * 0.5 * mix(1.0, 0.15, uFocusState);

    gl_FragColor = vec4(gridColor, opacity);
  }
`;

// Image gallery shader - requires textureCount to be passed for array size
export function createImageFragmentShader(textureCount) {
  return /* glsl */ `
    uniform vec2 uResolution;
    uniform float uDistortion;
    uniform float uTime;
    uniform sampler2D uImageAtlas;
    uniform float uTextureCount;
    uniform vec2 uOffset;
    uniform float uCellSize;
    uniform float uCellSpacing;
    uniform float uFocusIndex;
    uniform vec2 uFocusCell;
    uniform float uFocusState;
    uniform float uMousePressed;
    uniform float uZoom;
    uniform vec2 uMouseParallax;
    uniform float uAspectRatios[${textureCount}];

    varying vec2 vUv;

    // Random function for pseudo-random placement
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    void main() {
      vec2 screenUV = (vUv - 0.5) * 2.0;

      // Apply zoom (includes focus zoom for centering)
      screenUV /= uZoom;

      // Fisheye distortion - flattens when mouse is pressed
      float radius = length(screenUV);
      float effectiveDistortion = mix(uDistortion, 0.0, uMousePressed);
      float distortion = 1.0 - effectiveDistortion * radius * radius;
      vec2 distortedUV = screenUV * distortion;

      vec2 aspectRatio = vec2(uResolution.x / uResolution.y, 1.0);

      // Use larger grid cells for looser spacing
      float gridCellSize = uCellSize * uCellSpacing;

      // Pre-cell for depth-based parallax
      vec2 preCellPos = (distortedUV * aspectRatio + uOffset) / gridCellSize;
      vec2 cellId = floor(preCellPos);
      float depth = mix(0.6, 1.4, random(cellId + vec2(500.0, 0.0)));

      // Depth-based parallax (disabled when focused)
      vec2 parallaxOffset = uMouseParallax * depth * (1.0 - uFocusState);
      vec2 worldCoord = (distortedUV * aspectRatio) + uOffset + parallaxOffset;

      vec2 cellPos = worldCoord / gridCellSize;
      cellId = floor(cellPos);
      vec2 cellUV = fract(cellPos);

      float texIndex = mod(cellId.x + cellId.y * 3.0, uTextureCount);
      if (texIndex < 0.0) texIndex += uTextureCount;

      // Focus is cell-specific so only the clicked cell highlights
      bool isFocused = (abs(cellId.x - uFocusCell.x) < 0.1) && (abs(cellId.y - uFocusCell.y) < 0.1);

      vec3 color = vec3(0.0);
      float outAlpha = 0.0;

      // Slight variance in size, plus subtle depth scaling
      float sizeRand = random(cellId + vec2(200.0, 0.0));
      float baseImageSize = 0.62 + sizeRand * 0.12;
      float depthScale = mix(0.92, 1.08, clamp((depth - 0.6) / 0.8, 0.0, 1.0));
      baseImageSize *= depthScale;
      float targetImageSize = isFocused ? 0.90 : baseImageSize;
      float imageSize = mix(baseImageSize, targetImageSize, uFocusState);

      float imageBorder = (1.0 - imageSize) * 0.5;
      vec2 imageUV = (cellUV - imageBorder) / imageSize;

      // Object-fit cover using aspect ratio
      float naturalAspect = uAspectRatios[int(texIndex)];
      if (naturalAspect > 1.0) {
        imageUV.x = (imageUV.x - 0.5) * naturalAspect + 0.5;
      } else {
        imageUV.y = (imageUV.y - 0.5) / naturalAspect + 0.5;
      }

      float edgeSmooth = 0.02;
      vec2 imageMask = smoothstep(-edgeSmooth, edgeSmooth, imageUV) *
                      smoothstep(-edgeSmooth, edgeSmooth, 1.0 - imageUV);
      float imageAlpha = imageMask.x * imageMask.y;

      bool inImageArea = imageUV.x >= 0.0 && imageUV.x <= 1.0 && imageUV.y >= 0.0 && imageUV.y <= 1.0;

      if (inImageArea && imageAlpha > 0.0) {
        float atlasSize = ceil(sqrt(uTextureCount));
        vec2 atlasPos = vec2(mod(texIndex, atlasSize), floor(texIndex / atlasSize));

        // Chromatic Aberration - increases at edges of viewport
        float caStrength = 0.012 * pow(radius, 2.0);
        vec2 caOffset = screenUV * caStrength;

        vec2 imageUVR = imageUV - caOffset;
        vec2 atlasUVR = (atlasPos + clamp(imageUVR, 0.0, 1.0)) / atlasSize;
        atlasUVR.y = 1.0 - atlasUVR.y;

        vec2 imageUVG = imageUV;
        vec2 atlasUVG = (atlasPos + imageUVG) / atlasSize;
        atlasUVG.y = 1.0 - atlasUVG.y;

        vec2 imageUVB = imageUV + caOffset;
        vec2 atlasUVB = (atlasPos + clamp(imageUVB, 0.0, 1.0)) / atlasSize;
        atlasUVB.y = 1.0 - atlasUVB.y;

        float r = texture2D(uImageAtlas, atlasUVR).r;
        float g = texture2D(uImageAtlas, atlasUVG).g;
        float b = texture2D(uImageAtlas, atlasUVB).b;
        float a = texture2D(uImageAtlas, atlasUVG).a;

        vec3 finalImageColor = vec3(r, g, b);

        // Darken non-focused images during focus
        if (!isFocused) {
          finalImageColor *= mix(1.0, 0.15, uFocusState);
        }

        color = finalImageColor;
        outAlpha = imageAlpha * a;
      }

      // Vignette fade at edges
      float fade = 1.0 - smoothstep(1.0, 1.6, radius);

      outAlpha *= fade;

      gl_FragColor = vec4(color * fade, outAlpha);
    }
  `;
}
