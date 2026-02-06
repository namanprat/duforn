// Archive shared state management

export const state = {
  // Runtime flags
  isRunning: false,

  // Pan/offset state
  offset: { x: 0, y: 0 },
  targetOffset: { x: 0, y: 0 },

  // Drag state
  isDragging: false,
  isClick: true,
  clickStartTime: 0,
  previousMouse: { x: 0, y: 0 },
  dragStartPos: { x: 0, y: 0 },
  totalDragDistance: 0,

  // Focus state
  focusedIndex: -1,
  focusState: { value: 0 },
  currentFocusCell: { x: -9999, y: -9999 },

  // Zoom state
  dragZoom: { value: 1 },

  // Mouse pressed state (for fisheye flattening)
  mousePressed: { value: 0 },

  // Mouse parallax state
  mouse: { x: 0, y: 0 },
  mouseParallax: { x: 0, y: 0 },
};

// Reset state to initial values
export function resetState() {
  state.isRunning = false;

  state.offset = { x: 0, y: 0 };
  state.targetOffset = { x: 0, y: 0 };

  state.isDragging = false;
  state.isClick = true;
  state.clickStartTime = 0;
  state.previousMouse = { x: 0, y: 0 };
  state.dragStartPos = { x: 0, y: 0 };
  state.totalDragDistance = 0;

  state.focusedIndex = -1;
  state.focusState = { value: 0 };
  state.currentFocusCell = { x: -9999, y: -9999 };

  state.dragZoom = { value: 1 };
  state.mousePressed = { value: 0 };

  state.mouse = { x: 0, y: 0 };
  state.mouseParallax = { x: 0, y: 0 };
}
