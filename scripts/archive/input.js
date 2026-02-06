// Archive input handling (mouse, touch, keyboard, wheel)
import gsap from "gsap";
import { CONFIG } from "./config.js";
import { state } from "./state.js";
import { getRenderer, getContainer, getPlane } from "./renderer.js";
import { enterFocus, exitFocus, navigateFocus } from "./focus.js";
import { archiveItems as projects } from "../../data/archive-items.js";

// Helper functions for cell calculations
const fract = (x) => x - Math.floor(x);
const randomJS = (vec2) => {
  const dt = vec2.x * 12.9898 + vec2.y * 78.233;
  const sn = Math.sin(dt);
  return fract(sn * 43758.5453123);
};

const texIndexForCell = (cellX, cellY, count) => {
  return ((cellX + cellY * 3) % count + count) % count;
};

// Calculate which cell was clicked based on screen coordinates
function getClickedCell(clientX, clientY) {
  const renderer = getRenderer();
  const container = getContainer();
  const plane = getPlane();

  if (!renderer || !container) return null;

  const rect = renderer.domElement.getBoundingClientRect();

  // Convert to normalized device coordinates
  let screenX = ((clientX - rect.left) / rect.width) * 2 - 1;
  let screenY = -(((clientY - rect.top) / rect.height) * 2 - 1);

  // Apply zoom
  screenX /= state.dragZoom.value;
  screenY /= state.dragZoom.value;

  // Apply fisheye distortion
  const radius = Math.sqrt(screenX * screenX + screenY * screenY);
  const effectiveDistortion = CONFIG.distortion * (1.0 - state.mousePressed.value);
  const distortion = 1.0 - effectiveDistortion * radius * radius;

  const distortedX = screenX * distortion;
  const distortedY = screenY * distortion;

  const aspectRatio = rect.width / rect.height;
  const gridCellSize = CONFIG.cellSize * CONFIG.cellSpacing;

  // Pre-cell for depth-based parallax
  const preCellX = Math.floor((distortedX * aspectRatio + state.offset.x) / gridCellSize);
  const preCellY = Math.floor((distortedY + state.offset.y) / gridCellSize);
  const depth = 0.6 + randomJS({ x: preCellX + 500.0, y: preCellY }) * 0.8;

  const worldX = distortedX * aspectRatio + state.offset.x + state.mouseParallax.x * depth;
  const worldY = distortedY + state.offset.y + state.mouseParallax.y * depth;

  // Calculate cell coordinates
  const cellX = Math.floor(worldX / gridCellSize);
  const cellY = Math.floor(worldY / gridCellSize);

  // Calculate cell UV coordinates
  const cellUVX = worldX / gridCellSize - cellX;
  const cellUVY = worldY / gridCellSize - cellY;

  const texIndex = texIndexForCell(cellX, cellY, projects.length);

  const sizeRand = randomJS({ x: cellX + 200.0, y: cellY });
  let baseImageSize = 0.62 + sizeRand * 0.12;
  const depthScale = 0.92 + Math.min(Math.max((depth - 0.6) / 0.8, 0), 1) * 0.16;
  baseImageSize *= depthScale;

  // Match shader: cell-based focus check
  const isFocused = cellX === state.currentFocusCell.x && cellY === state.currentFocusCell.y;
  const targetImageSize = isFocused ? 0.90 : baseImageSize;
  const imageSize = baseImageSize + (targetImageSize - baseImageSize) * state.focusState.value;

  const border = (1 - imageSize) / 2;
  let u = (cellUVX - border) / imageSize;
  let v = (cellUVY - border) / imageSize;

  const aspectRatios = plane?.material?.uniforms?.uAspectRatios?.value || [];
  const naturalAspect = aspectRatios[texIndex] || 1;
  if (naturalAspect > 1.0) {
    u = (u - 0.5) * naturalAspect + 0.5;
  } else {
    v = (v - 0.5) / naturalAspect + 0.5;
  }

  const isOnImage = u >= 0.0 && u <= 1.0 && v >= 0.0 && v <= 1.0;

  return { cellX, cellY, texIndex, isOnImage };
}

// Named event handlers for proper cleanup
function onPointerDown(e) {
  // Allow navbar and UI buttons to work
  if (
    e.target.closest(".nav-wrap") ||
    e.target.closest(".archive-nav-btn") ||
    e.target.closest(".archive-close-btn") ||
    e.target.closest(".menu-wrap") ||
    e.target.closest(".menu-box") ||
    e.target.closest(".bottom-nav-wrap") ||
    e.target.closest(".archive-focus-panel")
  ) {
    return;
  }

  state.isDragging = true;
  state.isClick = true;
  state.clickStartTime = Date.now();
  state.previousMouse.x = e.clientX;
  state.previousMouse.y = e.clientY;
  state.dragStartPos.x = e.clientX;
  state.dragStartPos.y = e.clientY;
  state.totalDragDistance = 0;

  // Animate fisheye flattening
  gsap.to(state.mousePressed, {
    value: 1,
    duration: CONFIG.mousePressedDuration,
    ease: "power2.out",
  });
}

