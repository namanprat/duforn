export const MOTION_TOKENS = {
  textReveal: {
    revealDuration: 0.85,
    revealStagger: 0.1,
    hideDuration: 0.35,
    hideStagger: 0.04,
    revealEase: "power4.out",
    hideEase: "power3.in",
    showDurationScale: 0.75,
    showStaggerScale: 0.8,
    // Hidden start/travel for line & mask reveals. Must exceed 100% so tight line-heights
    // (e.g. 0.85 on display headings) still fully clear the line mask — at exactly 100% the
    // top of the glyphs peeks out the bottom of the clip. 115% is the smallest safe overshoot.
    revealHiddenPercent: 115,
  },
  buttonHover: {
    enterDuration: 0.28,
    leaveDuration: 0.32,
    ease: "power2.out",
    enterScale: 0.95,
    leaveScale: 1,
  },
  charHover: {
    staggerStep: 0.01,
    duration: 0.6,
    ease: "cubic-bezier(0.625, 0.05, 0, 1)",
    travelEm: 1.3,
    bgInsetEm: 0.125,
  },
  menu: {
    // Box morph — one expand + one shrink profile for every transition (menu, about, close).
    boxExpand: 0.62,
    boxShrink: 0.62,
    boxExpandEase: "back.out(1.01)",
    boxShrinkEase: "back.out(1.025)",
    line: 0.55,
    lineStagger: 0.07,
    lineFlipScale: 0.75,
    // Closing line animations run 20% faster; box shrink keeps open duration for symmetry.
    closeSpeedScale: 0.8,
    ease: "power3.out",
    closeEase: "power3.in",
    aboutRevealDelay: 0.1,
    aboutBustFadeIn: 0.45,
  },
  workProjectTransition: {
    stripFadeDuration: 0.55,
    stripFadeEase: "power3.in",
    bgFadeDuration: 0.7,
    bgFadeEase: "power2.out",
    stripDissolveDuration: 0.65,
    stripDissolveEase: "power2.in",
    titleHideDelay: 0,
    cameraYDuration: 1.1,
    cameraYDelta: 7,
    cameraYEase: "power3.inOut",
    bgRiseDuration: 1.1,
    bgRiseEase: "power3.out",
    textRevealDelay: 0.15,
    bgReadyTimeoutMs: 1500,
  },
  bootReveal: {
    // Ironhill is scroll-linear (CONFIG.speed 2 → progress 0…1.1). Timed open mirrors that
    // continuous wipe with no gather/hold beat.
    openDuration: 1.25,
    openEase: "none",
    fovDuration: 1.2,
    fovEase: "power2.out",
    /** Normalized position within the open tween when hero copy may reveal. */
    pierceRevealAt: 0.42,
    enterFadeDuration: 0.15,
  },
} as const;
