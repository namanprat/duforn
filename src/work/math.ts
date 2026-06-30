function positiveModulo(value: number, modulus: number) {
  return ((value % modulus) + modulus) % modulus;
}

function getWrappedItemIndex(slotIndex: number, itemCount: number) {
  return positiveModulo(slotIndex, itemCount);
}

export function resolveVisibleSlotAtUv(
  uvX: number,
  scroll: number,
  visibleItems: number,
  gapSize: number,
  itemCount: number,
) {
  // ponytail: scroll units match fragment shader totalU = uvX * visibleItems + scroll
  const totalU = uvX * visibleItems + scroll;
  const slotIndex = Math.floor(totalU);
  const fract = totalU - slotIndex;
  const halfGap = gapSize * 0.5;
  if (fract < halfGap || fract > 1.0 - halfGap) return null;
  return { slotIndex, localCoord: fract, itemIndex: getWrappedItemIndex(slotIndex, itemCount) };
}

export function getActiveStripItemIndex(
  scroll: number,
  visibleItems: number,
  _gapSize: number,
  itemCount: number,
) {
  const centeredSlot = Math.round(scroll + visibleItems * 0.5 - 0.5);
  return getWrappedItemIndex(centeredSlot, itemCount);
}

// Inverse of getActiveStripItemIndex: the scroll that centers an absolute slot.
export function getScrollToCenterSlot(slotIndex: number, visibleItems: number) {
  return slotIndex - visibleItems * 0.5 + 0.5;
}

// ponytail: self-check — fails in devtools if center slot drifts from shader uv=0.5.
(() => {
  for (const scroll of [0, 1, -1]) {
    const center = getActiveStripItemIndex(scroll, 7, 0.04, 6);
    const hit = resolveVisibleSlotAtUv(0.5, scroll, 7, 0.04, 6);
    console.assert(hit?.itemIndex === center, "work strip center slot at uv=0.5");
  }
  for (const slot of [0, 3, 8]) {
    const roundTrip = getActiveStripItemIndex(getScrollToCenterSlot(slot, 7), 7, 0.04, 6);
    console.assert(roundTrip === ((slot % 6) + 6) % 6, "work strip center slot round-trip");
  }
})();