function onPointerMove(e) {
  const renderer = getRenderer();

  // Update mouse position for parallax (only when not dragging)
  if (!state.isDragging && renderer) {
    const rect = renderer.domElement.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    state.mouse.x = -x * 0.05;
    state.mouse.y = y * 0.05;
  }

  if (!state.isDragging) return;

  const deltaX = e.clientX - state.previousMouse.x;
  const deltaY = e.clientY - state.previousMouse.y;

  // Track total drag distance
  state.totalDragDistance += Math.sqrt(deltaX * deltaX + deltaY * deltaY);

  // Only mark as not a click if significant drag distance
  if (state.totalDragDistance > CONFIG.clickThreshold) {
    state.isClick = false;

    // Zoom out effect when dragging
    const zoomProgress = Math.min(state.totalDragDistance / CONFIG.dragZoomDistance, 1);
    state.dragZoom.value = 1 - zoomProgress * CONFIG.dragZoomMax;

    // Exit focus mode once dragged enough
    if (state.focusedIndex !== -1 && state.totalDragDistance > CONFIG.dragExitThreshold) {
      exitFocus();
    }
  }

  state.targetOffset.x -= deltaX * 0.002;
  state.targetOffset.y += deltaY * 0.002;

  state.previousMouse.x = e.clientX;
  state.previousMouse.y = e.clientY;
}

function onPointerUp(e) {
  if (!state.isDragging) return;
  state.isDragging = false;

  // Reset fisheye flattening
  gsap.to(state.mousePressed, {
    value: 0,
    duration: CONFIG.focusExitDuration,
    ease: "power2.out",
  });

  // Reset drag zoom with animation
  if (state.dragZoom.value !== 1) {
    gsap.to(state.dragZoom, {
      value: 1,
      duration: CONFIG.dragZoomDuration,
      ease: "power2.out",
    });
  }

  // Allow click if drag distance is small or it's a quick action
  const wasQuickClick = Date.now() - state.clickStartTime < CONFIG.clickTimeout;
  const wasSmallDrag = state.totalDragDistance < CONFIG.clickThreshold;

  if ((state.isClick || wasSmallDrag) && wasQuickClick) {
    const result = getClickedCell(e.clientX, e.clientY);

    if (!result) {
      // Clicked outside valid area - exit focus mode if active
      if (state.focusedIndex !== -1) {
        exitFocus();
      }
      return;
    }

    const { cellX, cellY, texIndex, isOnImage } = result;

    if (state.focusedIndex === -1) {
      // Not in focus mode - only enter if clicking on image
      if (isOnImage) {
        enterFocus(texIndex, cellX, cellY);
      }
    } else {
      // In focus mode
      if (!isOnImage) {
        // Clicked on blank space - exit focus mode
        exitFocus();
      } else if (
        texIndex !== state.focusedIndex ||
        cellX !== state.currentFocusCell.x ||
        cellY !== state.currentFocusCell.y
      ) {
        // Clicked on different image - switch to it
        enterFocus(texIndex, cellX, cellY);
      } else {
        // Clicked on same image - exit focus mode
        exitFocus();
      }
    }
  }

  state.totalDragDistance = 0;
}

function onWheel(e) {
  // Only handle wheel on canvas
  if (!e.target.closest("#gallery")) return;

  e.preventDefault();
  state.targetOffset.x += e.deltaX * 0.001;
  state.targetOffset.y -= e.deltaY * 0.001;

  // Exit focus mode on significant scroll
  if (state.focusedIndex !== -1 && (Math.abs(e.deltaX) > 10 || Math.abs(e.deltaY) > 10)) {
    exitFocus();
  }
}

function onKeyDown(e) {
  if (state.focusedIndex === -1) return;

  if (e.key === "ArrowRight") {
    e.preventDefault();
    navigateFocus(1);
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    navigateFocus(-1);
  } else if (e.key === "Escape") {
    e.preventDefault();
    exitFocus();
  }
}

// Touch event handlers
function onTouchStart(e) {
  if (e.touches.length === 1) {
    const touch = e.touches[0];
    onPointerDown({
      clientX: touch.clientX,
      clientY: touch.clientY,
      target: e.target,
    });
  }
}

function onTouchMove(e) {
  if (e.touches.length === 1) {
    const touch = e.touches[0];
    onPointerMove({
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
  }
}

function onTouchEnd(e) {
  if (e.changedTouches.length === 1) {
    const touch = e.changedTouches[0];
    onPointerUp({
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
  }
}

// Setup all input event listeners
export function setupInputHandlers() {
  const renderer = getRenderer();
  if (!renderer) return;

  const canvas = renderer.domElement;

  // Pointer events (mouse)
  canvas.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);

  // Wheel event
  canvas.addEventListener("wheel", onWheel, { passive: false });

  // Keyboard event
  window.addEventListener("keydown", onKeyDown);

  // Touch events
  canvas.addEventListener("touchstart", onTouchStart, { passive: true });
  canvas.addEventListener("touchmove", onTouchMove, { passive: true });
  canvas.addEventListener("touchend", onTouchEnd, { passive: true });

  // Navigation buttons
  const prevBtn = document.getElementById("archive-prev");
  const nextBtn = document.getElementById("archive-next");

  if (prevBtn) {
    prevBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      navigateFocus(-1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      navigateFocus(1);
    });
  }

  // Close button
  const closeBtn = document.querySelector(".archive-close-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      exitFocus();
    });
  }

  // Overlay background click (to close)
  const overlay = document.getElementById("archive-overlay");
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      // Close if clicking the overlay background, not interactive elements
      if (
        !e.target.closest(".archive-focus-panel") &&
        !e.target.closest(".archive-nav-btn")
      ) {
        exitFocus();
      }
    });
  }
}

// Remove all input event listeners
export function removeInputHandlers() {
  const renderer = getRenderer();

  // Remove canvas-level events
  if (renderer?.domElement) {
    const canvas = renderer.domElement;
    canvas.removeEventListener("pointerdown", onPointerDown);
    canvas.removeEventListener("wheel", onWheel);
    canvas.removeEventListener("touchstart", onTouchStart);
    canvas.removeEventListener("touchmove", onTouchMove);
    canvas.removeEventListener("touchend", onTouchEnd);
  }

  // Remove window-level events
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("pointerup", onPointerUp);
  window.removeEventListener("keydown", onKeyDown);
}
