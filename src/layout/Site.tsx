// @ts-nocheck
import React, { useRef, useEffect, useState, useCallback } from "react";
import { flushSync } from "react-dom";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import { navigateTo } from "../lib/nav";
import { canvasInk } from "../lib/ink/transition";
import { resolveCanvasInkOrigin } from "../lib/ink/origin";
import {
  CANVAS_INK_MENU_TIMING,
  CANVAS_INK_ROUTE_TIMING,
  getRouteInkNamespace,
  normalizePath,
} from "../lib/ink/route";
import {
  hideAllRegisteredMenuText,
  hideAllRegisteredPageText,
  showAllRegisteredMenuText,
  showAllRegisteredPageText,
} from "../lib/text";
import Canvas from "../scenes/Canvas";
import ChromaticAberrationFilter from "../fx/Chromatic";
import OverlayCanvas from "../scenes/OverlayCanvas";
import RotateHoverLabel from "../ui/HoverLabel";
import ToggleRevealLabel from "../ui/ToggleRevealLabel";
import MenuOverlayLayer from "./Menu";
import OverlayPortal from "./Portal";
import PreloaderOverlayLayer from "./Preloader";
import { useWebglStore } from "../store/webgl";
import { useLoadingStore } from "../store/loading";
import { usePreloaderOverlayStore } from "../store/overlay";
import { PRELOADER_DISMISSED_EVENT } from "../lib/preload/events";
import { requestDeviceOrientationPermission } from "../../scripts/runtime/motion";
import { triggerNavHaptic } from "../../scripts/haptic-feedback";
import { shouldUseNavRotateHover } from "../../scripts/link-hover";

function NavLink({ to, className, children, ...props }) {
  const location = useLocation();
  const { onClick: onClickProp, ...restProps } = props;

  const handleClick = (e) => {
    onClickProp?.(e);
    if (e.defaultPrevented) return;

    // Allow default behavior for modifier keys (open in new tab, etc.)
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }

    e.preventDefault();

    // Only navigate if the path is actually changing.
    // All leave animation + canvas transition is handled by the NavigationBridge.
    if (location.pathname !== to) {
      navigateTo(to);
    }
  };

  const isActive = location.pathname === to;

  return (
    <a
      href={to}
      className={className}
      onClick={handleClick}
      aria-current={isActive ? "page" : undefined}
      {...restProps}
    >
      {children}
    </a>
  );
}

function shouldShowIntroPreloader(pathname) {
  // The detail route is the only vertical page; skip the intro lock there so a
  // deep link does not boot into a fixed-body state that blocks scrolling.
  return getRouteInkNamespace(pathname) !== "projectDetail";
}

