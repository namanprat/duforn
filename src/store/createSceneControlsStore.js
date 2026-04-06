import { create } from "zustand";

function cloneControls(defaultControls) {
  return structuredClone(defaultControls);
}

function setByPath(source, path, value) {
  const keys = path.split(".");
  const next = { ...source };
  let cursor = next;

  for (let index = 0; index < keys.length - 1; index += 1) {
    const key = keys[index];
    cursor[key] = { ...cursor[key] };
    cursor = cursor[key];
  }

  cursor[keys.at(-1)] = value;
  return next;
}

export function createSceneControlsStore(defaultControls) {
  return create((set) => ({
    controls: cloneControls(defaultControls),
    setControl: (path, value) =>
      set((state) => ({
        controls: setByPath(state.controls, path, value),
      })),
    resetControls: () => set({ controls: cloneControls(defaultControls) }),
  }));
}
