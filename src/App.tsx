import { lazy, Suspense, useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import SiteLayout from "./layout/Site";
import { setNavigateHandler } from "./lib/nav";
import { getRouteNamespace } from "./lib/route";
import { showAllRegisteredPageText } from "./lib/text";
import {
  runArchiveLiveWipeTransition,
  runRoomCameraRouteTransition,
  shouldUseArchiveLiveWipe,
  shouldUseRoomCameraTransition,
} from "./store/routeTransition";
import {
  isWorkProjectTransitionActive,
  runProjectToWorkTransition,
  runWorkToProjectTransition,
  shouldUseProjectWorkTransition,
} from "./store/workProjectTransition";
import { destroyLenis, initLenis } from "./lib/lenis-scroll";
import { PROJECT_DETAIL_SWATCH, SWATCH_DARK } from "./lib/siteColors";

const MainPage = lazy(() => import("./routes/Main"));
const WorkPage = lazy(() => import("./routes/Work"));
const ContactPage = lazy(() => import("./routes/Contact"));
const ArchivePage = lazy(() => import("./routes/Archive"));
const CaseStudyPage = lazy(() => import("./projectDetail/CaseStudyPage"));

const TITLES: Record<string, string> = {
  main: "Naman Pratulya",
  work: "Naman Pratulya | Work",
  contact: "Naman Pratulya | Contact",
  archive: "Naman Pratulya | Archive",
};

const CASE_STUDY_TITLES: Record<string, string> = {
  "/money-me": "money.me",
  "/haptic": "Haptic",
};

function RouteChunk({ children }: { children: ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}

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
        if (shouldUseProjectWorkTransition(location.pathname, nextPath)) {
          if (getRouteNamespace(nextPath) === "projectDetail") {
            await runWorkToProjectTransition(nextPath, navigate);
          } else {
            await runProjectToWorkTransition(location.pathname, navigate);
          }
        } else if (shouldUseRoomCameraTransition(location.pathname, nextPath)) {
          await runRoomCameraRouteTransition(nextPath, navigate);
        } else if (shouldUseArchiveLiveWipe(location.pathname, nextPath)) {
          await runArchiveLiveWipeTransition(location.pathname, nextPath, navigate);
        } else {
          navigate(nextPath);
        }
      } finally {
        transitionRef.current = false;
      }
    });
    return () => setNavigateHandler(null);
  }, [navigate, location.pathname]);

  useLayoutEffect(() => {
    const projectTitle = CASE_STUDY_TITLES[location.pathname];
    document.title =
      projectTitle != null
        ? `Naman Pratulya | ${projectTitle}`
        : (TITLES[namespace] ?? TITLES.main);
    document.body.classList.add("page-wrap");

    const transitionActive = isWorkProjectTransitionActive();
    if (!transitionActive) {
      document.body.classList.toggle("page-wrap--scrollable", namespace === "projectDetail");

      const themeColor = document.querySelector('meta[name="theme-color"]');
      themeColor?.setAttribute(
        "content",
        namespace === "projectDetail" ? PROJECT_DETAIL_SWATCH : SWATCH_DARK,
      );

      if (namespace === "projectDetail") {
        initLenis();
      } else {
        destroyLenis();
      }
    }

    return () => {
      if (!isWorkProjectTransitionActive()) {
        document.body.classList.remove("page-wrap--scrollable");
        destroyLenis();
      }
    };
  }, [namespace, location.pathname]);

  useEffect(() => {
    if (namespace !== "projectDetail") return undefined;
    if (isWorkProjectTransitionActive()) return undefined;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        void showAllRegisteredPageText();
      });
    });
    return () => cancelAnimationFrame(id);
  }, [namespace]);

  return <SiteLayout />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route
          path="/"
          element={
            <RouteChunk>
              <MainPage />
            </RouteChunk>
          }
        />
        <Route
          path="/work"
          element={
            <RouteChunk>
              <WorkPage />
            </RouteChunk>
          }
        />
        <Route
          path="/contact"
          element={
            <RouteChunk>
              <ContactPage />
            </RouteChunk>
          }
        />
        <Route
          path="/archive"
          element={
            <RouteChunk>
              <ArchivePage />
            </RouteChunk>
          }
        />
        <Route
          path="/money-me"
          element={
            <RouteChunk>
              <CaseStudyPage />
            </RouteChunk>
          }
        />
        <Route
          path="/haptic"
          element={
            <RouteChunk>
              <CaseStudyPage />
            </RouteChunk>
          }
        />
        <Route
          path="*"
          element={
            <RouteChunk>
              <MainPage />
            </RouteChunk>
          }
        />
      </Route>
    </Routes>
  );
}
