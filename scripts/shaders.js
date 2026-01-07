export const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fragmentShader = `
  uniform vec2 uOffset;
  uniform vec2 uResolution;
  uniform vec4 uBorderColor;
  uniform vec4 uHoverColor;
  uniform vec4 uBackgroundColor;
  uniform vec2 uMousePos;
  uniform float uZoom;
  uniform float uCellSize;
  uniform float uTextureCount;
  uniform float uDistortion;
  uniform float uTime;
  uniform float uFocusState;
  uniform float uFocusIndex;
  uniform float uJitterAmount;
  uniform float uMaxRotation;
  uniform float uScaleVariance;
  uniform float uEmptyProbability;
  uniform sampler2D uImageAtlas;
  varying vec2 vUv;

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  vec2 rotateAround(vec2 uv, vec2 center, float angle) {
    float s = sin(angle);
    float c = cos(angle);
    uv -= center;
    mat2 m = mat2(c, -s, s, c);
    uv = m * uv;
    uv += center;
    return uv;
  }
  
  void main() {
    vec2 screenUV = (vUv - 0.5) * 2.0;
    
    float radius = length(screenUV);
    float distortion = 1.0 - uDistortion * radius * radius;
    vec2 distortedUV = screenUV * distortion;
    
    vec2 aspectRatio = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 worldCoord = distortedUV * aspectRatio;
    
    worldCoord *= uZoom;
    worldCoord += uOffset;
    
    vec2 cellPos = worldCoord / uCellSize;
    vec2 cellId = floor(cellPos);
    vec2 cellUV = fract(cellPos);
    
    float texIndex = mod(cellId.x + cellId.y * 3.0, uTextureCount);
    if (texIndex < 0.0) texIndex += uTextureCount;
    texIndex = floor(texIndex);

    bool isFocused = abs(texIndex - uFocusIndex) < 0.1;

    vec2 mouseScreenUV = (uMousePos / uResolution) * 2.0 - 1.0;
    mouseScreenUV.y = -mouseScreenUV.y;
    
    float mouseRadius = length(mouseScreenUV);
    float mouseDistortion = 1.0 - uDistortion * mouseRadius * mouseRadius;
    vec2 mouseDistortedUV = mouseScreenUV * mouseDistortion;
    vec2 mouseWorldCoord = mouseDistortedUV * aspectRatio;
    
    mouseWorldCoord *= uZoom;
    mouseWorldCoord += uOffset;
    
    vec2 mouseCellPos = mouseWorldCoord / uCellSize;
    vec2 mouseCellId = floor(mouseCellPos);
    
    vec2 cellCenter = cellId + 0.5;
    vec2 mouseCellCenter = mouseCellId + 0.5;
    float cellDistance = length(cellCenter - mouseCellCenter);
    float hoverIntensity = 1.0 - smoothstep(0.4, 0.7, cellDistance);
    bool isHovered = hoverIntensity > 0.0 && uMousePos.x >= 0.0;
    
    vec3 color = vec3(0.0);
    float outAlpha = 0.0;
    
    // Playful per-cell variations
    float rSize = random(cellId + 13.37);
    float rRot = random(cellId + 27.91);
    vec2 rJitter = vec2(random(cellId + 7.77), random(cellId + 19.19));

    // Optionally leave some cells empty for negative space
    float rEmpty = random(cellId + 42.42);
    bool isEmptyCell = rEmpty < uEmptyProbability;
    
    float baseImageSize = mix(0.50, 0.80, rSize * uScaleVariance + (1.0 - uScaleVariance) * 0.5);
    float targetImageSize = isFocused ? 0.96 : baseImageSize * 0.85;
    float imageSize = mix(baseImageSize, targetImageSize, uFocusState);
    
    float imageBorder = (1.0 - imageSize) * 0.5;

    // Jitter position and rotate slightly for a playful layout
    vec2 jitter = (rJitter - 0.5) * uJitterAmount;
    vec2 imagePos = cellUV + jitter;
    vec2 imageUV = (imagePos - imageBorder) / imageSize;
    float angle = (rRot - 0.5) * uMaxRotation;
    imageUV = rotateAround(imageUV, vec2(0.5), angle);

    float edgeSmooth = 0.01;
    vec2 imageMask = smoothstep(-edgeSmooth, edgeSmooth, imageUV) * 
                    smoothstep(-edgeSmooth, edgeSmooth, 1.0 - imageUV);
    float imageAlpha = imageMask.x * imageMask.y;
    
    bool inImageArea = imageUV.x >= 0.0 && imageUV.x <= 1.0 && imageUV.y >= 0.0 && imageUV.y <= 1.0;
    
    if (!isEmptyCell && inImageArea && imageAlpha > 0.0) {
      float atlasSize = ceil(sqrt(uTextureCount));
      vec2 atlasPos = vec2(mod(texIndex, atlasSize), floor(texIndex / atlasSize));
      
      // Chromatic Aberration
      float caStrength = 0.02 * radius; 
      vec2 caOffset = screenUV * caStrength; 

      // R
      vec2 imageUVR = imageUV - caOffset;
      vec2 atlasUVR = (atlasPos + imageUVR) / atlasSize;
      atlasUVR.y = 1.0 - atlasUVR.y;
      
      // G
      vec2 imageUVG = imageUV;
      vec2 atlasUVG = (atlasPos + imageUVG) / atlasSize;
      atlasUVG.y = 1.0 - atlasUVG.y;
      
      // B
      vec2 imageUVB = imageUV + caOffset;
      vec2 atlasUVB = (atlasPos + imageUVB) / atlasSize;
      atlasUVB.y = 1.0 - atlasUVB.y;

      float r = texture2D(uImageAtlas, atlasUVR).r;
      float g = texture2D(uImageAtlas, atlasUVG).g;
      float b = texture2D(uImageAtlas, atlasUVB).b;
      float a = texture2D(uImageAtlas, atlasUVG).a;

      vec3 finalImageColor = vec3(r, g, b);
      
      // Darken non-focused images
      if (!isFocused) {
          finalImageColor *= mix(1.0, 0.1, uFocusState);
      }

      color = finalImageColor;
      outAlpha = imageAlpha * a;
    }
    
    float fade = 1.0 - smoothstep(1.2, 1.8, radius);

    outAlpha *= fade;
    gl_FragColor = vec4(color * fade, outAlpha);
  }
`;
