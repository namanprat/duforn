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

// Closing (exit) animations run this much faster than their opening counterparts.
const CLOSE_SPEEDUP = 0.5;

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
  const settledRef = useRef<MenuPhase>("closed");
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const unmountRef = useRef(false);

  const [presented, setPresented] = useState<MenuFlags>(() => menuFlags("closed"));
  const [isMorphing, setIsMorphing] = useState(false);

  useLayoutEffect(() => {
    unmountRef.current = false;
    return () => {
      unmountRef.current = true;
      tlRef.current?.kill();
      tlRef.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    const scope = scopeRef.current;
    const menuNav = menuNavRef.current;
    const surface = surfaceRef.current;
    if (!scope || !menuNav || !surface) return;

    const lines = scope.querySelectorAll<HTMLElement>(".menu-nav__line");
    const aboutEl = scope.querySelector<HTMLElement>(".menu-nav__about");
    const { menu } = MOTION_TOKENS;
    const target = phase;
    const from = settledRef.current;

    const hadInFlight = !!tlRef.current;
    tlRef.current?.kill();
    tlRef.current = null;

    const settle = (next: MenuPhase) => {
      if (unmountRef.current) return;
      settledRef.current = next;
      tlRef.current = null;
      gsap.set(surface, { clearProps: SURFACE_DIM_PROPS });
      if (aboutEl && phaseAbout(next)) {
        gsap.set(aboutEl, { clearProps: "opacity,visibility" });
      }
      setPresented(menuFlags(next, phaseOpen(next)));
      setIsMorphing(false);
    };

    // Measure current (animated) size, then natural target size from `toFlags`.
    const measureFromTo = (toFlags: MenuFlags) => {
      const fromD = measureSurface(surface);
      gsap.set(surface, { clearProps: SURFACE_DIM_PROPS });
      const toD = readSurfaceDims(menuNav, surface, toFlags);
      gsap.set(surface, { width: fromD.width, height: fromD.height });
      return { fromD, toD };
    };

    // Already resting at target — nothing to animate.
    if (target === from && !hadInFlight) {
      applyMenuFlags(menuNav, menuFlags(target, phaseOpen(target)));
      setPresented(menuFlags(target, phaseOpen(target)));
      setIsMorphing(false);
      return;
    }

    if (prefersReducedMotion()) {
      gsap.set(lines, {
        yPercent: phaseOpen(target) && !phaseAbout(target) ? 0 : phaseAbout(target) ? -120 : 120,
        autoAlpha: phaseOpen(target) && !phaseAbout(target) ? 1 : 0,
      });
      settle(target);
      return;
    }

    const start = (during: MenuFlags, fromD: { width: number; height: number }) => {
      setPresented(during);
      setIsMorphing(true);
      gsap.set(surface, { width: fromD.width, height: fromD.height });
    };

    // closed -> links: grow, then headers reveal in from below.
    if (from === "closed" && target === "links") {
      const { fromD, toD } = measureFromTo(menuFlags("links", true));
      start(menuFlags("links", true), fromD);
      gsap.set(lines, { yPercent: 120, autoAlpha: 0 });

      const boxDuration = menu.openDuration;
      const tl = gsap.timeline();
      tl.to(surface, { width: toD.width, height: toD.height, duration: boxDuration, ease: menu.boxOpenEase }, 0);
      tl.fromTo(
        lines,
        { yPercent: 120, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: menu.lineDuration, ease: menu.ease, stagger: menu.lineStagger },
        boxDuration,
      );
      tl.eventCallback("onComplete", () => settle("links"));
      tlRef.current = tl;
      return;
    }

    // links -> closed: headers out (down), then shrink to pill.
    if (from === "links" && target === "closed") {
      const { fromD, toD } = measureFromTo(menuFlags("closed"));
      start(menuFlags("links", true), fromD);
      gsap.set(lines, { yPercent: 0, autoAlpha: 1 });

      const boxDuration = menu.openDuration * CLOSE_SPEEDUP;
      const lineDur = menu.lineDuration * CLOSE_SPEEDUP;
      const lineStag = menu.lineStagger * CLOSE_SPEEDUP;
      // Headers unreveal fully first, then the box collapses.
      const headerOut = lineDur + lineStag * Math.max(lines.length - 1, 0);
      const tl = gsap.timeline();
      tl.to(
        lines,
        { yPercent: 120, autoAlpha: 0, duration: lineDur, ease: menu.closeEase, stagger: { each: lineStag, from: "end" } },
        0,
      );
      tl.to(surface, { width: toD.width, height: toD.height, duration: boxDuration, ease: menu.boxShrinkEase }, headerOut);
      tl.eventCallback("onComplete", () => settle("closed"));
      tlRef.current = tl;
      return;
    }

    // links -> about: headers flip up & out, grow, then about text reveals.
    if (from === "links" && target === "about") {
      const { fromD, toD } = measureFromTo(menuFlags("about", true));
      // Keep LINKS presentation during the flip so the header list stays visible/tweenable.
      start(menuFlags("links", true), fromD);
      if (aboutEl) gsap.set(aboutEl, { autoAlpha: 0 });
      gsap.set(lines, { yPercent: 0, autoAlpha: 1 });

      const boxDuration = menu.aboutDuration * menu.expandScale;
      const lineFlip = menu.lineDuration * 0.75;
      // Headers flip up fully first, then the box grows, then about text reveals.
      const headerOut = lineFlip + menu.lineStagger * Math.max(lines.length - 1, 0);
      const tl = gsap.timeline();
      tl.to(
        lines,
        { yPercent: -120, autoAlpha: 0, duration: lineFlip, ease: menu.closeEase, stagger: { each: menu.lineStagger, from: "end" } },
        0,
      );
      tl.to(surface, { width: toD.width, height: toD.height, duration: boxDuration, ease: menu.boxOpenEase }, headerOut);
      tl.call(() => {
        // Box is full-size: switch to about and let AboutPanel reveal its text.
        setPresented(menuFlags("about", true));
        if (aboutEl) gsap.set(aboutEl, { clearProps: "opacity,visibility" });
      }, [], headerOut + boxDuration);
      tl.eventCallback("onComplete", () => settle("about"));
      tlRef.current = tl;
      return;
    }

    // about -> links (Back): about text up, shrink, then headers reveal in from top.
    if (from === "about" && target === "links") {
      const { fromD, toD } = measureFromTo(menuFlags("links", true));
      // Keep ABOUT presentation while its text unreveals (panel stays mounted).
      start(menuFlags("about", true), fromD);

      const hideDur = aboutPanelRef.current?.hide(true) ?? 0;
      const boxDuration = menu.aboutDuration * menu.expandScale;
      // Text unreveals fully first, then the box resizes, then headers come in.
      const revealAt = hideDur + boxDuration;
      const tl = gsap.timeline();
      tl.to(surface, { width: toD.width, height: toD.height, duration: boxDuration, ease: menu.closeEase }, hideDur);
      tl.call(() => {
        // Text is gone: hand the box back to the links list and drop the about panel.
        setPresented(menuFlags("links", true));
        gsap.set(lines, { yPercent: -120, autoAlpha: 0 });
      }, [], revealAt);
      tl.fromTo(
        lines,
        { yPercent: -120, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: menu.lineDuration, ease: menu.ease, stagger: menu.lineStagger },
        revealAt,
      );
      tl.eventCallback("onComplete", () => settle("links"));
      tlRef.current = tl;
      return;
    }

    // about -> closed (click outside): about text down, shrink straight to pill.
    if (from === "about" && target === "closed") {
      const { fromD, toD } = measureFromTo(menuFlags("closed"));
      // Keep ABOUT presentation while its text unreveals.
      start(menuFlags("about", true), fromD);

      const hideDur = aboutPanelRef.current?.hide(false) ?? 0;
      const boxDuration = menu.aboutDuration * menu.expandScale;
      // Text unreveals fully first, then the box collapses to the pill.
      const tl = gsap.timeline();
      tl.to(surface, { width: toD.width, height: toD.height, duration: boxDuration, ease: menu.closeEase }, hideDur);
      tl.eventCallback("onComplete", () => settle("closed"));
      tlRef.current = tl;
      return;
    }

    // Fallback (rapid interrupts, e.g. closed->closed): morph the box, snap content.
    const { fromD, toD } = measureFromTo(menuFlags(target, phaseOpen(target)));
    start(menuFlags(target, phaseOpen(target)), fromD);
    if (phaseOpen(target) && !phaseAbout(target)) {
      gsap.set(lines, { yPercent: 0, autoAlpha: 1 });
    }
    const grow = toD.height >= fromD.height;
    const tl = gsap.timeline();
    tl.to(surface, {
      width: toD.width,
      height: toD.height,
      duration: menu.openDuration,
      ease: grow ? menu.boxOpenEase : menu.closeEase,
    }, 0);
    tl.eventCallback("onComplete", () => settle(target));
    tlRef.current = tl;
  }, [aboutPanelRef, menuNavRef, phase, scopeRef, surfaceRef]);

  return {
    isMorphing,
    shellOpen: presented.open,
    shellAbout: presented.about,
    bodyVisible: presented.bodyVisible,
    aboutVisible: presented.aboutVisible,
  };
}
