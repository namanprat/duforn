import { useEffect, useRef } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import SiteLayout from './components/layout/SiteLayout.jsx';
import HomePage from './routes/HomePage.jsx';
import WorkPage from './routes/WorkPage.jsx';
import ContactPage from './routes/ContactPage.jsx';
import ArchivePage from './routes/ArchivePage.jsx';
import FilmPage from './routes/FilmPage.jsx';

import webgl, { destroyWebgl, isWebglRunning, setScenePage, setBaseSceneOverlayMode, setBaseSceneVisibility, swapModel } from '../scripts/three.js';
import { initMenu, destroyMenu } from '../scripts/menu.js';
import { initLinkHover, destroyLinkHover } from '../scripts/link-hover.js';
import { animateRevealEnter, cleanupSplits } from '../scripts/text-reveal.js';
import { initLenis, destroyLenis } from '../scripts/lenis-scroll.js';
import { initWork, destroyWork, startWorkTexturePreload } from '../scripts/work.js';
import { initArchive, destroyArchive } from '../scripts/archive.js';
import { initFilm, destroyFilm, bindFilmTemplateFromTransitionState } from '../scripts/project-canvas.js';
import { setNavigateHandler } from './lib/navigationBridge.js';
import { runRouteEnterTransition } from './lib/animation/routeTransition.js';
import { preloader } from '../scripts/preloader.js';

const TITLES = {
  '/': 'Duforn | Home',
  '/work': 'Duforn | Work',
  '/contact': 'Duforn | Contact',
  '/archive': 'Duforn | Archive',
  '/film': 'Duforn | Project',
};

const PATH_TO_NAMESPACE = {
  '/': 'home',
  '/work': 'work',
  '/contact': 'contact',
  '/archive': 'archive',
  '/film': 'film',
};

function getNamespace(pathname) {
  return PATH_TO_NAMESPACE[pathname] || 'home';
}

function applyBodyRouteClasses(namespace) {
  document.body.classList.add('page-wrap');
  document.body.classList.toggle('page-wrap--archive', namespace === 'archive');
  document.body.classList.toggle('page-wrap--scrollable', namespace === 'film');
}

function useClock() {
  useEffect(() => {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Kolkata',
    });

    const tick = () => {
      const node = document.getElementById('time');
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

  useClock();

  useEffect(() => {
    preloader.init();
    startWorkTexturePreload();
    document.fonts.ready.then(() => {
      initMenu();
      initLinkHover();
    });

    return () => {
      destroyFilm();
      destroyArchive();
      destroyWork();
      destroyLenis();
      destroyWebgl();
      cleanupSplits();
      destroyLinkHover();
      destroyMenu();
    };
  }, []);

  useEffect(() => {
    const currentPath = location.pathname;
    document.title = TITLES[currentPath] || 'Duforn';
    const namespace = getNamespace(currentPath);
    applyBodyRouteClasses(namespace);

    const stopEnterTween = runRouteEnterTransition(contentRef.current);
    const container = document.querySelector('[data-page-container="true"]');
    if (container) animateRevealEnter(container);

    const ensureWebgl = () => {
      if (!isWebglRunning()) webgl();
    };

    const pageSetup = {
      home: async () => {
        destroyFilm();
        destroyArchive();
        destroyWork();
        destroyLenis();
        setBaseSceneOverlayMode(false);
        ensureWebgl();
        setBaseSceneVisibility(true);
        setScenePage('home', false);
        await swapModel('home');
      },
      contact: async () => {
        destroyFilm();
        destroyArchive();
        destroyWork();
        destroyLenis();
        ensureWebgl();
        setBaseSceneOverlayMode(false);
        setBaseSceneVisibility(true);
        setScenePage('contact', false);
        await swapModel('home');
      },
      work: async () => {
        destroyFilm();
        destroyArchive();
        destroyLenis();
        ensureWebgl();
        setBaseSceneOverlayMode(false);
        setBaseSceneVisibility(true);
        setScenePage('work', true);
        await swapModel('work');
        await initWork();
      },
      archive: async () => {
        destroyFilm();
        destroyWork();
        destroyLenis();
        if (isWebglRunning()) destroyWebgl();
        await initArchive();
      },
      film: async () => {
        destroyArchive();
        destroyWork();
        if (isWebglRunning()) destroyWebgl();
        initLenis();
        bindFilmTemplateFromTransitionState(container);
        await initFilm(container);
      },
    };

    const setup = pageSetup[namespace] || pageSetup.home;
    setup();

    return () => {
      stopEnterTween();
      cleanupSplits();
      const pageCleanup = {
        work: () => destroyWork(),
        archive: () => destroyArchive(),
        film: () => {
          destroyFilm();
          destroyLenis();
        },
      };
      pageCleanup[namespace]?.();
    };
  }, [location.pathname]);

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
        <Route path="/work" element={<WorkPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/archive" element={<ArchivePage />} />
        <Route path="/film" element={<FilmPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
