import React from "react";
import ProjectDetailsPageShell from "../projectDetail/ProjectDetailsPageShell.jsx";
import { projectDetailContent } from "../projectDetail/projectDetailContent.js";

export default function ProjectDetailPage() {
  return (
    <>
      <ProjectDetailsPageShell {...projectDetailContent} />
    </>
  );
}
