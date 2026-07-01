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

// ponytail: inline span calc, extract only if a 6th callsite appears
const lineSpan = (n: number, dur: number, stagger: number) =>
  dur + stagger * Math.max(n - 1, 0);

// ponytail: --menu-pad-inline is only set at the mobile breakpoint. Measure it in px
// (0 on desktop) by probing a var-width element, so the gsap-driven brand indent
// matches the CSS token exactly without hard-coding a value.
function readMenuPadInlinePx(anchor: HTMLElement): number {
  const probe = document.createElement("span");
  probe.style.cssText =
    "position:absolute;left:0;top:0;height:0;visibility:hidden;pointer-events:none;width:var(--menu-pad-inline,0px)";
  anchor.appendChild(probe);
  const w = probe.getBoundingClientRect().width;
  probe.remove();
  return w;
}

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
  return { width: Math.round(width), height: Math.round(height) };
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

    // Brand ("Naman Pratulya" / clock) lives outside the menu subtree; move it in
    // unison with the box grow/shrink so it never leads the morph. 0px on desktop.
    const brand =
      scope.closest(".site-header")?.querySelector<HTMLElement>(".site-header__brand") ?? null;
    const brandIndent = brand ? readMenuPadInlinePx(brand) : 0;

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
      // ponytail: keep tweened px dims at rest — clearProps caused CSS handoff snap;
      // upgrade path: ResizeObserver remeasure if viewport-resize-while-open matters
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
      gsap.set(surface, { clearProps: SURFACE_DIM_PROPS });
      if (brand) gsap.set(brand, { x: phaseAbout(target) ? brandIndent : 0 });
      settle(target);
      return;
    }

    const start = (during: MenuFlags, fromD: { width: number; height: number }) => {
      setPresented(during);
      setIsMorphing(true);
      gsap.set(surface, { width: fromD.width, height: fromD.height });
    };

    const lineCount = lines.length;

    // closed -> links: grow, then headers reveal in from below.
    if (from === "closed" && target === "links") {
      const { fromD, toD } = measureFromTo(menuFlags("links", true));
      start(menuFlags("links", true), fromD);
      gsap.set(lines, { yPercent: 120, autoAlpha: 0 });

      const tl = gsap.timeline();
      tl.to(surface, { width: toD.width, height: toD.height, duration: menu.boxOpen, ease: menu.boxOpenEase }, 0);
      tl.fromTo(
        lines,
        { yPercent: 120, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: menu.line, ease: menu.ease, stagger: menu.lineStagger },
        menu.boxOpen,
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

      const close = menu.closeSpeedScale;
      const boxDuration = menu.boxOpen;
      const lineDur = menu.line * close;
      const lineStag = menu.lineStagger * close;
      const headerOut = lineSpan(lineCount, lineDur, lineStag);
      const tl = gsap.timeline();
      tl.to(
        lines,
        { yPercent: 120, autoAlpha: 0, duration: lineDur, ease: menu.closeEase, stagger: { each: lineStag, from: "end" } },
        0,
      );
      tl.to(surface, { width: toD.width, height: toD.height, duration: boxDuration, ease: menu.boxShrinkEase }, headerOut);
      // Safety: if About was mid-open when this fired, ease the brand back in unison.
      if (brand) tl.to(brand, { x: 0, duration: boxDuration, ease: menu.boxShrinkEase }, headerOut);
      tl.eventCallback("onComplete", () => settle("closed"));
      tlRef.current = tl;
      return;
    }

    // links -> about: headers flip up & out, grow, pause, then about text reveals.
    if (from === "links" && target === "about") {
      const { fromD, toD } = measureFromTo(menuFlags("about", true));
      start(menuFlags("links", true), fromD);
      if (aboutEl) gsap.set(aboutEl, { autoAlpha: 0 });
      gsap.set(lines, { yPercent: 0, autoAlpha: 1 });

      const lineFlip = menu.line * menu.lineFlipScale;
      const headerOut = lineSpan(lineCount, lineFlip, menu.lineStagger);
      const aboutAt = headerOut + menu.boxAbout;
      const tl = gsap.timeline();
      tl.to(
        lines,
        { yPercent: -120, autoAlpha: 0, duration: lineFlip, ease: menu.closeEase, stagger: { each: menu.lineStagger, from: "end" } },
        0,
      );
      tl.to(surface, { width: toD.width, height: toD.height, duration: menu.boxAbout, ease: menu.boxOpenEase }, headerOut);
      if (brand) tl.to(brand, { x: brandIndent, duration: menu.boxAbout, ease: menu.boxOpenEase }, headerOut);
      tl.to({}, { duration: menu.aboutRevealDelay }, aboutAt);
      tl.call(() => {
        setPresented(menuFlags("about", true));
        if (aboutEl) gsap.set(aboutEl, { clearProps: "opacity,visibility" });
      }, [], aboutAt + menu.aboutRevealDelay);
      tl.eventCallback("onComplete", () => settle("about"));
      tlRef.current = tl;
      return;
    }

    // about -> links (Back): about text up, shrink, then headers reveal in from top.
    if (from === "about" && target === "links") {
      const { fromD, toD } = measureFromTo(menuFlags("links", true));
      start(menuFlags("about", true), fromD);

      const close = menu.closeSpeedScale;
      const hideDur = aboutPanelRef.current?.hide(true) ?? 0;
      const boxDuration = menu.boxAbout;
      const revealAt = hideDur + boxDuration;
      const tl = gsap.timeline();
      tl.to(surface, { width: toD.width, height: toD.height, duration: boxDuration, ease: menu.boxShrinkEase }, hideDur);
      if (brand) tl.to(brand, { x: 0, duration: boxDuration, ease: menu.boxShrinkEase }, hideDur);
      tl.call(() => {
        setPresented(menuFlags("links", true));
        gsap.set(lines, { yPercent: -120, autoAlpha: 0 });
      }, [], revealAt);
      tl.fromTo(
        lines,
        { yPercent: -120, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: menu.line, ease: menu.ease, stagger: menu.lineStagger },
        revealAt,
      );
      tl.eventCallback("onComplete", () => settle("links"));
      tlRef.current = tl;
      return;
    }

    // about -> closed (click outside): about text down, shrink straight to pill.
    if (from === "about" && target === "closed") {
      const { fromD, toD } = measureFromTo(menuFlags("closed"));
      start(menuFlags("about", true), fromD);

      const hideDur = aboutPanelRef.current?.hide(false) ?? 0;
      const boxDuration = menu.boxAbout;
      const tl = gsap.timeline();
      tl.to(surface, { width: toD.width, height: toD.height, duration: boxDuration, ease: menu.boxShrinkEase }, hideDur);
      if (brand) tl.to(brand, { x: 0, duration: boxDuration, ease: menu.boxShrinkEase }, hideDur);
      tl.eventCallback("onComplete", () => settle("closed"));
      tlRef.current = tl;
      return;
    }

    // Fallback (rapid interrupts): morph the box, snap content.
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
      duration: grow ? menu.boxOpen : menu.boxAbout,
      ease: grow ? menu.boxOpenEase : menu.boxShrinkEase,
    }, 0);
    if (brand) tl.to(brand, {
      x: phaseAbout(target) ? brandIndent : 0,
      duration: grow ? menu.boxOpen : menu.boxAbout,
      ease: grow ? menu.boxOpenEase : menu.boxShrinkEase,
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

if (import.meta.env.DEV) {
  console.assert(lineSpan(4, 0.55, 0.07) === 0.76, "menu lineSpan invariant");
}
