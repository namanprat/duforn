import { create } from "zustand";

function cloneControls<T>(defaultControls: T) {
  return structuredClone(defaultControls);
}

function setByPath(source: Record<string, unknown>, path: string, value: unknown) {
  const keys = path.split(".");
  const next = { ...source };
  let cursor: Record<string, unknown> = next;

  for (let index = 0; index < keys.length - 1; index += 1) {
    const key = keys[index];
    cursor[key] = { ...(cursor[key] as Record<string, unknown>) };
    cursor = cursor[key] as Record<string, unknown>;
  }

  cursor[keys.at(-1) as string] = value;
  return next;
}

export function createSceneControlsStore<T extends Record<string, unknown>>(defaultControls: T) {
  return create<{
    controls: T;
    setControl: (path: string, value: unknown) => void;
    resetControls: () => void;
  }>((set) => ({
    controls: cloneControls(defaultControls),
    setControl: (path, value) =>
      set((state) => ({
        controls: setByPath(state.controls as Record<string, unknown>, path, value) as T,
      })),
    resetControls: () => set({ controls: cloneControls(defaultControls) }),
  }));
}
