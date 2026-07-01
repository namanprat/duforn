export const MOTION_TOKENS = {
  textReveal: {
    revealDuration: 1,
    revealStagger: 0.12,
    hideDuration: 0.55,
    hideStagger: 0.072,
    revealEase: "power4.out",
    hideEase: "power3.in",
    showDurationScale: 0.75,
    showStaggerScale: 0.8,
    // Hidden start/travel for line & mask reveals. Must exceed 100% so tight line-heights
    // (e.g. 0.85 on display headings) still fully clear the line mask — at exactly 100% the
    // top of the glyphs peeks out the bottom of the clip. 115% is the smallest safe overshoot.
    revealHiddenPercent: 115,
  },
  navHover: {
    staggerAmount: 0.161,
    duration: 0.45,
    ease: "power1.out",
  },
  buttonHover: {
    enterDuration: 0.28,
    leaveDuration: 0.32,
    ease: "power2.out",
    enterScale: 0.95,
    leaveScale: 1,
  },
  menu: {
    // Box morph beats.
    boxOpen: 0.62,
    boxAbout: 0.9,
    line: 0.55,
    lineStagger: 0.07,
    lineFlipScale: 0.75,
    // Closing line animations run 20% faster; box shrink keeps open duration for symmetry.
    closeSpeedScale: 0.8,
    boxOpenEase: "back.out(1.04)",
    // ponytail: back.out undershoots past the pill size then settles — mirrors expand bounce
    boxShrinkEase: "back.out(1.1)",
    ease: "power3.out",
    closeEase: "power3.in",
    aboutRevealDelay: 0.1,
    aboutHelmetMountMaxMs: 320,
    aboutHelmetFadeIn: 0.45,
  },
  workProjectTransition: {
    stripFadeDuration: 0.6,
    stripFadeEase: "power3.in",
    cameraDownDuration: 0.9,
    cameraDownEase: "power3.in",
    overlayInDuration: 0.55,
    overlayInEase: "power2.inOut",
    overlayOutDuration: 0.85,
    overlayOutEase: "power2.out",
    bgReadyTimeoutMs: 1500,
  },
} as const;
