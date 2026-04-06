import {
  DEFAULT_GAP_SIZE,
  DEFAULT_VISIBLE_ITEMS,
  DRAG_SENSITIVITY,
  DRAG_VELOCITY_SCALE,
  SCROLL_DAMPING,
  SCROLL_DAMPING_DRAG,
  SCROLL_LERP,
  SNAP_EPSILON,
  SNAP_LERP,
  SNAP_VELOCITY_THRESHOLD,
  WHEEL_SENSITIVITY,
} from "./workStripConfig.js";
import { getStripSlotMetrics } from "./workStripMath.js";

export function createScrollState() {
  return {
    current: 0,
    target: 0,
    velocity: 0,
  };
}

export function applyWheelToScroll(state, delta, sensitivity = WHEEL_SENSITIVITY) {
  state.target += delta * sensitivity;
  state.velocity += delta * sensitivity * 0.24;
}

export function applyDragDeltaToScroll(
  state,
  deltaX,
  sensitivity = DRAG_SENSITIVITY,
  velocityScale = DRAG_VELOCITY_SCALE,
) {
  state.target -= deltaX * sensitivity;
  state.velocity = -deltaX * velocityScale;
}

export function stepScrollState(
  state,
  {
    isDragging = false,
    visibleItems = DEFAULT_VISIBLE_ITEMS,
    gapSize = DEFAULT_GAP_SIZE,
    lerp = SCROLL_LERP,
    damping = SCROLL_DAMPING,
    draggingDamping = SCROLL_DAMPING_DRAG,
    snapVelocityThreshold = SNAP_VELOCITY_THRESHOLD,
    snapLerp = SNAP_LERP,
    snapEpsilon = SNAP_EPSILON,
  } = {},
) {
  const { slotPitch } = getStripSlotMetrics(visibleItems, gapSize);

  if (!isDragging) {
    state.target += state.velocity;
    state.velocity *= damping;

    if (Math.abs(state.velocity) < snapVelocityThreshold) {
      const nearestSlot = Math.round(state.target / slotPitch);
      const snappedTarget = nearestSlot * slotPitch;
      state.target += (snappedTarget - state.target) * snapLerp;

      if (Math.abs(snappedTarget - state.target) < snapEpsilon) {
        state.target = snappedTarget;
        state.velocity = 0;
      }
    }
  } else {
    state.velocity *= draggingDamping;
  }

  state.current += (state.target - state.current) * lerp;
}
