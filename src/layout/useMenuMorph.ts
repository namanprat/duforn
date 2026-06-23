import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import gsap from "gsap";
import { MOTION_TOKENS } from "../lib/animation/motionTokens";
import { prefersReducedMotion } from "../lib/prefersReducedMotion";
import type { AboutPanelHandle } from "../components/AboutPanel";

export type MenuPhase = "closed" | "links" | "about";

type MenuFlags = {
  open: boolean;
  about: boolean;
  bodyVisible: boolean;
  aboutVisible: boolean;
};

const SURFACE_DIM_PROPS = "width,height";

function phaseOpen(phase: MenuPhase) {
  return phase !== "closed";
}

function phaseAbout(phase: MenuPhase) {
  return phase === "about";
}

function menuFlags(phase: MenuPhase, expanded = false): MenuFlags {
  if (phase === "closed") {
    return { open: false, about: false, bodyVisible: false, aboutVisible: false };
  }
  if (phase === "about") {
    return { open: true, about: true, bodyVisible: true, aboutVisible: expanded };
  }
  return { open: true, about: false, bodyVisible: expanded, aboutVisible: false };
}

function applyMenuFlags(menuNav: HTMLElement, flags: MenuFlags) {
  menuNav.classList.toggle("is-open", flags.open);
  menuNav.classList.toggle("is-about", flags.about || flags.aboutVisible);
  menuNav.classList.toggle("is-body-visible", flags.bodyVisible);
  menuNav.classList.toggle("is-about-visible", flags.aboutVisible);
}

function measureSurface(surface: HTMLElement) {
  void surface.offsetHeight;
  const { width, height } = surface.getBoundingClientRect();
  return { width: Math.ceil(width), height: Math.ceil(height) };
}

function readSurfaceDims(menuNav: HTMLElement, surface: HTMLElement, flags: MenuFlags) {
  applyMenuFlags(menuNav, flags);
  return measureSurface(surface);
}

type UseMenuMorphOptions = {
  phase: MenuPhase;
  scopeRef: RefObject<HTMLDivElement | null>;
  menuNavRef: RefObject<HTMLDivElement | null>;
  surfaceRef: RefObject<HTMLDivElement | null>;
  aboutPanelRef: RefObject<AboutPanelHandle | null>;
};

