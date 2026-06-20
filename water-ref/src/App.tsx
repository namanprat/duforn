// @ts-nocheck
import React, { useEffect, useLayoutEffect, useRef } from "react";
import { Route, Routes, useLocation, useNavigate, useOutlet } from "react-router-dom";

import SiteLayout from "./layout/Site";
import MainPage from "./routes/Main";
import WorkPage from "./routes/Work";
import ContactPage from "./routes/Contact";
import ProjectDetailPage from "./routes/Project";
import NotFoundPage from "./routes/NotFound";
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
import { getRouteNamespace, normalizePath } from "./lib/route";
import { hideAllRegisteredPageText } from "./lib/text";
import { PRELOADER_DISMISSED_EVENT } from "./lib/preload/events";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const TITLES = {
  "/": "Duforn",
  "/work": "Duforn | Work",
  "/contact": "Duforn | Contact",
  "/money-me": "Duforn | money.me Project Details",
  "/404": "Duforn | 404",
};

function applyBodyRouteClasses(namespace) {
  document.body.classList.add("page-wrap");
  document.body.classList.toggle("page-wrap--scrollable", namespace === "projectDetail");
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

      const currentNamespace = getRouteNamespace(currentPath);
      const nextNamespace = getRouteNamespace(nextPath);
      const canvasElement = shouldAnimateCanvasBetweenNamespaces(currentNamespace, nextNamespace)
        ? document.querySelector('[data-active-canvas="true"]')
        : null;

      try {
        await hideAllRegisteredPageText();
        await runRouteLeaveTransition({ canvasElement });
        navigate(nextPath);
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
  const namespace = getRouteNamespace(currentPath);

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
    const previousNamespace = getRouteNamespace(previousPath);
    const shouldAnimateCanvas = shouldAnimateCanvasBetweenNamespaces(previousNamespace, namespace);

    previousPathRef.current = currentPath;
    document.body.dataset.routePathname = currentPath;
    applyBodyRouteClasses(namespace);

    if (namespace === "projectDetail") initLenis();
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
        <Route path="/money-me" element={<ProjectDetailPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
