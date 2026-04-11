// @ts-nocheck
/**
 * Site-wide scale for text reveal animations (route enter/leave, scroll reveals,
 * brand handoff chars, link hover char stagger). Values > 1 mean slower motion.
 * 1/0.75 ≈ 1.33× duration and stagger spacing vs the baseline timings.
 */
export const REVEAL_TEXT_TIME_SCALE = 1 / 0.75;