export function useMenuMorph({
  phase,
  scopeRef,
  menuNavRef,
  surfaceRef,
  aboutPanelRef,
}: UseMenuMorphOptions) {
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const prevPhaseRef = useRef<MenuPhase>("closed");
  const shellRef = useRef<MenuPhase | null>(null);

  const [shellPhase, setShellPhase] = useState<MenuPhase | null>(null);
  const [isMorphing, setIsMorphing] = useState(false);
  const [bodyVisible, setBodyVisible] = useState(false);
  const [aboutVisible, setAboutVisible] = useState(false);

  useLayoutEffect(() => {
    const scope = scopeRef.current;
    const menuNav = menuNavRef.current;
    const surface = surfaceRef.current;
    if (!scope || !menuNav || !surface) return;

    const lines = scope.querySelectorAll<HTMLElement>(".menu-nav__line");
    const about = scope.querySelector<HTMLElement>(".menu-nav__about");
    const { menu } = MOTION_TOKENS;
    const reduced = prefersReducedMotion();
    const prev = prevPhaseRef.current;
    const isOpen = phaseOpen(phase);
    const isAbout = phaseAbout(phase);
    const prevOpen = phaseOpen(prev);
    const prevAbout = phaseAbout(prev);

    const menuJustClosed = !isOpen && prevOpen;
    const menuJustOpened = isOpen && !prevOpen;
    const aboutJustOpened = isAbout && !prevAbout && isOpen;
    const aboutJustClosed = !isAbout && prevAbout && isOpen;
    const isMidTransition =
      menuJustOpened || menuJustClosed || aboutJustOpened || aboutJustClosed;

    const commitPhase = () => {
      prevPhaseRef.current = phase;
    };

    const finishMorph = () => {
      menuNav.classList.remove("is-morphing");
      gsap.set(surface, { clearProps: SURFACE_DIM_PROPS });
      if (about && isAbout) {
        gsap.set(about, { clearProps: "opacity,visibility" });
      }
      setBodyVisible(isOpen);
      setAboutVisible(isAbout);
      setIsMorphing(false);
      shellRef.current = null;
      setShellPhase(null);
      commitPhase();
      timelineRef.current = null;
    };

    const syncLiveFlags = (body: boolean, aboutPanel: boolean) => {
      const shell = shellRef.current;
      const flags: MenuFlags = {
        open: isOpen || (shell !== null && shell !== "closed"),
        about: isAbout || aboutPanel || shell === "about",
        bodyVisible: body,
        aboutVisible: aboutPanel,
      };
      applyMenuFlags(menuNav, flags);
    };

    if (!isOpen && !prevOpen) {
      menuNav.classList.remove("is-morphing");
      gsap.set(surface, { clearProps: SURFACE_DIM_PROPS });
      applyMenuFlags(menuNav, menuFlags("closed"));
      gsap.set(lines, { yPercent: 120, autoAlpha: 0 });
      setBodyVisible(false);
      setAboutVisible(false);
      commitPhase();
      return () => timelineRef.current?.kill();
    }

    if (!isMidTransition && isOpen) {
      return () => {};
    }

    timelineRef.current?.kill();

    const fromDims = readSurfaceDims(
      menuNav,
      surface,
      menuFlags(prev, prevOpen),
    );

    let toDims: { width: number; height: number };
    if (aboutJustOpened) {
      gsap.set(surface, { clearProps: SURFACE_DIM_PROPS });
      syncLiveFlags(true, false);
      toDims = readSurfaceDims(menuNav, surface, {
        open: true,
        about: true,
        bodyVisible: true,
        aboutVisible: false,
      });
    } else {
      toDims = readSurfaceDims(menuNav, surface, menuFlags(phase, isOpen));
    }

    const toExpanded = isOpen && !isAbout;
    const toAboutExpanded = isAbout;

    if (reduced) {
      menuNav.classList.remove("is-morphing");
      gsap.set(surface, { clearProps: SURFACE_DIM_PROPS });
      syncLiveFlags(toExpanded, toAboutExpanded);
      gsap.set(lines, {
        yPercent: isOpen && !isAbout ? 0 : isAbout ? -120 : 120,
        autoAlpha: isOpen && !isAbout ? 1 : 0,
      });
      setBodyVisible(isOpen);
      setAboutVisible(toAboutExpanded);
      if (about && isAbout) {
        gsap.set(about, { clearProps: "opacity,visibility" });
      }
      commitPhase();
      return () => timelineRef.current?.kill();
    }

    menuNav.classList.add("is-morphing");
    shellRef.current = prev;
    setShellPhase(prev);
    setIsMorphing(true);
    gsap.set(surface, { width: fromDims.width, height: fromDims.height });

    const closingAbout = aboutJustClosed || (menuJustClosed && prevAbout);
    const aboutHideDuration = closingAbout ? (aboutPanelRef.current?.hide() ?? 0) : 0;

    if (menuJustClosed) {
      if (prevAbout) {
        syncLiveFlags(true, true);
        gsap.set(lines, { yPercent: -120, autoAlpha: 0 });
      } else {
        syncLiveFlags(true, false);
        gsap.set(lines, { yPercent: 0, autoAlpha: 1 });
      }
    } else if (aboutJustClosed) {
      syncLiveFlags(true, true);
      gsap.set(lines, { yPercent: -120, autoAlpha: 0 });
    } else if (aboutJustOpened) {
      syncLiveFlags(true, false);
      if (about) gsap.set(about, { autoAlpha: 0 });
      gsap.set(lines, { yPercent: 0, autoAlpha: 1 });
    } else if (!isOpen) {
      syncLiveFlags(false, false);
      gsap.set(lines, { yPercent: 120, autoAlpha: 0 });
    }

    const isShrinking =
      toDims.width < fromDims.width - 1 || toDims.height < fromDims.height - 1;
    const boxDuration =
      aboutJustOpened || aboutJustClosed || (menuJustClosed && prevAbout)
        ? menu.aboutDuration * menu.expandScale
        : menu.openDuration;
    const boxEase = isShrinking ? menu.boxShrinkEase : menu.boxOpenEase;
    const contentAt = boxDuration * 0.35;
    const lineFlipDuration = menu.lineDuration * 0.75;

    const tl = gsap.timeline({ onComplete: finishMorph });

    tl.to(
      surface,
      { width: toDims.width, height: toDims.height, duration: boxDuration, ease: boxEase },
      0,
    );

    if (menuJustClosed) {
      if (prevAbout) {
        tl.call(() => {
          shellRef.current = "links";
          setShellPhase("links");
          syncLiveFlags(false, false);
          setBodyVisible(false);
          setAboutVisible(false);
        }, [], aboutHideDuration);
      } else {
        tl.to(
          lines,
          {
            yPercent: 120,
            autoAlpha: 0,
            duration: menu.lineDuration,
            ease: menu.closeEase,
            stagger: { each: menu.lineStagger, from: "end" },
          },
          0,
        );
        tl.call(() => {
          syncLiveFlags(false, false);
          setBodyVisible(false);
          setAboutVisible(false);
        }, [], contentAt);
      }
    } else if (aboutJustOpened) {
      tl.to(
        lines,
        {
          yPercent: -120,
          autoAlpha: 0,
          duration: lineFlipDuration,
          ease: menu.closeEase,
          stagger: { each: menu.lineStagger, from: "end" },
        },
        0,
      );
      tl.call(() => {
        syncLiveFlags(true, true);
        setAboutVisible(true);
        if (about) gsap.set(about, { clearProps: "opacity,visibility" });
      }, [], boxDuration);
    } else if (aboutJustClosed) {
      const linksAt = contentAt;

      tl.fromTo(
        lines,
        { yPercent: -120, autoAlpha: 0 },
        {
          yPercent: 0,
          autoAlpha: 1,
          duration: lineFlipDuration,
          ease: menu.ease,
          stagger: menu.lineStagger,
        },
        linksAt,
      );
      tl.call(() => {
        shellRef.current = "links";
        setShellPhase("links");
        syncLiveFlags(true, false);
        setAboutVisible(false);
        setBodyVisible(true);
      }, [], aboutHideDuration);
    } else if (isOpen && !isAbout) {
      tl.call(() => {
        syncLiveFlags(true, false);
        setBodyVisible(true);
      }, [], contentAt);
      tl.fromTo(
        lines,
        { yPercent: prevAbout ? -120 : 120, autoAlpha: 0 },
        {
          yPercent: 0,
          autoAlpha: 1,
          duration: menu.lineDuration,
          ease: menu.ease,
          stagger: menu.lineStagger,
        },
        contentAt,
      );
    }

    timelineRef.current = tl;

    return () => {
      timelineRef.current?.kill();
      menuNav.classList.remove("is-morphing");
      shellRef.current = null;
      setShellPhase(null);
      setIsMorphing(false);
    };
  }, [aboutPanelRef, menuNavRef, phase, scopeRef, surfaceRef]);

  const isOpen = phase !== "closed";
  const isAbout = phase === "about";

  return {
    isMorphing,
    // ponytail: keep intent (phase) authoritative during morph; shellPhase is layout-only
    shellOpen: isOpen || (shellPhase !== null && shellPhase !== "closed"),
    shellAbout: isAbout || aboutVisible || shellPhase === "about",
    bodyVisible,
    aboutVisible,
  };
}
