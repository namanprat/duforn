// @ts-nocheck
import React, { useEffect, useRef } from "react";
import { Route, Routes, useLocation, useNavigate, useOutlet } from "react-router-dom";

import SiteLayout from "./components/layout/SiteLayout";
import HomePage from "./routes/HomePage";
import WorkPage from "./routes/WorkPage";
import ContactPage from "./routes/ContactPage";
import ArchivePage from "./routes/ArchivePage";
import ProjectDetailPage from "./routes/ProjectDetailPage";
import NotFoundPage from "./routes/NotFoundPage";
import TestPage from "./routes/TestPage";
import { useWebglStore } from "./store/webgl";
import { initLinkHover, destroyLinkHover } from "../scripts/link-hover";
import { initButtonHoverScale, destroyButtonHoverScale } from "../scripts/button-hover-scale";
import { initLenis, destroyLenis } from "../scripts/lenis-scroll";
import { setNavigateHandler } from "./lib/navigationBridge";
import {
  shouldAnimateCanvasBetweenNamespaces,
  runRouteEnterTransition,
  runRouteLeaveTransition,
} from "./lib/animation/routeTransition";
import { cleanupBrandHandoff, runBrandHandoff } from "./lib/animation/brandHandoffTransition";
import { canvasInk } from "./lib/fx/canvasInkTransition";
import { CANVAS_INK_ROUTE_TIMING, shouldUseRouteInkBleed } from "./lib/canvasInkRoute";
import { hideAllRegisteredPageText } from "./lib/textReveal/textRevealRegistry";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const TITLES = {
  "/": "Duforn | Home",
  "/work": "Duforn | Work",
  "/contact": "Duforn | Contact",
  "/archive": "Duforn | Archive",
  "/money-me": "Duforn | money.me Project Details",
  "/404": "Duforn | 404",
  "/test": "Duforn | Test",
};

const PATH_TO_NAMESPACE = {
  "/": "home",
  "/work": "work",
  "/contact": "contact",
  "/archive": "archive",
  "/money-me": "projectDetail",
  "/404": "notFound",
  "/test": "test",
};

function normalizePath(pathname) {
  const cleaned = pathname.replace(/\/+$/, "");
  return cleaned === "" ? "/" : cleaned;
}

function getNamespace(pathname) {
  return PATH_TO_NAMESPACE[normalizePath(pathname)] || "notFound";
}

function applyBodyRouteClasses(namespace) {
  document.body.classList.add("page-wrap");
  document.body.classList.toggle("page-wrap--scrollable", namespace === "projectDetail");
}

function useClock() {
  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata",
    });

    const tick = () => {
      const node = document.getElementById("time");
      if (node) node.textContent = `${formatter.format(new Date())} IST`;
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
}

function NavigationBridge() {
  const navigate = useNavigate();
  const location = useLocation();
  const transitionRef = useRef({ inFlight: false, targetPath: null });
  const currentPathRef = useRef(normalizePath(location.pathname));

  useEffect(() => {
    currentPathRef.current = normalizePath(location.pathname);
    if (
      transitionRef.current.inFlight &&
      transitionRef.current.targetPath === currentPathRef.current
    ) {
      transitionRef.current.inFlight = false;
      transitionRef.current.targetPath = null;
    }
  }, [location.pathname]);

  useEffect(() => {
    setNavigateHandler(async (path) => {
      const nextPath = normalizePath(path);
      const currentPath = currentPathRef.current;

      if (nextPath === currentPath) return;
      if (transitionRef.current.inFlight) return;

      transitionRef.current.inFlight = true;
      transitionRef.current.targetPath = nextPath;

      const currentNamespace = getNamespace(currentPath);
      const nextNamespace = getNamespace(nextPath);
      const canvasElement = shouldAnimateCanvasBetweenNamespaces(currentNamespace, nextNamespace)
        ? document.querySelector('[data-active-canvas="true"]')
        : null;

      const inkReady = canvasInk.isReady?.() ?? false;
      const useRouteInk = inkReady && shouldUseRouteInkBleed(currentPath, nextPath);

      try {
        await hideAllRegisteredPageText();

        if (useRouteInk) {
          // Ink bleed only for archive / 404; other routes use canvas leave tween.
          await canvasInk.enter({
            origin: { x: 0.5, y: 0.5 },
            expandMs: CANVAS_INK_ROUTE_TIMING.expandMs,
            holdMs: CANVAS_INK_ROUTE_TIMING.holdMs,
            collapseMs: CANVAS_INK_ROUTE_TIMING.collapseMs,
            onCovered: () => {
              navigate(nextPath);
            },
          });
        } else {
          await runRouteLeaveTransition({ canvasElement });
          navigate(nextPath);
        }
      } finally {
        const completed = currentPathRef.current === nextPath;
        if (completed || transitionRef.current.targetPath === nextPath) {
          transitionRef.current.inFlight = false;
          transitionRef.current.targetPath = null;
        }
      }
    });

    return () => setNavigateHandler(null);
  }, [navigate]);

  return null;
}

