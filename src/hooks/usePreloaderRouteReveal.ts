import { useEffect, useRef } from "react";

import { useWebglStore } from "../store/webgl";
import { initLinkHover, destroyLinkHover } from "../../scripts/link-hover";
import {
  prepareRouteReveal,
  runRouteEnter,
  initScrollReveals,
  destroyAllReveals,
} from "../../scripts/text-reveal";
import { initLenis, destroyLenis } from "../../scripts/lenis-scroll";
import {
  shouldAnimateCanvasBetweenNamespaces,
  runRouteEnterTransition,
} from "../lib/animation/routeTransition";
import { consumeArchiveBurnSkipNextCanvasEnter } from "../lib/animation/archiveBurnRoute";
import { cleanupBrandHandoff, runBrandHandoff } from "../lib/animation/brandHandoffTransition";
import {
  applyBodyRouteClasses,
  getNamespace,
  normalizePath,
  REVEAL_SHORT_DELAY_MS,
  REVEAL_START_DELAY_MS,
  TITLES,
  waitForRevealDelay,
} from "../lib/routing/routeMeta";

const BRAND_HANDOFF_SELECTOR = "[data-brand-handoff-title]";
const REVEAL_BODY_OPTS = { excludeSelector: BRAND_HANDOFF_SELECTOR };

export function usePreloaderRouteReveal(pathname: string) {
  const setActivePage = useWebglStore((s) => s.setActivePage);
  const currentPath = normalizePath(pathname);
  const namespace = getNamespace(currentPath);
  const previousPathRef = useRef(currentPath);

  useEffect(() => {
    const onPreloaderDismissed = async (event: CustomEvent<{ pathname?: string }>) => {
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

    window.addEventListener("duforn:preloader-dismissed", onPreloaderDismissed as EventListener);
    return () => {
      window.removeEventListener(
        "duforn:preloader-dismissed",
        onPreloaderDismissed as EventListener,
      );
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
  }, [currentPath, namespace, setActivePage]);
}
