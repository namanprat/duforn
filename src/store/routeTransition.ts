import { create } from "zustand";
import type * as THREE from "three";
import { BOOT_FOV_DURATION } from "../scenes/cam/roomPoses";
import { captureGlFrame, disposeTexture } from "../scenes/transition/captureFrame";
import type { BottomRevealMode } from "../scenes/transition/transitionUniforms";
import { hidePageChrome, showPageChrome } from "../lib/pageChrome";
import { hideAllRegisteredPageText, showAllRegisteredPageText } from "../lib/text";
import { getDeviceTier } from "../lib/deviceTier";
import { prefersReducedMotion } from "../lib/prefersReducedMotion";
import { resetArchiveToOrbView } from "./archiveView";

export const DISSOLVE_DURATION = BOOT_FOV_DURATION;

export type DissolveMode = "archive" | "boot";

type DissolveCallbacks = {
  onMidpoint: (() => void) | null;
  onComplete: (() => void) | null;
};

type DissolveTransitionState = {
  active: boolean;
  mode: DissolveMode | null;
  progress: number;
  topTexture: THREE.Texture | null;
  bottomTexture: THREE.Texture | null;
  bottomReveal: BottomRevealMode;
  runId: number;
  callbacks: DissolveCallbacks;
  start: (opts: {
    mode: DissolveMode;
    topTexture: THREE.Texture;
    bottomTexture: THREE.Texture;
    bottomReveal?: BottomRevealMode;
    onMidpoint?: (() => void) | null;
    onComplete?: (() => void) | null;
  }) => void;
  setProgress: (progress: number) => void;
  setBottomTexture: (texture: THREE.Texture) => void;
  finish: () => void;
  reset: () => void;
};

let heldTextures: THREE.Texture[] = [];

function holdTextures(...textures: THREE.Texture[]) {
  for (const tex of new Set(textures)) {
    if (!heldTextures.includes(tex)) heldTextures.push(tex);
  }
}

function releaseHeldTextures() {
  heldTextures.forEach(disposeTexture);
  heldTextures = [];
}

export const useDissolveTransitionStore = create<DissolveTransitionState>((set, get) => ({
  active: false,
  mode: null,
  progress: 0,
  topTexture: null,
  bottomTexture: null,
  bottomReveal: "fade",
  runId: 0,
  callbacks: { onMidpoint: null, onComplete: null },
  start: ({
    mode,
    topTexture,
    bottomTexture,
    bottomReveal = "fade",
    onMidpoint = null,
    onComplete = null,
  }) => {
    releaseHeldTextures();
    holdTextures(topTexture, bottomTexture);
    set({
      active: true,
      mode,
      progress: 0,
      topTexture,
      bottomTexture,
      bottomReveal,
      runId: get().runId + 1,
      callbacks: { onMidpoint, onComplete },
    });
  },
  setProgress: (progress) => {
    const state = get();
    if (!state.active) return;
    set({ progress: Math.min(1, Math.max(0, progress)) });
  },
  setBottomTexture: (texture) => {
    const { bottomTexture: prev, topTexture } = get();
    if (prev && prev !== texture && prev !== topTexture) disposeTexture(prev);
    holdTextures(texture);
    set({ bottomTexture: texture });
  },
  finish: () => {
    const { callbacks } = get();
    callbacks.onComplete?.();
    get().reset();
  },
  reset: () => {
    releaseHeldTextures();
    set({
      active: false,
      mode: null,
      progress: 0,
      topTexture: null,
      bottomTexture: null,
      bottomReveal: "fade",
      callbacks: { onMidpoint: null, onComplete: null },
    });
  },
}));

export function shouldUseDissolveTransition(fromPath: string, toPath: string): boolean {
  const fromArchive = fromPath === "/archive";
  const toArchive = toPath === "/archive";
  return fromArchive !== toArchive;
}

function canRunDissolve(): boolean {
  return getDeviceTier() > 0 && !prefersReducedMotion();
}

function waitFrames(count = 2): Promise<void> {
  return new Promise((resolve) => {
    let remaining = count;
    const step = () => {
      remaining -= 1;
      if (remaining <= 0) resolve();
      else requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

export function playDissolve(opts: {
  mode: DissolveMode;
  topTexture: THREE.Texture;
  bottomTexture: THREE.Texture;
  bottomReveal?: BottomRevealMode;
  onMidpoint?: (() => void) | null;
}): Promise<void> {
  return new Promise((resolve) => {
    useDissolveTransitionStore.getState().start({
      ...opts,
      onComplete: resolve,
    });
  });
}

export async function runArchiveRouteTransition(
  _fromPath: string,
  toPath: string,
  navigate: (path: string) => void,
): Promise<void> {
  const toArchive = toPath === "/archive";

  await Promise.all([hideAllRegisteredPageText(), hidePageChrome()]);
  await waitFrames(1);

  if (!canRunDissolve()) {
    if (toArchive) resetArchiveToOrbView();
    navigate(toPath);
    await waitFrames();
    await showPageChrome(toArchive);
    if (!toArchive) await showAllRegisteredPageText();
    return;
  }

  const fromTexture = captureGlFrame();
  if (!fromTexture) {
    if (toArchive) resetArchiveToOrbView();
    navigate(toPath);
    await waitFrames();
    await showPageChrome(toArchive);
    if (!toArchive) await showAllRegisteredPageText();
    return;
  }

  if (toArchive) resetArchiveToOrbView();
  navigate(toPath);
  await waitFrames(4);

  const destTexture = captureGlFrame();
  const bottomTexture = destTexture ?? fromTexture;
  const bottomReveal: BottomRevealMode = destTexture ? "destination" : "fade";

  await playDissolve({
    mode: "archive",
    topTexture: fromTexture,
    bottomTexture,
    bottomReveal,
  });

  await showPageChrome(toArchive);
  if (!toArchive) await showAllRegisteredPageText();
}

export function runBootDissolveTransition(onComplete: () => void): void {
  if (!canRunDissolve()) {
    onComplete();
    return;
  }

  const texture = captureGlFrame();
  if (!texture) {
    onComplete();
    return;
  }

  void playDissolve({
    mode: "boot",
    topTexture: texture,
    bottomTexture: texture,
  }).then(onComplete);
}

export function isDissolveTransitionActive(): boolean {
  return useDissolveTransitionStore.getState().active;
}
