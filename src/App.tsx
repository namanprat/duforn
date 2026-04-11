// @ts-nocheck
import React from "react";
import { Route, Routes, useLocation, useOutlet } from "react-router-dom";

import SiteLayout from "./components/layout/SiteLayout";
import HomePage from "./routes/HomePage";
import WorkPage from "./routes/WorkPage";
import ContactPage from "./routes/ContactPage";
import ArchivePage from "./routes/ArchivePage";
import ProjectDetailPage from "./routes/ProjectDetailPage";
import NotFoundPage from "./routes/NotFoundPage";
import TestPage from "./routes/TestPage";

import { useClock } from "./hooks/useClock";
import { usePreloaderRouteReveal } from "./hooks/usePreloaderRouteReveal";
import { useNavigationTransitions } from "./hooks/useNavigationTransitions";

function AppShell() {
  const location = useLocation();
  const outlet = useOutlet();

  useClock();
  useNavigationTransitions(location.pathname);
  usePreloaderRouteReveal(location.pathname);

  return <SiteLayout>{outlet}</SiteLayout>;
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/work" element={<WorkPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/archive" element={<ArchivePage />} />
        <Route path="/money-me" element={<ProjectDetailPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
