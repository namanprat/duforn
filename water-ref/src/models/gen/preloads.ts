// @ts-nocheck
/**
 * Single manifest: all GLB URLs warmed via fetch so drei's loader cache hits the
 * warm HTTP cache when components later mount. The website model is a plain
 * (uncompressed) GLB; monitor still ships meshopt-compressed.
 *
 * Regenerate JSX from GLBs via gltfjsx (see README in this folder).
 */
import { trackPromise } from "../../lib/preload/gate";
import { GLTF_URL_MONITOR, GLTF_URL_PROJECT_BG, GLTF_URL_WEBSITE } from "../urls";

// Single source of preload truth: we fetch raw bytes here to warm the HTTP
// cache + drive the preloader gate. When components later call useGLTF /
// useTexture / useLoader, drei's loaders hit the warm cache.
const ESSENTIAL_ASSETS: { id: string; url: string; label: string; weight: number }[] = [
  { id: "hdr:home", url: "/home.hdr", label: "Home HDR", weight: 1 },
  { id: "texture:default", url: "/default.jpg", label: "Default texture", weight: 1 },
];

const ROOM_ASSETS: { id: string; url: string; label: string; weight: number }[] = [
  { id: "gltf:website", url: GLTF_URL_WEBSITE, label: "Website model", weight: 4 },
  { id: "gltf:monitor", url: GLTF_URL_MONITOR, label: "Monitor model", weight: 2 },
  { id: "gltf:project-bg", url: GLTF_URL_PROJECT_BG, label: "Project background", weight: 2 },
];

let roomPreloadRequested = false;

/**
 * Register one preloader-gate task per essential asset. Uses `fetch` so the gate
 * tracks network readiness; drei's loader cache (seeded by the *.preload calls
 * above) reuses the warm HTTP cache when components later mount.
 */
export function registerEssentialAssetTasks(): void {
  for (const asset of ESSENTIAL_ASSETS) {
    trackPromise(
      asset.id,
      fetch(asset.url).then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to preload ${asset.url}: ${response.status}`);
        }
        return response.arrayBuffer();
      }),
      { label: asset.label, weight: asset.weight },
    ).catch(() => {});
  }
}

/**
 * Heavy room-scoped assets — website / monitor / project-bg GLBs. Called from
 * RoomCanvas mount so non-room landings (e.g. /projects/...) don't block on them.
 * Idempotent: safe to call repeatedly.
 */
export function registerRoomAssetTasks(): void {
  if (roomPreloadRequested) return;
  roomPreloadRequested = true;

  for (const asset of ROOM_ASSETS) {
    trackPromise(
      asset.id,
      fetch(asset.url).then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to preload ${asset.url}: ${response.status}`);
        }
        return response.arrayBuffer();
      }),
      { label: asset.label, weight: asset.weight },
    ).catch(() => {});
  }
}
