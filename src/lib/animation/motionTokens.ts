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
    // Box morph durations. Open/close share the same base; larger expand/shrink use expandScale.
    openDuration: 0.62,
    closeDuration: 0.62,
    aboutDuration: 0.6,
    expandScale: 1.5,
    // Closing animations run 20% faster than their open counterparts.
    closeSpeedScale: 0.8,
    // Dynamic-Island spring: overshoot on grow, mirrored settle on shrink.
    boxOpenEase: "back.out(1.1)",
    boxShrinkEase: "back.in(1.1)",
    boxEase: "back.out(1.1)",
    // Staggered menu line reveal.
    ease: "power3.out",
    closeEase: "power3.in",
    lineStagger: 0.07,
    lineDuration: 0.55,
    // Delay before About-panel content reveal kicks in (used by AboutPanel).
    aboutRevealDelay: 0.1,
  },
} as const;
