import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import gsap from "gsap";
import { MOTION_TOKENS } from "../lib/animation/motionTokens";
import { prefersReducedMotion } from "../lib/prefersReducedMotion";
import type { AboutPanelHandle } from "../components/AboutPanel";

export type MenuPhase = "closed" | "links" | "about";

// Every transition is the same three beats — old content exits, box morphs,
// new content enters — with direction derived from this depth order.
const ORDER: Record<MenuPhase, number> = { closed: 0, links: 1, about: 2 };

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

  // Viewport resize (rotation, breakpoint cross) while at rest: drop the tweened
  // px dims so the CSS-defined natural size takes over. Any snap is masked by the
  // resize itself; mid-morph resizes are left to the in-flight timeline.
  useLayoutEffect(() => {
    const onResize = () => {
      if (tlRef.current || !surfaceRef.current) return;
      gsap.set(surfaceRef.current, { clearProps: SURFACE_DIM_PROPS });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [surfaceRef]);

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
    const dir = ORDER[target] - ORDER[from]; // >0 deeper, <0 back, 0 interrupt

    const hadInFlight = !!tlRef.current;
    tlRef.current?.kill();
    tlRef.current = null;

    const settle = (next: MenuPhase) => {
      if (unmountRef.current) return;
      settledRef.current = next;
      tlRef.current = null;
      // ponytail: keep tweened px dims at rest — clearProps caused CSS handoff snap;
      // viewport resizes remeasure via the resize listener above.
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

    const { fromD, toD } = measureFromTo(menuFlags(target, phaseOpen(target)));

    // While morphing, present whichever open phase owns the visible content;
    // the enter beat switches to the target's flags when its content reveals.
    setPresented(menuFlags(from === "closed" ? target : from, true));
    setIsMorphing(true);
    gsap.set(surface, { width: fromD.width, height: fromD.height });

    const tl = gsap.timeline();

    // Beat 1 — exit old content. `.to()` (not set+fromTo) so interrupted lines
    // animate out from wherever they are instead of snapping.
    let exitDur = 0;
    if (from === "links" && target !== "links") {
      const deeper = dir > 0;
      const lineDur = menu.line * (deeper ? menu.lineFlipScale : menu.closeSpeedScale);
      const lineStag = menu.lineStagger * (deeper ? 1 : menu.closeSpeedScale);
      exitDur = lineSpan(lines.length, lineDur, lineStag);
      tl.to(
        lines,
        {
          yPercent: deeper ? -120 : 120,
          autoAlpha: 0,
          duration: lineDur,
          ease: menu.closeEase,
          stagger: { each: lineStag, from: "end" },
        },
        0,
      );
    } else if (from === "about") {
      exitDur = aboutPanelRef.current?.hide(target === "links") ?? 0;
    }

    // Beat 2 — box morph (brand indent rides along).
    const boxDur = phaseAbout(from) || phaseAbout(target) ? menu.boxAbout : menu.boxOpen;
    const growing = dir > 0 || (dir === 0 && toD.height >= fromD.height);
    const boxEase = growing ? menu.boxOpenEase : menu.boxShrinkEase;
    tl.to(surface, { width: toD.width, height: toD.height, duration: boxDur, ease: boxEase }, exitDur);
    if (brand) {
      tl.to(brand, { x: phaseAbout(target) ? brandIndent : 0, duration: boxDur, ease: boxEase }, exitDur);
    }

    // Beat 3 — enter new content.
    const enterAt = exitDur + boxDur;
    if (target === "links" && from !== "links") {
      const entryY = dir < 0 ? -120 : 120;
      gsap.set(lines, { yPercent: entryY, autoAlpha: 0 });
      tl.call(() => setPresented(menuFlags("links", true)), [], enterAt);
      tl.fromTo(
        lines,
        { yPercent: entryY, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: menu.line, ease: menu.ease, stagger: menu.lineStagger },
        enterAt,
      );
    } else if (target === "about") {
      if (aboutEl) gsap.set(aboutEl, { autoAlpha: 0 });
      tl.call(() => {
        setPresented(menuFlags("about", true));
        if (aboutEl) gsap.set(aboutEl, { clearProps: "opacity,visibility" });
      }, [], enterAt + menu.aboutRevealDelay);
    } else if (target === "links") {
      // links -> links interrupt: box remorphs, lines just need to be at rest.
      gsap.set(lines, { yPercent: 0, autoAlpha: 1 });
    }

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
  console.assert(
    ORDER.closed < ORDER.links && ORDER.links < ORDER.about,
    "menu phase depth order invariant",
  );
}
