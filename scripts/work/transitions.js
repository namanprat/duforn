let workFirstFramePromise = Promise.resolve();
let workFirstFrameResolver = null;

export function resetWorkFirstFrameGate() {
  workFirstFramePromise = new Promise((resolve) => {
    workFirstFrameResolver = resolve;
  });
}

export function resolveWorkFirstFrameGate() {
  if (!workFirstFrameResolver) return;
  workFirstFrameResolver();
  workFirstFrameResolver = null;
}

export function whenWorkFirstFrame() {
  return workFirstFramePromise;
}

export function clearWorkFirstFrameGate() {
  workFirstFramePromise = Promise.resolve();
  workFirstFrameResolver = null;
}
