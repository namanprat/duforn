import { useEffect, useLayoutEffect, useRef } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SiteLayout from "./layout/Site";
import MainPage from "./routes/Main";
import WorkPage from "./routes/Work";
import ContactPage from "./routes/Contact";
import ProjectDetailPage from "./routes/Project";
import ArchivePage from "./routes/Archive";
import { setNavigateHandler } from "./lib/nav";
import { startWorkTexturePreload } from "./lib/work-preload";
import { getRouteNamespace } from "./lib/route";
import { hideAllRegisteredPageText } from "./lib/text";
import { destroyLenis, initLenis } from "./lib/lenis-scroll";

const TITLES: Record<string, string> = {
  main: "Duforn",
  work: "Duforn | Work",
  contact: "Duforn | Contact",
  archive: "Duforn | Archive",
  projectDetail: "Duforn | money.me",
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
        await hideAllRegisteredPageText();
        navigate(nextPath);
      } finally {
        transitionRef.current = false;
      }
    });
    return () => setNavigateHandler(null);
  }, [navigate, location.pathname]);

  useLayoutEffect(() => {
    document.title = TITLES[namespace] ?? TITLES.main;
    document.body.classList.add("page-wrap");
    document.body.classList.toggle("page-wrap--scrollable", namespace === "projectDetail");
    return () => {
      document.body.classList.remove("page-wrap--scrollable");
    };
  }, [namespace]);

  useEffect(() => {
    if (namespace === "projectDetail") {
      initLenis();
      ScrollTrigger.refresh();
    } else {
      destroyLenis();
    }

    return () => {
      destroyLenis();
    };
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
        <Route path="/money-me" element={<ProjectDetailPage />} />
        <Route path="*" element={<MainPage />} />
      </Route>
    </Routes>
  );
}
