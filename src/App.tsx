// @ts-nocheck
import React, { useEffect, useLayoutEffect, useRef } from "react";
import { Route, Routes, useLocation, useNavigate, useOutlet } from "react-router-dom";

import SiteLayout from "./layout/Site";
import MainPage from "./routes/Main";
import WorkPage from "./routes/Work";
import ContactPage from "./routes/Contact";
import AboutPage from "./routes/About";
import ProjectDetailPage from "./routes/Project";
import NotFoundPage from "./routes/NotFound";
import TestPage from "./routes/Test";
import ViewerPage from "./routes/Viewer";
import { useWebglStore } from "./store/webgl";
import { initLinkHover, destroyLinkHover } from "../scripts/link-hover";
import { initButtonHoverScale, destroyButtonHoverScale } from "../scripts/button-hover-scale";
import { initLenis, destroyLenis } from "../scripts/lenis-scroll";
import { setNavigateHandler } from "./lib/nav";
import {
  shouldAnimateCanvasBetweenNamespaces,
  runRouteEnterTransition,
  runRouteLeaveTransition,
} from "./lib/anim/route";
import { cleanupBrandHandoff, runBrandHandoff } from "./lib/anim/brandHandoff";
import { canvasInk } from "./lib/ink/transition";
import { CANVAS_INK_ROUTE_TIMING, shouldUseRouteInkBleed } from "./lib/ink/route";
import { hideAllRegisteredPageText } from "./lib/text";
import { PRELOADER_DISMISSED_EVENT } from "./lib/preload/events";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const TITLES = {
  "/": "Duforn",
  "/work": "Duforn | Work",
  "/contact": "Duforn | Contact",
  "/about": "Duforn | About",
  "/money-me": "Duforn | money.me Project Details",
  "/404": "Duforn | 404",
  "/test": "Duforn | Water Test",
  "/viewer": "Duforn | Viewer",
};

const PATH_TO_NAMESPACE = {
  "/": "main",
  "/work": "work",
  "/contact": "contact",
  "/about": "about",
  "/money-me": "projectDetail",
  "/404": "notFound",
  "/test": "test",
  "/viewer": "viewer",
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
  document.body.classList.toggle(
    "page-wrap--scrollable",
    namespace === "projectDetail" || namespace === "about",
  );
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
          // Ink bleed only for about / 404; other routes use canvas leave tween.
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

export function AppShell() {
  const location = useLocation();
  const outlet = useOutlet();
  const setActivePage = useWebglStore((s) => s.setActivePage);
  const currentPath = normalizePath(location.pathname);
  const previousPathRef = useRef(currentPath);
  const namespace = getNamespace(currentPath);

  useClock();

  useLayoutEffect(() => {
    setActivePage(namespace);
  }, [namespace, setActivePage]);

  useEffect(() => {
    const onPreloaderDismissed = () => {
      ScrollTrigger.refresh();
      window.__refreshLinkHover?.();
    };

    window.addEventListener(PRELOADER_DISMISSED_EVENT, onPreloaderDismissed);
    return () => {
      window.removeEventListener(PRELOADER_DISMISSED_EVENT, onPreloaderDismissed);
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

    if (namespace === "projectDetail" || namespace === "about") initLenis();
    else destroyLenis();

    let stopEnterTween = () => {};
    let cancelled = false;
    let preloaderEnterHandler = null;
    const isActiveRun = () => !cancelled && normalizePath(window.location.pathname) === currentPath;

    const finishRouteEnter = () => {
      if (!isActiveRun()) return;

      stopEnterTween = runRouteEnterTransition({
        canvasElement: shouldAnimateCanvas
          ? document.querySelector('[data-active-canvas="true"]')
          : null,
      });

      ScrollTrigger.refresh();
      window.__refreshLinkHover?.();
    };

    const runEnterSequence = async () => {
      await runBrandHandoff({ fromNamespace: previousNamespace, toNamespace: namespace });
      if (!isActiveRun()) return;

      if (document.body.classList.contains("preloader-active")) {
        preloaderEnterHandler = () => {
          window.removeEventListener(PRELOADER_DISMISSED_EVENT, preloaderEnterHandler);
          preloaderEnterHandler = null;
          finishRouteEnter();
        };
        window.addEventListener(PRELOADER_DISMISSED_EVENT, preloaderEnterHandler);
        return;
      }

      finishRouteEnter();
    };

    runEnterSequence();

    return () => {
      cancelled = true;
      if (preloaderEnterHandler) {
        window.removeEventListener(PRELOADER_DISMISSED_EVENT, preloaderEnterHandler);
        preloaderEnterHandler = null;
      }
      stopEnterTween();
      destroyLenis();
      cleanupBrandHandoff();
    };
  }, [currentPath, namespace]);

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
        <Route path="/" element={<MainPage />} />
        <Route path="/work" element={<WorkPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/money-me" element={<ProjectDetailPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/viewer" element={<ViewerPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
