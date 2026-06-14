// @ts-nocheck
import React, { useRef, useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import { getRouteNamespace } from "../lib/route";
import OverlayPortal from "./Portal";
import IslandNav from "./IslandNav";
import PreloaderOverlayLayer from "./Preloader";
import { useWebglStore } from "../store/webgl";
import { useLoadingStore } from "../store/loading";
import { usePreloaderOverlayStore } from "../store/overlay";
import { PRELOADER_DISMISSED_EVENT } from "../lib/preload/events";
import { requestDeviceOrientationPermission } from "../../scripts/runtime/motion";
import Canvas from "../scenes/Canvas";

function shouldShowIntroPreloader(pathname) {
  return getRouteNamespace(pathname) !== "projectDetail";
}

export default function SiteLayout({ children }) {
  const location = useLocation();
  const activePage = useWebglStore((s) => s.activePage);
  const setGyroEnabled = useWebglStore((s) => s.setGyroEnabled);
  const progress = useLoadingStore((s) => s.progress);
  const essentialsReady = useLoadingStore((s) => s.essentialsReady);
  const loadingPhase = useLoadingStore((s) => s.phase);
  const setPreloaderOverlayVisible = usePreloaderOverlayStore((s) => s.setVisible);
  const [preloaderFading, setPreloaderFading] = useState(false);
  const [preloaderVisible, setPreloaderVisible] = useState(() =>
    shouldShowIntroPreloader(location.pathname),
  );
  const [introRingComplete, setIntroRingComplete] = useState(false);
  const [permissionsPending, setPermissionsPending] = useState(false);
  const preloaderTimerRef = useRef(0);
  const introTimelineRef = useRef(null);
  const preloaderRef = useRef(null);
  const strokeTrackRef = useRef(null);
  const strokeProgressRef = useRef(null);
  const introHitRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setPreloaderOverlayVisible(preloaderVisible);
  }, [preloaderVisible, setPreloaderOverlayVisible]);

  useEffect(() => {
    document.body.classList.toggle("preloader-active", preloaderVisible);
    return () => document.body.classList.remove("preloader-active");
  }, [preloaderVisible]);

  const dismissPreloader = useCallback(() => {
    if (!preloaderVisible || preloaderFading) return;
    if (useLoadingStore.getState().phase !== "ready") return;

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
    const isReady = essentialsReady && progress >= 0.999 && loadingPhase === "ready";

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
  }, [preloaderVisible, progress, essentialsReady, loadingPhase]);

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
    if (useLoadingStore.getState().phase !== "ready") return;
    setPermissionsPending(true);
    await requestExperiencePermissions();
    setPermissionsPending(false);
    dismissPreloader();
  }, [dismissPreloader, introRingComplete, permissionsPending, requestExperiencePermissions]);

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
    const shouldLockScroll = preloaderVisible || preloaderFading || menuOpen;
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
  }, [menuOpen, preloaderFading, preloaderVisible]);

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <OverlayPortal>
        <div className="fullscreen-overlay-cluster" aria-hidden={!preloaderVisible}>
          <PreloaderOverlayLayer
            visible={preloaderVisible}
            fading={preloaderFading}
            preloaderRef={preloaderRef}
            strokeTrackRef={strokeTrackRef}
            strokeProgressRef={strokeProgressRef}
            introHitRef={introHitRef}
            essentialsReady={essentialsReady}
            loadingPhase={loadingPhase}
            introRingComplete={introRingComplete}
            permissionsPending={permissionsPending}
            onEnter={handleIntroEnter}
          />
        </div>
      </OverlayPortal>

      <IslandNav onMenuOpenChange={setMenuOpen} />

      <div className="page-canvas">
        <Canvas activePage={activePage} />
      </div>

      <div className="grain" aria-hidden="true" />

      {children}

      <footer className="u-visually-hidden">
        <p>&copy; 2026 Duforn. All rights reserved.</p>
      </footer>
    </>
  );
}
