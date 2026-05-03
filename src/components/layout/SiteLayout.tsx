// @ts-nocheck
import React, { useRef, useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import { navigateTo } from "../../lib/navigationBridge";
import UnifiedCanvas from "../webgl/UnifiedCanvas";
import { useWebglStore } from "../../store/webgl";
import { useLoadingStore } from "../../store/loading";
import { requestDeviceOrientationPermission } from "../../../scripts/runtime/motion";
import { triggerNavHaptic } from "../../../scripts/haptic-feedback";
import { shouldUseNavRotateHover } from "../../../scripts/link-hover";
import RotateHoverLabel from "../RotateHoverLabel";

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
  const useRotateHover =
    shouldUseNavRotateHover() && !isActive && typeof children === "string" && children.length > 0;

  return (
    <a
      href={to}
      className={className}
      onClick={handleClick}
      aria-current={isActive ? "page" : undefined}
      data-rotate-hover={useRotateHover ? "" : undefined}
      {...restProps}
    >
      {useRotateHover ? <RotateHoverLabel text={children} /> : children}
    </a>
  );
}

function FullscreenMenu({ isMenuOpen, menuRef, onCloseMenu, onBackdropClick }) {
  return (
    <div
      className={`menu-wrap menu-wrap--fullscreen${isMenuOpen ? " is-open" : ""}`}
      ref={menuRef}
      id="site-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      aria-hidden={!isMenuOpen}
      onClick={onBackdropClick}
    >
      <div className="menu-fullscreen">
        <div className="menu-fullscreen__top">
          <NavLink
            className="menu-fullscreen__brand u-text-style-h3 u-text-style-font-primary"
            to="/"
            onClick={onCloseMenu}
          >
            duforn
          </NavLink>
          <button
            type="button"
            className="menu-fullscreen__close u-text-style-small u-text-style-font-secondary"
            onClick={onCloseMenu}
          >
            CLOSE
          </button>
        </div>
        <nav className="menu-fullscreen__nav" aria-label="Primary navigation">
          <NavLink
            className="menu-fullscreen__link u-text-style-h2 u-text-style-font-primary"
            to="/"
            onClick={onCloseMenu}
          >
            HOME
          </NavLink>
          <NavLink
            className="menu-fullscreen__link u-text-style-h2 u-text-style-font-primary"
            to="/work"
            onClick={onCloseMenu}
          >
            WORK
          </NavLink>
          <NavLink
            className="menu-fullscreen__link u-text-style-h2 u-text-style-font-primary"
            to="/contact"
            onClick={onCloseMenu}
          >
            CONTACT
          </NavLink>
          <NavLink
            className="menu-fullscreen__link u-text-style-h2 u-text-style-font-primary"
            to="/archive"
            onClick={onCloseMenu}
          >
            ARCHIVE
          </NavLink>
          <NavLink
            className="menu-fullscreen__link u-text-style-h2 u-text-style-font-primary"
            to="/money-me"
            onClick={onCloseMenu}
          >
            PROJECT
          </NavLink>
        </nav>
      </div>
    </div>
  );
}

