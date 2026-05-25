// @ts-nocheck
// workClothArc — sample anchor positions along a curved arc above the camera.
//
// The arc lies in the XY plane (height) curving back along Z so that pinned
// vertices form a smile-shape banner above the viewer. The cloth hangs from
// these pins under gravity.
//
// theta = lerp(-arcSpan/2, +arcSpan/2, u)
// x = sin(theta) * radius
// y = yOffset
// z = (cos(theta) - 1) * radius + depthOffset

export function computeArcAnchors({ count, radius, arcSpan, yOffset, depthOffset }) {
  const half = arcSpan / 2;
  return Array.from({ length: count }, (_, i) => {
    const u = count > 1 ? i / (count - 1) : 0.5;
    const theta = -half + u * arcSpan;
    const x = Math.sin(theta) * radius;
    const y = yOffset;
    const z = (Math.cos(theta) - 1) * radius + depthOffset;
    return [x, y, z];
  });
}

// Returns evenly-spaced column indices in [0..subdivX] used for pinning.
// pinCount=1 → middle. pinCount>=2 → endpoints + interior.
export function pickPinColumns(subdivX, pinCount) {
  const safePins = Math.max(1, Math.min(pinCount, subdivX + 1));
  if (safePins === 1) return [Math.floor(subdivX / 2)];
  return Array.from({ length: safePins }, (_, i) => Math.round((i / (safePins - 1)) * subdivX));
}
