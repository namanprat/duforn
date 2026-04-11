import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { setNavigateHandler } from "../lib/navigationBridge";
import {
  shouldAnimateCanvasBetweenNamespaces,
  runRouteLeaveTransition,
} from "../lib/animation/routeTransition";
import {
  crossesArchive,
  getArchiveBurnOverlay,
  setArchiveBurnSkipNextCanvasEnter,
  getArchiveBurnMotionPrefs,
  waitForNextPaint,
} from "../lib/animation/archiveBurnRoute";
import { captureViewportSnapshot } from "../lib/animation/captureViewportSnapshot";
import { runRouteLeave } from "../../scripts/text-reveal";
import { getNamespace, normalizePath } from "../lib/routing/routeMeta";

const BRAND_HANDOFF_SELECTOR = "[data-brand-handoff-title]";

export function useNavigationTransitions(pathname: string) {
  const navigate = useNavigate();
  const transitionRef = useRef({ inFlight: false, targetPath: null as string | null });
  const currentPathRef = useRef(normalizePath(pathname));

  useEffect(() => {
    currentPathRef.current = normalizePath(pathname);
    if (
      transitionRef.current.inFlight &&
      transitionRef.current.targetPath === currentPathRef.current
    ) {
      transitionRef.current.inFlight = false;
      transitionRef.current.targetPath = null;
    }
  }, [pathname]);

  useEffect(() => {
    setNavigateHandler(async (path) => {
      const nextPath = normalizePath(path);
      const currentPath = currentPathRef.current;

      if (nextPath === currentPath || transitionRef.current.inFlight) return;

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
}
