import { useEffect, useLayoutEffect, useRef } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import SiteLayout from "./layout/Site";
import MainPage from "./routes/Main";
import WorkPage from "./routes/Work";
import ContactPage from "./routes/Contact";
import ProjectDetailPage from "./routes/Project";
import ArchivePage from "./routes/Archive";
import { setNavigateHandler } from "./lib/nav";
import { startWorkTexturePreload } from "./lib/work-preload";
import { getRouteNamespace } from "./lib/route";
import { hideAllRegisteredPageText, showAllRegisteredPageText } from "./lib/text";
import { destroyLenis, initLenis } from "./lib/lenis-scroll";

const TITLES: Record<string, string> = {
  main: "Naman Pratulya",
  work: "Naman Pratulya | Work",
  contact: "Naman Pratulya | Contact",
  archive: "Naman Pratulya | Archive",
  projectDetail: "Naman Pratulya | money.me",
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

    if (namespace === "projectDetail") {
      initLenis();
    } else {
      destroyLenis();
    }

    return () => {
      document.body.classList.remove("page-wrap--scrollable");
      destroyLenis();
    };
  }, [namespace]);

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
        <Route path="/money-me" element={<ProjectDetailPage />} />
        <Route path="*" element={<MainPage />} />
      </Route>
    </Routes>
  );
}
