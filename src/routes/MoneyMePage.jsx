import React from "react";
import ProjectDetailsPageShell from "../projectDetail/ProjectDetailsPageShell.jsx";
import { moneyMeProjectDetailsContent } from "../projectDetail/moneyMeCaseStudyContent.js";

export default function MoneyMePage() {
  return (
    <>
      <ProjectDetailsPageShell {...moneyMeProjectDetailsContent} />
    </>
  );
}
