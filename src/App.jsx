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
import { cleanupBrandHandoff, runBrandHandoff } from './lib/animation/brandHandoffTransition.js';
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
  document.body.classList.toggle('brand-home', namespace === 'home');
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

function ensureWebglRuntime() {
  if (!isWebglRunning()) webgl();
}

function destroySharedPages() {
  destroyFilm();
  destroyArchive();
  destroyWork();
  destroyLenis();
}

function destroyNonFilmPages() {
  destroyArchive();
  destroyWork();
}

function destroyWebglIfRunning() {
  if (isWebglRunning()) destroyWebgl();
}

async function setupBaseScenePage(page, options = {}) {
  const { workOverlay = false } = options;

  destroySharedPages();
  ensureWebglRuntime();
  setBaseSceneOverlayMode(false);
  setBaseSceneVisibility(true);
  setScenePage(page, workOverlay);
  await swapModel(page === 'work' ? 'work' : 'home');
}

async function setupArchivePage() {
  destroyFilm();
  destroyWork();
  destroyLenis();
  destroyWebglIfRunning();
  await initArchive();
}

async function setupFilmPage(container) {
  destroyNonFilmPages();
  destroyWebglIfRunning();
  initLenis();
  bindFilmTemplateFromTransitionState(container);
  await initFilm(container);
}

function cleanupPageNamespace(namespace) {
  if (namespace === 'work') {
    destroyWork();
    return;
  }

  if (namespace === 'archive') {
    destroyArchive();
    return;
  }

  if (namespace === 'film') {
    destroyFilm();
    destroyLenis();
  }
}

function AppShell() {
  const location = useLocation();
  const contentRef = useRef(null);
  const previousNamespaceRef = useRef(getNamespace(location.pathname));

  useClock();

  useEffect(() => {
    preloader.init();
    document.fonts.ready.then(() => {
      initMenu();
    });

    return () => {
      destroyFilm();
      destroyArchive();
      destroyWork();
      destroyLenis();
      destroyWebgl();
      cleanupSplits();
      cleanupBrandHandoff();
      destroyLinkHover();
      destroyMenu();
    };
  }, []);

  useEffect(() => {
    const currentPath = location.pathname;
    document.title = TITLES[currentPath] || 'Duforn';
    const namespace = getNamespace(currentPath);
    const previousNamespace = previousNamespaceRef.current;
    applyBodyRouteClasses(namespace);
    runBrandHandoff({ fromNamespace: previousNamespace, toNamespace: namespace });
    previousNamespaceRef.current = namespace;

    const stopEnterTween = runRouteEnterTransition(contentRef.current);
    const container = document.querySelector('[data-page-container="true"]');
    if (container) animateRevealEnter(container, { excludeSelector: '.home-hero-brand' });
    initLinkHover();

    const pageSetup = {
      home: () => setupBaseScenePage('home'),
      contact: () => setupBaseScenePage('contact'),
      work: async () => {
        startWorkTexturePreload();
        await setupBaseScenePage('work', { workOverlay: true });
        await initWork();
      },
      archive: () => setupArchivePage(),
      film: () => setupFilmPage(container),
    };

    void (pageSetup[namespace] || pageSetup.home)();

    return () => {
      stopEnterTween();
      cleanupBrandHandoff();
      cleanupSplits();
      cleanupPageNamespace(namespace);
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
