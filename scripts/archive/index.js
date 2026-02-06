// Archive page main entry module
import { state, resetState } from "./state.js";
import { setupRenderer, destroyRenderer, startLoop, stopLoop, onResize } from "./renderer.js";
import { setupInputHandlers, removeInputHandlers } from "./input.js";
import { exitFocus, clearFocusElements } from "./focus.js";

// Named resize handler for cleanup
let resizeHandler = null;

// Initialize the archive scene
export async function initArchiveScene() {
  if (state.isRunning) return;

  state.isRunning = true;

  // Setup WebGL renderer and scene
  await setupRenderer();

  // Setup input handlers
  setupInputHandlers();

  // Setup resize handler
  resizeHandler = onResize;
  window.addEventListener("resize", resizeHandler);

  // Start the animation loop
  startLoop();
}

// Destroy the archive scene and cleanup resources
export function destroyArchiveScene() {
  if (!state.isRunning) return;

  // Stop animation loop
  stopLoop();

  // Remove resize handler
  if (resizeHandler) {
    window.removeEventListener("resize", resizeHandler);
    resizeHandler = null;
  }

  // Remove input handlers
  removeInputHandlers();

  // Exit focus mode if active
  exitFocus();

  // Clear cached DOM elements
  clearFocusElements();

  // Destroy renderer and WebGL resources
  destroyRenderer();

  // Reset state to initial values
  resetState();
}
