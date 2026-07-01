import { useLocation } from "react-router-dom";
import { SWATCH_DARK } from "../lib/siteColors";
import { getCaseStudy } from "../content/projects";
import ProjectStripScene from "./ProjectStripScene";

/** Mounts strip gallery only when the active case study defines stripPaths. */
export default function ProjectStripSceneGate() {
  const { pathname } = useLocation();
  const caseStudy = getCaseStudy(pathname);
  const stripPaths = caseStudy?.stripPaths;

  if (!stripPaths?.length) return null;

  return <ProjectStripScene stripPaths={stripPaths} stripBg={caseStudy.stripBg ?? SWATCH_DARK} />;
}
