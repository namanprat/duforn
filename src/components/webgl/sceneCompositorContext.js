import { createContext } from "react";

/**
 * Context exposed by SceneCompositor to its descendant SceneSlot components.
 *
 * Shape:
 * {
 *   registerSlot: (id, slotData) => void,
 *   updateSlot:   (id, partial)  => void,
 *   unregisterSlot: (id)         => void,
 * }
 *
 * slotData: {
 *   scene: THREE.Scene,
 *   camera: THREE.Camera,
 *   clearColor: number | string,
 *   clearAlpha: number,
 * }
 */
export const SceneCompositorContext = createContext(null);