export default function SiteLayout({ children }) {
  const location = useLocation();
  const hideNavBrand = location.pathname === "/" || location.pathname === "/test";
  const activePage = useWebglStore((s) => s.activePage);
  const setGyroEnabled = useWebglStore((s) => s.setGyroEnabled);
  const phase = useLoadingStore((s) => s.phase);
  const [preloaderFading, setPreloaderFading] = useState(false);
  const [preloaderVisible, setPreloaderVisible] = useState(true);
  const [introRingComplete, setIntroRingComplete] = useState(false);
  const [permissionsPending, setPermissionsPending] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const preloaderTimerRef = useRef(0);
  const introTimelineRef = useRef(null);
  const preloaderRef = useRef(null);
  const strokeTrackRef = useRef(null);
  const strokeProgressRef = useRef(null);
  const menuRef = useRef(null);
  const menuToggleRef = useRef(null);
  const previouslyFocusedElementRef = useRef(null);
  const previousIsMenuOpenRef = useRef(false);

  useEffect(() => {
    document.body.classList.toggle("preloader-active", preloaderVisible);
    return () => document.body.classList.remove("preloader-active");
  }, [preloaderVisible]);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const openMenu = useCallback(() => {
    previouslyFocusedElementRef.current = document.activeElement;
    setIsMenuOpen(true);
    triggerNavHaptic("click");
  }, []);

  const toggleMenu = useCallback(() => {
    if (isMenuOpen) {
      triggerNavHaptic("click");
      closeMenu();
      return;
    }
    openMenu();
  }, [closeMenu, isMenuOpen, openMenu]);

  const onMenuToggleTouchStart = useCallback(() => {
    triggerNavHaptic("nudge");
  }, []);

  const dismissPreloader = useCallback(() => {
    if (!preloaderVisible || preloaderFading) return;

    setPreloaderFading(true);
    preloaderTimerRef.current = window.setTimeout(() => {
      setPreloaderVisible(false);
      setPreloaderFading(false);
      preloaderTimerRef.current = 0;
      window.dispatchEvent(
        new CustomEvent("duforn:preloader-dismissed", {
          detail: { pathname: window.location.pathname },
        }),
      );
    }, 600);
  }, [preloaderFading, preloaderVisible]);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setIntroRingComplete(true);
      return undefined;
    }

    if (!preloaderVisible) return undefined;
    if (!preloaderRef.current || !strokeTrackRef.current || !strokeProgressRef.current)
      return undefined;

    const track = strokeTrackRef.current;
    const progress = strokeProgressRef.current;
    const pathLength = track.getTotalLength();
    const ctx = gsap.context(() => {
      gsap.set([track, progress], {
        strokeDasharray: pathLength,
        strokeDashoffset: pathLength,
      });
      gsap.set(preloaderRef.current, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        scale: 1,
      });

      const tl = gsap.timeline({
        delay: 0.25,
        onComplete: () => {
          setIntroRingComplete(true);
        },
      });
      introTimelineRef.current = tl;
      tl.to(
        track,
        {
          strokeDashoffset: 0,
          duration: 2,
          ease: "power3.inOut",
        },
        0.1,
      )
        .to(
          ".intro-preloader .intro-preloader-ring svg",
          {
            rotation: 270,
            duration: 2,
            ease: "power3.inOut",
          },
          0.1,
        )
        .to(
          progress,
          {
            strokeDashoffset: pathLength - pathLength * 0.2,
            duration: 0.55,
            ease: "power2.out",
          },
          0.65,
        )
        .to(progress, {
          strokeDashoffset: pathLength - pathLength * 0.55,
          duration: 0.55,
          ease: "power2.out",
        })
        .to(progress, {
          strokeDashoffset: pathLength - pathLength * 0.85,
          duration: 0.55,
          ease: "power2.out",
        })
        .to(progress, {
          strokeDashoffset: 0,
          duration: 0.5,
          ease: "power2.out",
        });
    }, preloaderRef);

    return () => {
      introTimelineRef.current?.kill();
      introTimelineRef.current = null;
      setIntroRingComplete(false);
      ctx.revert();
    };
  }, [preloaderVisible]);

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

    try {
      const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
      if (AudioContextCtor) {
        const audioContext = new AudioContextCtor();
        if (audioContext.state !== "running") {
          await audioContext.resume();
        }
      }
    } catch {
      if (!localError) {
        localError = "Audio could not be enabled right now; continuing silently.";
      }
    }

    return { gyroAllowed, localError };
  }, [setGyroEnabled]);

  const handleIntroEnter = useCallback(async () => {
    if (!introRingComplete || phase !== "ready" || permissionsPending) return;
    setPermissionsPending(true);
    await requestExperiencePermissions();
    setPermissionsPending(false);
    dismissPreloader();
  }, [
    dismissPreloader,
    introRingComplete,
    permissionsPending,
    phase,
    requestExperiencePermissions,
  ]);

  useEffect(() => {
    return () => {
      if (preloaderTimerRef.current) {
        window.clearTimeout(preloaderTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    closeMenu();
  }, [closeMenu, location.pathname]);

  useEffect(() => {
    document.body.classList.toggle("menu-open", isMenuOpen);
    return () => document.body.classList.remove("menu-open");
  }, [isMenuOpen]);

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

      {preloaderVisible && (
        <section
          className="preloader intro-preloader"
          aria-label="Website preloader"
          data-state={preloaderFading ? "fading" : "visible"}
          ref={preloaderRef}
        >
          <div className="intro-preloader-main intro-preloader-main--centered">
            <button
              type="button"
              className="intro-preloader-center-hit"
              onClick={handleIntroEnter}
              disabled={!introRingComplete || phase !== "ready" || permissionsPending}
              aria-label={
                !introRingComplete
                  ? "Playing intro animation"
                  : phase !== "ready"
                    ? "Loading experience"
                    : permissionsPending
                      ? "Requesting device permissions"
                      : "Enter site"
              }
            >
              <span
                className={`intro-preloader-action-tagline${introRingComplete ? " intro-preloader-action-tagline--hidden" : ""}`}
              >
                DUFORN
              </span>
              <span
                className={`intro-preloader-enter-label${introRingComplete ? " intro-preloader-enter-label--active" : ""}`}
                aria-hidden={!introRingComplete}
              >
                ENTER
              </span>
              <div className="intro-preloader-ring" aria-hidden="true">
                <svg viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle className="stroke-track" cx="160" cy="160" r="155" ref={strokeTrackRef} />
                  <circle
                    className="stroke-progress"
                    cx="160"
                    cy="160"
                    r="155"
                    ref={strokeProgressRef}
                  />
                </svg>
              </div>
            </button>
          </div>
        </section>
      )}

      <header>
        <nav className="nav-wrap u-position-fixed">
          <div className="nav-contain u-container-full u-gap-3">
            <NavLink className="u-mobile-hidden" to="/work">
              work
            </NavLink>
            {hideNavBrand ? (
              <span
                className="link-main u-display-inline-block u-pointer-off u-mobile-hidden"
                aria-hidden="true"
                style={{ visibility: "hidden", whiteSpace: "nowrap" }}
              >
                DUFORN
              </span>
            ) : (
              <NavLink to="/" className="link-main nav-brand">
                DUFORN
              </NavLink>
            )}
            <NavLink className="u-mobile-hidden" to="/contact">
              contact
            </NavLink>
            <button
              ref={menuToggleRef}
              className="menu-toggle-btn"
              type="button"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-haspopup="dialog"
              aria-controls="site-menu"
              aria-expanded={isMenuOpen}
              onTouchStart={onMenuToggleTouchStart}
              onClick={toggleMenu}
            >
              <span className="menu-toggle-btn-wrapper">MENU</span>
            </button>
          </div>
        </nav>

        <div className="bottom-nav-wrap u-position-fixed u-container-full u-mobile-hidden">
          <div className="bottom-nav-contain u-flex-horizontal-nowrap u-justify-content-between u-align-items-center u-gap-3 u-width-full">
            <NavLink to="/archive">archive</NavLink>
            <div id="time" aria-live="polite">
              12:34:56 IST
            </div>
          </div>
        </div>

        <FullscreenMenu
          isMenuOpen={isMenuOpen}
          menuRef={menuRef}
          onCloseMenu={closeMenu}
          onBackdropClick={handleMenuBackdropClick}
        />
      </header>

      <div className="page-canvas">
        <UnifiedCanvas activePage={activePage} />
      </div>

      {children}

      <footer className="u-visually-hidden">
        <p>&copy; 2026 DUFORN. All rights reserved.</p>
      </footer>
    </>
  );
}
