import type { EffectComposer } from "postprocessing";

/** Live EffectComposer from ScenePostFX — used to warm post shaders during boot. */
export const postFxComposerRef = { current: null as EffectComposer | null };

export function warmPostFxFrames(count = 2): void {
  const composer = postFxComposerRef.current;
  if (!composer) return;
  for (let i = 0; i < count; i++) composer.render();
}
