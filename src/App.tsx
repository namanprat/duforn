import { useEffect, useLayoutEffect, useRef } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import SiteLayout from "./layout/Site";
import MainPage from "./routes/Main";
import WorkPage from "./routes/Work";
import ContactPage from "./routes/Contact";
import CaseStudyPage from "./projectDetail/CaseStudyPage";
import { getCaseStudyTitle } from "./content/projects";
import ArchivePage from "./routes/Archive";
import { setNavigateHandler } from "./lib/nav";
import { startWorkTexturePreload } from "./lib/work-preload";
import { getRouteNamespace } from "./lib/route";
import { hideAllRegisteredPageText, showAllRegisteredPageText } from "./lib/text";
import {
  runArchiveRouteTransition,
  shouldUseDissolveTransition,
} from "./store/routeTransition";
import { destroyLenis, initLenis } from "./lib/lenis-scroll";

const TITLES: Record<string, string> = {
  main: "Naman Pratulya",
  work: "Naman Pratulya | Work",
  contact: "Naman Pratulya | Contact",
  archive: "Naman Pratulya | Archive",
};

function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const namespace = getRouteNamespace(location.pathname);
  const transitionRef = useRef(false);

  useEffect(() => {
    setNavigateHandler(async (path) => {
      if (transitionRef.current) return;
      const nextPath = path.startsWith("/") ? path : `/${path}`;
      if (nextPath === location.pathname) return;

      transitionRef.current = true;
      try {
        if (shouldUseDissolveTransition(location.pathname, nextPath)) {
          await runArchiveRouteTransition(location.pathname, nextPath, navigate);
        } else {
          await Promise.race([
            hideAllRegisteredPageText(),
            new Promise<void>((resolve) => window.setTimeout(resolve, 1200)),
          ]);
          navigate(nextPath);
        }
      } finally {
        transitionRef.current = false;
      }
    });
    return () => setNavigateHandler(null);
  }, [navigate, location.pathname]);

  useLayoutEffect(() => {
    const projectTitle = getCaseStudyTitle(location.pathname);
    document.title =
      projectTitle != null
        ? `Naman Pratulya | ${projectTitle}`
        : (TITLES[namespace] ?? TITLES.main);
    document.body.classList.add("page-wrap");
    document.body.classList.toggle("page-wrap--scrollable", namespace === "projectDetail");

    const themeColor = document.querySelector('meta[name="theme-color"]');
    themeColor?.setAttribute("content", namespace === "projectDetail" ? "#c3c3c3" : "#000000");

    if (namespace === "projectDetail") {
      initLenis();
    } else {
      destroyLenis();
    }

    return () => {
      document.body.classList.remove("page-wrap--scrollable");
      destroyLenis();
    };
  }, [namespace, location.pathname]);

  useEffect(() => {
    if (namespace !== "projectDetail") return undefined;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        void showAllRegisteredPageText();
      });
    });
    return () => cancelAnimationFrame(id);
  }, [namespace]);

  useEffect(() => {
    startWorkTexturePreload().catch(() => {});
  }, []);

  return <SiteLayout />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<MainPage />} />
        <Route path="/work" element={<WorkPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/archive" element={<ArchivePage />} />
        <Route path="/money-me" element={<CaseStudyPage />} />
        <Route path="/haptic" element={<CaseStudyPage />} />
        <Route path="*" element={<MainPage />} />
      </Route>
    </Routes>
  );
}
