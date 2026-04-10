import React, { useEffect, useRef } from "react";
import { Route, Routes, useLocation, useNavigate, useOutlet } from "react-router-dom";

import SiteLayout from "./components/layout/SiteLayout.jsx";
import HomePage from "./routes/HomePage.jsx";
import WorkPage from "./routes/WorkPage.jsx";
import ContactPage from "./routes/ContactPage.jsx";
import ArchivePage from "./routes/ArchivePage.jsx";
import ProjectDetailPage from "./routes/ProjectDetailPage.jsx";
import NotFoundPage from "./routes/NotFoundPage.jsx";
import TestPage from "./routes/TestPage.jsx";

import { useWebglStore } from "./store/webgl.js";
import { initLinkHover, destroyLinkHover } from "../scripts/link-hover.js";
import {
  prepareRouteReveal,
  runRouteEnter,
  runRouteLeave,
  initScrollReveals,
  destroyAllReveals,
} from "../scripts/text-reveal.js";
import { initLenis, destroyLenis } from "../scripts/lenis-scroll.js";
import { setNavigateHandler } from "./lib/navigationBridge.js";
import {
  shouldAnimateCanvasBetweenNamespaces,
  runRouteEnterTransition,
  runRouteLeaveTransition,
} from "./lib/animation/routeTransition.js";
import {
  crossesArchive,
  getArchiveBurnOverlay,
  setArchiveBurnSkipNextCanvasEnter,
  consumeArchiveBurnSkipNextCanvasEnter,
  getArchiveBurnMotionPrefs,
  waitForNextPaint,
} from "./lib/animation/archiveBurnRoute.js";
import { captureViewportSnapshot } from "./lib/animation/captureViewportSnapshot.js";
import { cleanupBrandHandoff, runBrandHandoff } from "./lib/animation/brandHandoffTransition.js";

/** Excludes handoff hero titles from route *leave* only (ghost / handoff owns outgoing hero). */
const BRAND_HANDOFF_SELECTOR = "[data-brand-handoff-title]";

const REVEAL_BODY_OPTS = { excludeSelector: BRAND_HANDOFF_SELECTOR };

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

const REVEAL_START_DELAY_MS = 400;
const REVEAL_SHORT_DELAY_MS = 80;

function normalizePath(pathname) {
  // Strip trailing slashes so route lookups stay stable.
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

function waitForRevealDelay(ms = REVEAL_START_DELAY_MS) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
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
      const pageElement = document.querySelector('[data-page-container="true"]');
      const canvasElement = shouldAnimateCanvasBetweenNamespaces(currentNamespace, nextNamespace)
        ? document.querySelector('[data-active-canvas="true"]')
        : null;

      const burnOverlay = getArchiveBurnOverlay();
      const useArchiveBurn = crossesArchive(currentNamespace, nextNamespace) && burnOverlay;

      try {
        if (useArchiveBurn) {
          let captured = null;
          try {
            captured = await captureViewportSnapshot({ root: document.body });
          } catch (err) {
            console.warn("[archive-burn] capture failed", err);
          }

          const overlay = getArchiveBurnOverlay();
          if (captured && overlay) {
            overlay.showFromCanvas(captured);
            try {
              await runRouteLeave(pageElement, { excludeSelector: BRAND_HANDOFF_SELECTOR });
              setArchiveBurnSkipNextCanvasEnter();
              navigate(nextPath);
              await waitForNextPaint();
              const motion = getArchiveBurnMotionPrefs();
              await overlay.playDissolve(motion);
            } finally {
              overlay.hide();
            }
          } else {
            await runRouteLeave(pageElement, { excludeSelector: BRAND_HANDOFF_SELECTOR });
            await runRouteLeaveTransition({ canvasElement });
            navigate(nextPath);
          }
        } else {
          await runRouteLeave(pageElement, { excludeSelector: BRAND_HANDOFF_SELECTOR });
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
    const onPreloaderDismissed = async (event) => {
      const dismissedPath = normalizePath(event?.detail?.pathname || window.location.pathname);
      const livePath = normalizePath(window.location.pathname);
      if (dismissedPath !== livePath) return;

      const container = document.querySelector('[data-page-container="true"]');
      if (!container) return;

      const prep = await prepareRouteReveal(container, REVEAL_BODY_OPTS);
      await waitForRevealDelay(
        prep?.hasRouteRevealTargets ? REVEAL_START_DELAY_MS : REVEAL_SHORT_DELAY_MS,
      );
      await runRouteEnter(container, {
        ...REVEAL_BODY_OPTS,
        skipEnterTitles: new Set(),
      });
      if (container.dataset.pageNamespace === "projectDetail") {
        initScrollReveals(container);
      }
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
      rafId = requestAnimationFrame(() => {
        if (cancelled) return;
        initLinkHover();
      });
    };

    window.__refreshLinkHover = refreshLinkHover;
    refreshLinkHover();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      destroyLinkHover();
      delete window.__refreshLinkHover;
    };
  }, []);

  useEffect(() => {
    return () => {
      destroyLenis();
      destroyAllReveals();
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

    // Lenis for project detail pages only
    if (namespace === "projectDetail") initLenis();
    else destroyLenis();

    let stopEnterTween = () => {};
    let cancelled = false;

    const runEnterSequence = async () => {
      const skipCanvasEnter = consumeArchiveBurnSkipNextCanvasEnter();

      const container = document.querySelector('[data-page-container="true"]');
      if (!container) {
        await runBrandHandoff({ fromNamespace: previousNamespace, toNamespace: namespace });
        window.__refreshLinkHover?.();
        return;
      }

      const prep = await prepareRouteReveal(container, REVEAL_BODY_OPTS);
      if (cancelled) return;

      const skipEnterTitles = await runBrandHandoff({
        fromNamespace: previousNamespace,
        toNamespace: namespace,
      });
      if (cancelled) return;

      if (document.body.classList.contains("preloader-active")) {
        return;
      }

      if (!skipCanvasEnter) {
        stopEnterTween = runRouteEnterTransition({
          canvasElement: shouldAnimateCanvas
            ? document.querySelector('[data-active-canvas="true"]')
            : null,
        });
      }

      await waitForRevealDelay(
        prep?.hasRouteRevealTargets ? REVEAL_START_DELAY_MS : REVEAL_SHORT_DELAY_MS,
      );
      if (cancelled) return;

      const live = document.querySelector('[data-page-container="true"]') ?? container;
      await runRouteEnter(live, {
        ...REVEAL_BODY_OPTS,
        skipEnterTitles: skipEnterTitles ?? new Set(),
      });
      if (cancelled) return;

      window.__refreshLinkHover?.();
      if (namespace === "projectDetail" && live) {
        initScrollReveals(live);
      }
    };

    runEnterSequence();

    return () => {
      cancelled = true;
      stopEnterTween();
      destroyAllReveals();
      destroyLenis();
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
