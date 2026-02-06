// Archive configuration constants
export const CONFIG = {
  // Grid layout
  cellSize: 0.85,
  cellSpacing: 1.2,
  gridSize: 0.15,
  lineThickness: 0.01,

  // Visual effects
  distortion: 0.08,
  lerpFactor: 0.08,

  // Depth layers for parallax
  depthMin: 0.6,
  depthMax: 1.4,

  // Image sizing
  imageSizeMin: 0.62,
  imageSizeMax: 0.74,
  imageSizeFocused: 0.90,
  depthScaleMin: 0.92,
  depthScaleMax: 1.08,

  // Interaction thresholds
  clickThreshold: 15, // px - max drag distance for click
  clickTimeout: 250, // ms - max time for click
  dragExitThreshold: 50, // px - drag distance to exit focus
  dragZoomMax: 0.2, // zoom out amount at max drag
  dragZoomDistance: 200, // px - distance for max zoom out

  // Animation durations (seconds)
  focusEnterDuration: 0.5,
  focusExitDuration: 0.4,
  mousePressedDuration: 0.3,
  dragZoomDuration: 0.3,

  // CRT post-processing (locked artistic values)
  crt: {
    scanlineIntensity: 0.46,
    scanlineCount: 663.0,
    brightness: 1.32,
    contrast: 1.06,
    saturation: 1.20,
    bloomIntensity: 0.23,
    bloomThreshold: 0.35,
    rgbShift: 0.0,
    adaptiveIntensity: 1.0,
    vignetteStrength: 0.0,
    curvature: 0.65,
    flickerStrength: 0.0,
  },
};
