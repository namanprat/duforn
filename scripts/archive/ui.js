export function createArchiveUI(sharedState, options = {}) {
  const uiState = {
    container: options.container || document.querySelector('.archive-container') || document.querySelector('main[data-page-namespace="archive"]'),
    sharedState,
    handlers: {},
  };

  if (!uiState.container) {
    console.warn('Archive UI: container not found');
  }

  uiState.handlers.onMouseMove = (e) => {
    if (!uiState.container) return;

    const rect = uiState.container.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    if (rect.width > 0 && rect.height > 0) {
      const nx = (clientX - rect.left) / rect.width;
      const ny = (clientY - rect.top) / rect.height;
      const clampedX = Math.min(1, Math.max(0, nx));
      const clampedY = Math.min(1, Math.max(0, ny));

      const strength = 0.4;
      const cx = 0.5 + (clampedX - 0.5) * strength;
      const cy = 0.5 + ((1 - clampedY) - 0.5) * strength;

      if (uiState.sharedState && uiState.sharedState.targetCenterUv) {
        uiState.sharedState.targetCenterUv.set(
          Math.min(1, Math.max(0, cx)),
          Math.min(1, Math.max(0, cy))
        );
      }
    }
  };

  uiState.handlers.onMouseLeave = () => {
    if (uiState.sharedState && uiState.sharedState.targetCenterUv) {
      uiState.sharedState.targetCenterUv.set(0.5, 0.5);
    }
  };

  if (uiState.container && !options.isTouchDevice) {
    uiState.container.addEventListener('mousemove', uiState.handlers.onMouseMove);
    uiState.container.addEventListener('mouseleave', uiState.handlers.onMouseLeave);
  }

  return uiState;
}

export function updateArchiveUI() {
  // No-op: minimal UI
}

export function destroyArchiveUI(uiState) {
  if (!uiState) return;

  if (uiState.container) {
    uiState.container.removeEventListener('mousemove', uiState.handlers.onMouseMove);
    uiState.container.removeEventListener('mouseleave', uiState.handlers.onMouseLeave);
  }

  uiState.container = null;
}
