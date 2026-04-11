import React from "react";
import ProjectDetailsPageShell from "../projectDetail/ProjectDetailsPageShell";
import { projectDetailContent } from "../projectDetail/projectDetailContent";

export default function ProjectDetailPage() {
  return (
    <>
      <ProjectDetailsPageShell {...projectDetailContent} />
    </>
  );
}
