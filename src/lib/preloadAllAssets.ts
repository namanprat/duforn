const MODEL_URL = "/main_scene.glb";
const HDR_URL = "/main.hdr";

async function fetchWithProgress(url: string, onProgress: (t: number) => void): Promise<void> {
  try {
    const res = await fetch(url, { cache: "force-cache" });
    const total = Number(res.headers.get("content-length")) || 0;
    if (!res.body || !total) {
      await res.arrayBuffer().catch(() => {});
      onProgress(1);
      return;
    }
    const reader = res.body.getReader();
    let received = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value?.length ?? 0;
      onProgress(Math.min(1, received / total));
    }
    onProgress(1);
  } catch {
    onProgress(1); // never let a failed warm stall the boot gate
  }
}

/**
 * Gate assets for a first paint on a non-room page (project / archive deep-link):
 * download the room GLB (byte-accurate progress, dominant) + HDR so entering a
 * room afterwards is instant. Resolves when both are cached.
 */
export async function loadCoreWithProgress(onProgress: (pct: number) => void): Promise<void> {
  let glb = 0;
  let hdr = 0;
  const emit = () => onProgress(Math.min(100, Math.round((glb * 0.85 + hdr * 0.15) * 100)));
  emit();
  await Promise.all([
    fetchWithProgress(MODEL_URL, (t) => {
      glb = t;
      emit();
    }),
    fetchWithProgress(HDR_URL, (t) => {
      hdr = t;
      emit();
    }),
  ]);
  glb = 1;
  hdr = 1;
  emit();
}
