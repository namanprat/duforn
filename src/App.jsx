import React, { useEffect, useRef } from "react";
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";

import SiteLayout from "./components/layout/SiteLayout.jsx";
import HomePage from "./routes/HomePage.jsx";
import RiverPage from "./routes/RiverPage.jsx";
import WorkPage from "./routes/WorkPage.jsx";
import ContactPage from "./routes/ContactPage.jsx";
import ArchivePage from "./routes/ArchivePage.jsx";
import FilmPage from "./routes/FilmPage.jsx";

import { useWebglStore } from "./store/webgl.js";
import { initMenu, destroyMenu } from "../scripts/menu.js";
import { initLinkHover, destroyLinkHover } from "../scripts/link-hover.js";
import { animateRevealEnter, cleanupSplits, prepareRevealHidden } from "../scripts/text-reveal.js";
import { initLenis, destroyLenis } from "../scripts/lenis-scroll.js";
import { startWorkTexturePreload } from "../scripts/work-preload.js";
import { setNavigateHandler } from "./lib/navigationBridge.js";
import { runRouteEnterTransition } from "./lib/animation/routeTransition.js";
import { cleanupBrandHandoff, runBrandHandoff } from "./lib/animation/brandHandoffTransition.js";
import { preloader } from "../scripts/preloader.js";

const TITLES = {
  "/": "Duforn | Home",
  "/river": "Duforn | River",
  "/work": "Duforn | Work",
  "/contact": "Duforn | Contact",
  "/archive": "Duforn | Archive",
  "/film": "Duforn | Project",
};

const PATH_TO_NAMESPACE = {
  "/": "home",
  "/river": "river",
  "/work": "work",
  "/contact": "contact",
  "/archive": "archive",
  "/film": "film",
};

function normalizePath(pathname) {
  // Strip trailing slashes so "/river/" matches "/river".
  const cleaned = pathname.replace(/\/\/+$/, "");
  return cleaned === "" ? "/" : cleaned;
}

function getNamespace(pathname) {
  return PATH_TO_NAMESPACE[normalizePath(pathname)] || "home";
}

function applyBodyRouteClasses(namespace) {
  document.body.classList.add("page-wrap");
  document.body.classList.toggle("page-wrap--archive", namespace === "archive");
  document.body.classList.toggle("page-wrap--scrollable", namespace === "film");
  document.body.classList.toggle("brand-home", namespace === "home");
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

  useEffect(() => {
    setNavigateHandler((path) => navigate(path));
    return () => setNavigateHandler(null);
  }, [navigate]);

  return null;
}

function AppShell() {
  const location = useLocation();
  const contentRef = useRef(null);
  const previousNamespaceRef = useRef(getNamespace(location.pathname));
  const setActivePage = useWebglStore((s) => s.setActivePage);
  const preloaderPromiseRef = useRef(null);

  useClock();

  useEffect(() => {
    let cancelled = false;
    let rafId = 0;

    const refreshLinkHover = () => {
      document.fonts.ready.then(() => {
        if (cancelled) return;
        destroyLinkHover();
        rafId = requestAnimationFrame(() => {
          if (cancelled) return;
          initLinkHover();
        });
      });
    };

    refreshLinkHover();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      destroyLinkHover();
    };
  }, [location.pathname]);

  useEffect(() => {
    preloaderPromiseRef.current = preloader.init();
    startWorkTexturePreload();
    document.fonts.ready.then(() => {
      initMenu();
    });

    return () => {
      destroyLenis();
      cleanupSplits();
      cleanupBrandHandoff();
      destroyMenu();
    };
  }, []);

  useEffect(() => {
    const currentPath = normalizePath(location.pathname);
    document.title = TITLES[currentPath] || "Duforn";
    const namespace = getNamespace(currentPath);
    const previousNamespace = previousNamespaceRef.current;
    applyBodyRouteClasses(namespace);
    runBrandHandoff({ fromNamespace: previousNamespace, toNamespace: namespace });
    previousNamespaceRef.current = namespace;
    setActivePage(namespace);

    // Lenis for film only
    if (namespace === "film") initLenis();
    else destroyLenis();

    const stopEnterTween = runRouteEnterTransition(contentRef.current);
    const container = document.querySelector('[data-page-container="true"]');
    let cancelled = false;

    const REVEAL_OPTS = { excludeSelector: ".home-hero-brand" };

    function runReveal(c) {
      const live = c ?? document.querySelector('[data-page-container="true"]');
      if (live && !cancelled) animateRevealEnter(live, REVEAL_OPTS);
    }

    if (preloader.isBlocking()) {
      // Preloader is active: wait for fonts → preloader exit → animate
      const p = preloaderPromiseRef.current ?? Promise.resolve();
      const prepare = container ? prepareRevealHidden(container, REVEAL_OPTS) : Promise.resolve();
      // Chain: fonts ready (in prepare) → preloader exits (p) → animate
      prepare.then(() => p).then(() => runReveal(null));
    } else {
      // No preloader (return visit or navigation): hide first, then animate.
      const prepare = container ? prepareRevealHidden(container, REVEAL_OPTS) : Promise.resolve();
      prepare.then(() => {
        if (!cancelled) runReveal(null);
      });
    }

    return () => {
      cancelled = true;
      stopEnterTween();
      cleanupBrandHandoff();
      cleanupSplits();
      destroyLenis();
    };
  }, [location.pathname, setActivePage]);

  return (
    <>
      <NavigationBridge />
      <SiteLayout>
        <div ref={contentRef}>
          <Outlet />
        </div>
      </SiteLayout>
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/river" element={<RiverPage />} />
        <Route path="/work" element={<WorkPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/archive" element={<ArchivePage />} />
        <Route path="/film" element={<FilmPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
