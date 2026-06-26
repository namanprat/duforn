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
    // Box morph beats.
    boxOpen: 0.62,
    boxAbout: 0.9,
    line: 0.55,
    lineStagger: 0.07,
    lineFlipScale: 0.75,
    // Closing animations run 20% faster than their open counterparts.
    closeSpeedScale: 0.8,
    // Softer spring: closer to line power3 motion, less post-settle overshoot.
    boxOpenEase: "back.out(1.04)",
    boxShrinkEase: "back.in(1.04)",
    ease: "power3.out",
    closeEase: "power3.in",
    aboutRevealDelay: 0.1,
  },
} as const;
