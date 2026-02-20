import * as THREE from 'three';

/**
 * Archive UI - Grid center UV control only
 */

export function createArchiveUI(sharedState) {
  const uiState = {
    container: document.querySelector('.archive-container') || document.querySelector('main[data-barba-namespace="archive"]'),
    sharedState: sharedState,
    handlers: {},
  };

  if (!uiState.container) {
    console.warn('Archive UI: container not found');
  }

  // Mouse move handler
  uiState.handlers.onMouseMove = (e) => {
    if (!uiState.container) return;

    const rect = uiState.container.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    // Control grid center UV
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

  // Mouse leave handler
  uiState.handlers.onMouseLeave = () => {
    if (uiState.sharedState && uiState.sharedState.targetCenterUv) {
      uiState.sharedState.targetCenterUv.set(0.5, 0.5);
    }
  };

  // Attach event listeners
  if (uiState.container) {
    uiState.container.addEventListener('mousemove', uiState.handlers.onMouseMove);
    uiState.container.addEventListener('mouseleave', uiState.handlers.onMouseLeave);
  }

  return uiState;
}

export function updateArchiveUI(uiState) {
  // No-op: minimal UI
}

export function destroyArchiveUI(uiState) {
  if (!uiState) return;

  // Remove event listeners
  if (uiState.container) {
    uiState.container.removeEventListener('mousemove', uiState.handlers.onMouseMove);
    uiState.container.removeEventListener('mouseleave', uiState.handlers.onMouseLeave);
  }

  uiState.container = null;
}
