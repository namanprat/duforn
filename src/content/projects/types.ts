export type StorySection = { heading: string; body: readonly string[] };

export type InlineMedia =
  | { type: "image"; src: string; alt?: string }
  | { type: "video"; src: string };

/** Inserted after the story section at `afterSectionIndex` (0-based). */
export type InlineMediaBlock = InlineMedia & { afterSectionIndex: number };

export type CaseStudyContent = {
  slug: string;
  title: string;
  overview: string;
  services: readonly string[];
  storySections: readonly StorySection[];
  coverSrc: string;
  /** money.me only — Haptic omits this (no strip gallery). */
  stripPaths?: readonly string[];
  stripBg?: string;
  /** Haptic uses this to place all remaining folder assets. */
  inlineMedia?: readonly InlineMediaBlock[];
};