export default function SiteLayout({ children }) {
  const location = useLocation();
  const activePage = useWebglStore((s) => s.activePage);
  const rendererType = useWebglStore((s) => s.rendererType);
  const setGyroEnabled = useWebglStore((s) => s.setGyroEnabled);
  const progress = useLoadingStore((s) => s.progress);
  const essentialsReady = useLoadingStore((s) => s.essentialsReady);
  const setPreloaderOverlayVisible = usePreloaderOverlayStore((s) => s.setVisible);
  const [preloaderFading, setPreloaderFading] = useState(false);
  const [preloaderVisible, setPreloaderVisible] = useState(() =>
    shouldShowIntroPreloader(location.pathname),
  );
  const [introRingComplete, setIntroRingComplete] = useState(false);
  const [permissionsPending, setPermissionsPending] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  /** When false while open, menu-wrap is transparent so the Canvas ink overlay reads as the backdrop. */
  const [menuSurfaceSolid, setMenuSurfaceSolid] = useState(true);
  const preloaderTimerRef = useRef(0);
  const introTimelineRef = useRef(null);
  const preloaderRef = useRef(null);
  const strokeTrackRef = useRef(null);
  const strokeProgressRef = useRef(null);
  const menuRef = useRef(null);
  const menuToggleRef = useRef(null);
  const introHitRef = useRef(null);
  const previouslyFocusedElementRef = useRef(null);
  const previousIsMenuOpenRef = useRef(false);
  const closeMenuRef = useRef(() => {});
  const previousPathnameForMenuRef = useRef(null);
  /** Used to avoid forcing page text `show()` after a menu link navigation (new route owns reveal). */
  const menuOpenedPathnameRef = useRef(null);
  const useNavRotateHover = shouldUseNavRotateHover();

  useEffect(() => {
    setPreloaderOverlayVisible(preloaderVisible);
  }, [preloaderVisible, setPreloaderOverlayVisible]);

  useEffect(() => {
    const onClose = () => {
      void closeMenuRef.current();
    };
    window.addEventListener("duforn:nav-close-menu", onClose);
    return () => window.removeEventListener("duforn:nav-close-menu", onClose);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("preloader-active", preloaderVisible);
    return () => document.body.classList.remove("preloader-active");
  }, [preloaderVisible]);

  const maybeRestorePageTextAfterMenuClose = useCallback(() => {
    const openedOn = menuOpenedPathnameRef.current;
    menuOpenedPathnameRef.current = null;
    if (openedOn === normalizePath(location.pathname)) {
      void showAllRegisteredPageText();
    }
  }, [location.pathname]);

  const closeMenu = useCallback(async () => {
    if (!isMenuOpen) {
      setMenuSurfaceSolid(true);
      return;
    }
    await hideAllRegisteredMenuText();
    if (canvasInk.isReady?.()) {
      void canvasInk.enter({
        skipExpand: true,
        origin: resolveCanvasInkOrigin(menuToggleRef.current),
        expandMs: CANVAS_INK_MENU_TIMING.expandMs,
        holdMs: 0,
        collapseMs: CANVAS_INK_MENU_TIMING.collapseMs,
        onCovered: () => {
          flushSync(() => {
            setMenuSurfaceSolid(true);
            setIsMenuOpen(false);
          });
          maybeRestorePageTextAfterMenuClose();
        },
      });
    } else {
      setMenuSurfaceSolid(true);
      setIsMenuOpen(false);
      maybeRestorePageTextAfterMenuClose();
    }
  }, [isMenuOpen, maybeRestorePageTextAfterMenuClose, rendererType]);

  closeMenuRef.current = closeMenu;

  const openMenu = useCallback(async () => {
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 769px)").matches) {
      return;
    }
    await hideAllRegisteredPageText();
    previouslyFocusedElementRef.current = document.activeElement;
    if (canvasInk.isReady?.()) {
      try {
        await canvasInk.cover({
          origin: resolveCanvasInkOrigin(menuToggleRef.current),
          expandMs: CANVAS_INK_MENU_TIMING.expandMs,
        });
        flushSync(() => {
          setMenuSurfaceSolid(false);
          setIsMenuOpen(true);
          menuOpenedPathnameRef.current = normalizePath(location.pathname);
        });
      } catch {
        flushSync(() => {
          setMenuSurfaceSolid(true);
          setIsMenuOpen(true);
          menuOpenedPathnameRef.current = normalizePath(location.pathname);
        });
      }
    } else {
      flushSync(() => {
        setMenuSurfaceSolid(true);
        setIsMenuOpen(true);
        menuOpenedPathnameRef.current = normalizePath(location.pathname);
      });
    }
    await showAllRegisteredMenuText();
  }, [location.pathname, rendererType]);

  const toggleMenu = useCallback(() => {
    triggerNavHaptic("click");
    if (isMenuOpen) {
      closeMenu();
      return;
    }
    openMenu();
  }, [closeMenu, isMenuOpen, openMenu]);

  const dismissPreloader = useCallback(() => {
    if (!preloaderVisible || preloaderFading) return;

    setPreloaderFading(true);
    preloaderTimerRef.current = window.setTimeout(() => {
      setPreloaderVisible(false);
      setPreloaderFading(false);
      preloaderTimerRef.current = 0;
      window.dispatchEvent(
        new CustomEvent(PRELOADER_DISMISSED_EVENT, {
          detail: { pathname: window.location.pathname },
        }),
      );
    }, 600);
  }, [preloaderFading, preloaderVisible]);

  /**
   * Drive the preloader ring from real preloader-gate progress.
   *
   * - `track` stays fully visible (dashoffset 0) as a static reference ring.
   * - `progress` (highlighted ring) is tweened to `circumference * (1 - progress)`
   *   whenever the gate snapshot changes.
   * - When `essentialsReady && progress >= 1`, after the catch-up tween settles
   *   we flip `introRingComplete = true` so the Enter button activates.
   * - Reduced-motion + non-WebGPU paths skip the tween entirely.
   */
  useEffect(() => {
    if (!preloaderVisible) return undefined;
    if (!preloaderRef.current || !strokeTrackRef.current || !strokeProgressRef.current)
      return undefined;

    const trackEl = strokeTrackRef.current;
    const progressEl = strokeProgressRef.current;
    const pathLength = trackEl.getTotalLength();

    const ctx = gsap.context(() => {
      gsap.set(trackEl, { strokeDasharray: pathLength, strokeDashoffset: 0 });
      gsap.set(progressEl, { strokeDasharray: pathLength, strokeDashoffset: pathLength });
      gsap.set(preloaderRef.current, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        scale: 1,
      });
    }, preloaderRef);

    return () => {
      introTimelineRef.current?.kill();
      introTimelineRef.current = null;
      setIntroRingComplete(false);
      ctx.revert();
    };
  }, [preloaderVisible]);

  /**
   * Reactive ring binding — re-runs whenever the preloader-gate snapshot changes.
   * Also flips `introRingComplete` once essentials are ready and the catch-up
   * tween reaches the full circle.
   */
  useEffect(() => {
    if (!preloaderVisible) return undefined;
    const progressEl = strokeProgressRef.current;
    const trackEl = strokeTrackRef.current;
    if (!progressEl || !trackEl) return undefined;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const pathLength = trackEl.getTotalLength();
    const target = pathLength * (1 - Math.max(0, Math.min(1, progress)));
    const isReady = essentialsReady && progress >= 0.999;

    if (prefersReducedMotion) {
      gsap.set(progressEl, { strokeDashoffset: target });
      if (isReady) setIntroRingComplete(true);
      return undefined;
    }

    introTimelineRef.current?.kill();
    const tween = gsap.to(progressEl, {
      strokeDashoffset: target,
      duration: isReady ? 0.3 : 0.45,
      ease: isReady ? "power2.out" : "power2.inOut",
      overwrite: true,
      onComplete: () => {
        if (isReady) setIntroRingComplete(true);
      },
    });
    introTimelineRef.current = tween;

    return () => {
      tween.kill();
    };
  }, [preloaderVisible, progress, essentialsReady]);

  const requestExperiencePermissions = useCallback(async () => {
    let gyroAllowed = false;
    let localError = "";
    try {
      gyroAllowed = await requestDeviceOrientationPermission();
    } catch {
      localError = "Motion permission was blocked; continuing without gyro controls.";
      gyroAllowed = false;
    }
    setGyroEnabled(gyroAllowed);

    return { gyroAllowed, localError };
  }, [setGyroEnabled]);

  const handleIntroEnter = useCallback(async () => {
    if (!introRingComplete || permissionsPending) return;
    setPermissionsPending(true);
    await requestExperiencePermissions();
    setPermissionsPending(false);

    if (rendererType !== "webgpu") {
      dismissPreloader();
      return;
    }

    const path = normalizePath(window.location.pathname);
    const surface = path === "/archive" ? "archive" : "home";
    const timing = CANVAS_INK_ROUTE_TIMING;

    try {
      await canvasInk.enter({
        surface,
        skipExpand: true,
        origin: resolveCanvasInkOrigin(introHitRef.current),
        expandMs: timing.expandMs,
        holdMs: timing.holdMs,
        collapseMs: timing.collapseMs,
        onCovered: () => {
          flushSync(() => {
            setPreloaderVisible(false);
            setPreloaderFading(false);
          });
          window.dispatchEvent(
            new CustomEvent(PRELOADER_DISMISSED_EVENT, {
              detail: { pathname: window.location.pathname },
            }),
          );
        },
      });
    } catch {
      flushSync(() => {
        setPreloaderVisible(false);
        setPreloaderFading(false);
      });
      window.dispatchEvent(
        new CustomEvent(PRELOADER_DISMISSED_EVENT, {
          detail: { pathname: window.location.pathname },
        }),
      );
    }
  }, [
    dismissPreloader,
    introRingComplete,
    permissionsPending,
    rendererType,
    requestExperiencePermissions,
  ]);

  const introEnterDisabled = !introRingComplete || permissionsPending;

  useEffect(() => {
    if (!preloaderVisible || introEnterDisabled) return;

    const onKeyDown = (event) => {
      if (event.key !== "Enter") return;
      const tag = event.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || event.target?.isContentEditable) return;
      event.preventDefault();
      void handleIntroEnter();
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [handleIntroEnter, introEnterDisabled, preloaderVisible]);

  useEffect(() => {
    return () => {
      if (preloaderTimerRef.current) {
        window.clearTimeout(preloaderTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const prev = previousPathnameForMenuRef.current;
    previousPathnameForMenuRef.current = location.pathname;
    if (prev !== null && prev !== location.pathname) {
      closeMenuRef.current();
    }
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle("menu-open", isMenuOpen);
    return () => document.body.classList.remove("menu-open");
  }, [isMenuOpen]);

  useEffect(() => {
    const shouldLockScroll = isMenuOpen || preloaderVisible || preloaderFading;
    if (!shouldLockScroll) return undefined;

    const scrollY = window.scrollY;
    document.documentElement.classList.add("overlay-scroll-lock");
    document.body.classList.add("overlay-scroll-lock");
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    return () => {
      document.documentElement.classList.remove("overlay-scroll-lock");
      document.body.classList.remove("overlay-scroll-lock");
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, [isMenuOpen, preloaderFading, preloaderVisible]);

  /** Fullscreen menu is mobile-only; clear state if viewport crosses to desktop so scroll/overlay never stick. */
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return undefined;
    const mq = window.matchMedia("(max-width: 768px)");
    const onChange = () => {
      if (!mq.matches) {
        closeMenuRef.current();
      }
    };
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const wasOpen = previousIsMenuOpenRef.current;
    previousIsMenuOpenRef.current = isMenuOpen;

    if (!isMenuOpen) {
      if (!wasOpen) return;
      const lastFocused = previouslyFocusedElementRef.current;
      if (lastFocused && typeof lastFocused.focus === "function") {
        window.setTimeout(() => lastFocused.focus(), 0);
      } else {
        menuToggleRef.current?.focus?.();
      }
      return;
    }

    const menuElement = menuRef.current;
    if (!menuElement) return;

    const getFocusable = () =>
      Array.from(
        menuElement.querySelectorAll(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"]), input, select, textarea',
        ),
      );

    const focusableElements = getFocusable();
    const first = focusableElements[0];
    first?.focus?.();

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }

      if (event.key !== "Tab") return;
      const nodes = getFocusable();
      if (!nodes.length) return;

      const firstNode = nodes[0];
      const lastNode = nodes[nodes.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && activeElement === firstNode) {
        event.preventDefault();
        lastNode.focus();
      } else if (!event.shiftKey && activeElement === lastNode) {
        event.preventDefault();
        firstNode.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [closeMenu, isMenuOpen]);

  const handleMenuBackdropClick = useCallback(
    (event) => {
      if (event.target === event.currentTarget) {
        closeMenu();
      }
    },
    [closeMenu],
  );

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <OverlayPortal>
        <div className="fullscreen-overlay-cluster" aria-hidden={!preloaderVisible && !isMenuOpen}>
          <OverlayCanvas />
          <PreloaderOverlayLayer
            visible={preloaderVisible}
            fading={preloaderFading}
            preloaderRef={preloaderRef}
            strokeTrackRef={strokeTrackRef}
            strokeProgressRef={strokeProgressRef}
            introHitRef={introHitRef}
            essentialsReady={essentialsReady}
            introRingComplete={introRingComplete}
            permissionsPending={permissionsPending}
            onEnter={handleIntroEnter}
          />
          <MenuOverlayLayer
            isMenuOpen={isMenuOpen}
            menuRef={menuRef}
            surfaceSolid={menuSurfaceSolid}
            rotateHoverLabels={useNavRotateHover}
            onCloseMenu={closeMenu}
            onBackdropClick={handleMenuBackdropClick}
            renderNavLink={(props) => <NavLink {...props} />}
          />
        </div>
      </OverlayPortal>

      <header>
        <nav className="nav-wrap u-position-fixed">
          <div className="nav-contain u-container-full">
            <NavLink
              className="u-mobile-hidden"
              to="/contact"
              data-rotate-hover={useNavRotateHover ? "" : undefined}
            >
              {useNavRotateHover ? <RotateHoverLabel text="Contact" /> : "Contact"}
            </NavLink>
            <NavLink
              to="/"
              className="link-main nav-brand menu-fullscreen__brand"
              data-rotate-hover={useNavRotateHover ? "" : undefined}
            >
              {useNavRotateHover ? <RotateHoverLabel text="Duforn" /> : "Duforn"}
            </NavLink>
            <NavLink
              className="u-mobile-hidden"
              to="/work"
              data-rotate-hover={useNavRotateHover ? "" : undefined}
            >
              {useNavRotateHover ? <RotateHoverLabel text="Work" /> : "Work"}
            </NavLink>
            <button
              ref={menuToggleRef}
              className="menu-toggle-btn button button-primary u-display-flex u-align-items-center u-justify-content-center u-position-relative"
              type="button"
              data-state={isMenuOpen ? "open" : "closed"}
              style={{ width: isMenuOpen ? "calc(5ch + 2.5rem)" : "calc(4ch + 2.5rem)" }}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-haspopup="dialog"
              aria-controls="site-menu"
              aria-expanded={isMenuOpen}
              onClick={toggleMenu}
            >
              <span
                className="menu-toggle-btn-wrapper u-display-inline-flex u-align-items-center u-justify-content-center u-position-relative u-overflow-hidden"
                style={{ width: isMenuOpen ? "5ch" : "4ch" }}
                aria-hidden="true"
              >
                <ToggleRevealLabel text="MENU" alternateText="CLOSE" active={isMenuOpen} />
              </span>
            </button>
          </div>
        </nav>

        <div className="bottom-nav-wrap u-position-fixed u-container-full u-mobile-hidden">
          <div className="bottom-nav-contain u-flex-horizontal-nowrap u-justify-content-between u-align-items-center u-gap-3 u-width-full">
            <NavLink to="/archive" data-rotate-hover={useNavRotateHover ? "" : undefined}>
              {useNavRotateHover ? <RotateHoverLabel text="Archive" /> : "Archive"}
            </NavLink>
            <div id="time" aria-live="polite">
              12:34:56 IST
            </div>
          </div>
        </div>
      </header>

      <div className="page-canvas">
        <Canvas activePage={activePage} />
        <ChromaticAberrationFilter offsetX={1.2} />
      </div>

      {children}

      <footer className="u-visually-hidden">
        <p>&copy; 2026 Duforn. All rights reserved.</p>
      </footer>
    </>
  );
}
