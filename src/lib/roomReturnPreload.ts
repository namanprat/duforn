import { useGLTF } from "@react-three/drei";
import type { ArchiveReturnRoom } from "../store/archiveReturn";
import { useArchiveReturnStore } from "../store/archiveReturn";
import { startWorkTexturePreload } from "./work-preload";

const MODEL_URL = "/main_scene.glb";

/** Warm the return destination while the user is still on archive. */
export async function preloadArchiveReturnRoom(room: ArchiveReturnRoom): Promise<void> {
  const store = useArchiveReturnStore.getState();
  if (store.preloadReadyFor === room) return;

  if (room === "work") {
    await startWorkTexturePreload();
    store.markPreloadReady("work");
    return;
  }

  if (room === "main") {
    // ponytail: GLB + HDR are the heavy room assets; water sim still mounts on route but
    // skipping the subgraph delay after this buys ~550ms once the GLB is hot in cache.
    useGLTF.preload(MODEL_URL);
    await Promise.all([
      fetch("/main.hdr", { cache: "force-cache" }).catch(() => undefined),
      fetch(MODEL_URL, { cache: "force-cache" }).catch(() => undefined),
    ]);
    store.markPreloadReady("main");
    return;
  }

  store.markPreloadReady("contact");
}

export function scheduleArchiveReturnPreload(room: ArchiveReturnRoom): void {
  const run = () => {
    void preloadArchiveReturnRoom(room);
  };
  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(run, { timeout: 2500 });
  } else {
    window.setTimeout(run, 400);
  }
}
