import React from "react";
import ProjectDetailsPageShell from "../projectDetail/ProjectDetailsPageShell.jsx";
import { projectDetailsCaseStudyContent } from "../projectDetail/filmCaseStudyContent.js";

export default function FilmPage() {
  return <ProjectDetailsPageShell {...projectDetailsCaseStudyContent} />;
}
