const noop = () => {};

const bridgeState = {
  api: null,
  snapshot: {
    scrollTarget: 0,
    scrollCurrent: 0,
    revealProgress: 1,
    transition: {
      flatten: 0,
      selectedIndex: -1,
      nonSelectedFade: 0,
      focusSlot: -1,
      isolateSlot: 0,
      transitionOpacity: 1,
      transitionMode: 'idle',
      physicsBlend: 1,
      interactionEnabled: true,
    },
    groupTransform: {
      position: [0, 0, -1.5],
      scale: [0.35, 0.35, 0.35],
      rotationZ: 0,
    },
    cameraPose: null,
    visible: true,
    windStrength: 0,
    itemsOnStrip: 11,
    numUnique: 6,
    gapSize: 0.03,
    arcSpan: 3.5,
    axis: 'horizontal',
  },
  itemClickHandlers: new Set(),
  readyHandlers: new Set(),
};

function applySnapshot(api) {
  if (!api) return;
  const { snapshot } = bridgeState;
  api.setScrollTarget?.(snapshot.scrollTarget);
  api.setScrollCurrent?.(snapshot.scrollCurrent);
  api.setRevealProgress?.(snapshot.revealProgress);
  api.setTransitionState?.(snapshot.transition);
  api.setGroupTransform?.(snapshot.groupTransform);
  api.setCameraPose?.(snapshot.cameraPose);
  api.setVisible?.(snapshot.visible);
  api.setWindStrength?.(snapshot.windStrength);
  api.setStripMetrics?.({
    itemsOnStrip: snapshot.itemsOnStrip,
    numUnique: snapshot.numUnique,
    gapSize: snapshot.gapSize,
    arcSpan: snapshot.arcSpan,
    axis: snapshot.axis,
  });
}

export function getWorkStripBridge() {
  return {
    register(api) {
      bridgeState.api = api;
      applySnapshot(api);
      bridgeState.readyHandlers.forEach((handler) => handler(api));
    },

    unregister(api) {
      if (bridgeState.api === api) {
        bridgeState.api = null;
      }
    },

    isReady() {
      return Boolean(bridgeState.api);
    },

    onReady(handler) {
      if (bridgeState.api) {
        handler(bridgeState.api);
        return noop;
      }
      bridgeState.readyHandlers.add(handler);
      return () => bridgeState.readyHandlers.delete(handler);
    },

    onItemClick(handler) {
      bridgeState.itemClickHandlers.add(handler);
      return () => bridgeState.itemClickHandlers.delete(handler);
    },

    emitItemClick(payload) {
      bridgeState.itemClickHandlers.forEach((handler) => {
        try {
          handler(payload);
        } catch (error) {
          console.error('[work-strip-bridge] item click handler failed', error);
        }
      });
    },

    setScrollTarget(value) {
      bridgeState.snapshot.scrollTarget = value;
      bridgeState.api?.setScrollTarget?.(value);
    },

    setScrollCurrent(value) {
      bridgeState.snapshot.scrollCurrent = value;
      bridgeState.api?.setScrollCurrent?.(value);
    },

    setRevealProgress(value) {
      bridgeState.snapshot.revealProgress = value;
      bridgeState.api?.setRevealProgress?.(value);
    },

    setTransitionState(next) {
      bridgeState.snapshot.transition = {
        ...bridgeState.snapshot.transition,
        ...next,
      };
      bridgeState.api?.setTransitionState?.(bridgeState.snapshot.transition);
    },

    setGroupTransform(next) {
      bridgeState.snapshot.groupTransform = {
        ...bridgeState.snapshot.groupTransform,
        ...next,
      };
      bridgeState.api?.setGroupTransform?.(bridgeState.snapshot.groupTransform);
    },

    setVisible(value) {
      bridgeState.snapshot.visible = Boolean(value);
      bridgeState.api?.setVisible?.(bridgeState.snapshot.visible);
    },

    setCameraPose(value) {
      bridgeState.snapshot.cameraPose = value;
      bridgeState.api?.setCameraPose?.(value);
    },

    setWindStrength(value) {
      bridgeState.snapshot.windStrength = value;
      bridgeState.api?.setWindStrength?.(value);
    },

    setStripMetrics(next) {
      bridgeState.snapshot.itemsOnStrip = next?.itemsOnStrip ?? bridgeState.snapshot.itemsOnStrip;
      bridgeState.snapshot.numUnique = next?.numUnique ?? bridgeState.snapshot.numUnique;
      bridgeState.snapshot.gapSize = next?.gapSize ?? bridgeState.snapshot.gapSize;
      bridgeState.snapshot.arcSpan = next?.arcSpan ?? bridgeState.snapshot.arcSpan;
      bridgeState.snapshot.axis = next?.axis ?? bridgeState.snapshot.axis;
      bridgeState.api?.setStripMetrics?.({
        itemsOnStrip: bridgeState.snapshot.itemsOnStrip,
        numUnique: bridgeState.snapshot.numUnique,
        gapSize: bridgeState.snapshot.gapSize,
        arcSpan: bridgeState.snapshot.arcSpan,
        axis: bridgeState.snapshot.axis,
      });
    },

    getSlotScreenRect(slotIndex, flatten) {
      return bridgeState.api?.getSlotScreenRect?.(slotIndex, flatten) ?? null;
    },

    getSlotWorldPoint(u, v, flatten) {
      return bridgeState.api?.getSlotWorldPoint?.(u, v, flatten) ?? null;
    },

    dispose() {
      bridgeState.api?.dispose?.();
      bridgeState.api = null;
      bridgeState.itemClickHandlers.clear();
      bridgeState.readyHandlers.clear();
    },
  };
}
