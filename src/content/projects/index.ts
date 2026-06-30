import { hapticCaseStudy } from "./haptic";
import { moneyMeCaseStudy } from "./money-me";
import type { CaseStudyContent } from "./types";

const CASE_STUDIES: Record<string, CaseStudyContent> = {
  "/money-me": moneyMeCaseStudy,
  "/haptic": hapticCaseStudy,
};

export function getCaseStudy(pathname: string): CaseStudyContent | undefined {
  return CASE_STUDIES[pathname];
}

export function getCaseStudyTitle(pathname: string): string | undefined {
  return CASE_STUDIES[pathname]?.title;
}
