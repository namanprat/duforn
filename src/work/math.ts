function positiveModulo(value: number, modulus: number) {
  return ((value % modulus) + modulus) % modulus;
}

function getWrappedItemIndex(slotIndex: number, itemCount: number) {
  return positiveModulo(slotIndex, itemCount);
}

function getStripSlotMetrics(visibleItems: number, gapSize: number) {
  const slotWidth = 1;
  const slotPitch = slotWidth + gapSize;
  const trackWidth = visibleItems * slotPitch;
  return { slotWidth, slotPitch, trackWidth, halfGap: gapSize * 0.5 };
}

export function resolveVisibleSlotAtUv(
  uvX: number,
  scroll: number,
  visibleItems: number,
  gapSize: number,
  itemCount: number,
) {
  const { slotPitch, trackWidth } = getStripSlotMetrics(visibleItems, gapSize);
  const trackCoord = uvX * trackWidth + scroll;
  const slotIndex = Math.floor(trackCoord / slotPitch);
  const localCoord = trackCoord - slotIndex * slotPitch;
  if (localCoord < 0 || localCoord > 1) return null;
  return { slotIndex, localCoord, itemIndex: getWrappedItemIndex(slotIndex, itemCount) };
}

export function getActiveStripItemIndex(
  scroll: number,
  visibleItems: number,
  gapSize: number,
  itemCount: number,
) {
  const { slotPitch, trackWidth } = getStripSlotMetrics(visibleItems, gapSize);
  const centerCoord = scroll + trackWidth * 0.5;
  const centeredSlot = Math.round(centerCoord / slotPitch - 0.5);
  return getWrappedItemIndex(centeredSlot, itemCount);
}
