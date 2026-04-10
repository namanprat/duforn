import { create } from "zustand";

type Primitive = string | number | boolean | null;
type JsonValue = Primitive | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

type SceneControlsState<TControls extends JsonObject> = {
  controls: TControls;
  setControl: (path: string, value: JsonValue) => void;
  resetControls: () => void;
};

function cloneControls<TControls extends JsonObject>(defaultControls: TControls): TControls {
  return structuredClone(defaultControls);
}

function setByPath<TControls extends JsonObject>(
  source: TControls,
  path: string,
  value: JsonValue,
): TControls {
  const keys = path.split(".");
  const next = { ...source } as Record<string, unknown>;
  let cursor: Record<string, unknown> = next;

  for (let index = 0; index < keys.length - 1; index += 1) {
    const key = keys[index];
    cursor[key] = { ...(cursor[key] as Record<string, unknown>) };
    cursor = cursor[key] as Record<string, unknown>;
  }

  cursor[keys.at(-1) as string] = value;
  return next as TControls;
}

export function createSceneControlsStore<TControls extends JsonObject>(defaultControls: TControls) {
  return create<SceneControlsState<TControls>>((set) => ({
    controls: cloneControls(defaultControls),
    setControl: (path, value) =>
      set((state) => ({
        controls: setByPath(state.controls, path, value),
      })),
    resetControls: () => set({ controls: cloneControls(defaultControls) }),
  }));
}
