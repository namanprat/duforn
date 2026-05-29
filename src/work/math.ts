// @ts-nocheck
function positiveModulo(value, modulus) {
  return ((value % modulus) + modulus) % modulus;
}

function getWrappedItemIndex(slotIndex, itemCount) {
  return positiveModulo(slotIndex, itemCount);
}

function getStripSlotMetrics(visibleItems, gapSize) {
  const slotWidth = 1;
  const slotPitch = slotWidth + gapSize;
  const trackWidth = visibleItems * slotPitch;

  return {
    slotWidth,
    slotPitch,
    trackWidth,
    halfGap: gapSize * 0.5,
  };
}

export function resolveVisibleSlotAtUv(uvX, scroll, visibleItems, gapSize, itemCount) {
  const { slotPitch, trackWidth } = getStripSlotMetrics(visibleItems, gapSize);
  const trackCoord = uvX * trackWidth + scroll;
  const slotIndex = Math.floor(trackCoord / slotPitch);
  const localCoord = trackCoord - slotIndex * slotPitch;

  if (localCoord < 0 || localCoord > 1) {
    return null;
  }

  return {
    slotIndex,
    localCoord,
    itemIndex: getWrappedItemIndex(slotIndex, itemCount),
  };
}

export function getActiveStripItemIndex(scroll, visibleItems, gapSize, itemCount) {
  const { slotPitch, trackWidth } = getStripSlotMetrics(visibleItems, gapSize);
  const centerCoord = scroll + trackWidth * 0.5;
  const centeredSlot = Math.round(centerCoord / slotPitch - 0.5);
  return getWrappedItemIndex(centeredSlot, itemCount);
}
