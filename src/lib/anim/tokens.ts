export const MOTION_TOKENS = {
  textReveal: {
    revealDuration: 1,
    revealStagger: 0.1,
    hideDuration: 0.55,
    hideStagger: 0.06,
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
} as const;