function AppShell() {
  const location = useLocation();
  const outlet = useOutlet();
  const setActivePage = useWebglStore((s) => s.setActivePage);
  const currentPath = normalizePath(location.pathname);
  const previousPathRef = useRef(currentPath);
  const namespace = getNamespace(currentPath);

  useClock();

  useEffect(() => {
    const onPreloaderDismissed = () => {
      window.__refreshLinkHover?.();
    };

    window.addEventListener("duforn:preloader-dismissed", onPreloaderDismissed);
    return () => {
      window.removeEventListener("duforn:preloader-dismissed", onPreloaderDismissed);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let rafId = 0;

    const refreshLinkHover = async () => {
      await document.fonts.ready;
      if (cancelled) return;
      destroyLinkHover();
      destroyButtonHoverScale();
      rafId = requestAnimationFrame(() => {
        if (cancelled) return;
        initLinkHover();
        initButtonHoverScale();
      });
    };

    window.__refreshLinkHover = refreshLinkHover;
    refreshLinkHover();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      destroyLinkHover();
      destroyButtonHoverScale();
      delete window.__refreshLinkHover;
    };
  }, []);

  useEffect(() => {
    return () => {
      destroyLenis();
      cleanupBrandHandoff();
    };
  }, []);

  useEffect(() => {
    document.title = TITLES[currentPath] || "Duforn | 404";
    const previousPath = previousPathRef.current;
    const previousNamespace = getNamespace(previousPath);
    const shouldAnimateCanvas = shouldAnimateCanvasBetweenNamespaces(previousNamespace, namespace);

    previousPathRef.current = currentPath;
    document.body.dataset.routePathname = currentPath;
    applyBodyRouteClasses(namespace);
    setActivePage(namespace);

    if (namespace === "projectDetail") initLenis();
    else destroyLenis();

    let stopEnterTween = () => {};
    let cancelled = false;
    const isActiveRun = () => !cancelled && normalizePath(window.location.pathname) === currentPath;

    const runEnterSequence = async () => {
      await runBrandHandoff({ fromNamespace: previousNamespace, toNamespace: namespace });
      if (!isActiveRun()) return;

      if (document.body.classList.contains("preloader-active")) return;

      stopEnterTween = runRouteEnterTransition({
        canvasElement: shouldAnimateCanvas
          ? document.querySelector('[data-active-canvas="true"]')
          : null,
      });

      ScrollTrigger.refresh();
      window.__refreshLinkHover?.();
    };

    runEnterSequence();

    return () => {
      cancelled = true;
      stopEnterTween();
      destroyLenis();
      cleanupBrandHandoff();
    };
  }, [location.pathname, setActivePage]);

  return (
    <>
      <NavigationBridge />
      <SiteLayout>{outlet}</SiteLayout>
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/work" element={<WorkPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/archive" element={<ArchivePage />} />
        <Route path="/money-me" element={<ProjectDetailPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
