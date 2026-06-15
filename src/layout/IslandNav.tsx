// @ts-nocheck
import React, { useRef, useState, useEffect, useCallback, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import { navigateTo } from "../lib/nav";
import RotateHoverLabel from "../ui/HoverLabel";
import { STUDIO_ABOUT_PARAGRAPHS, STUDIO_CLIENTS } from "../content/studio";
import { MOTION_TOKENS } from "../lib/anim/tokens";

gsap.registerPlugin(useGSAP, SplitText);

const MENU_LINKS = [
  { to: "/work", label: "Work" },
  { to: "/contact", label: "Contact" },
];

const ABOUT_TEXT_SELECTOR =
  ".island-nav__about-copy p, .island-nav__clients-label, .island-nav__clients-list li";

const PANEL_ID = "site-menu";
const ABOUT_DETAIL_ID = "island-about-detail";

// 3D link animation config — refined for cleaner, more dynamic feel
const LINK_PERSPECTIVE = 900;
const LINK_ENTER = { y: 32, autoAlpha: 0, rotationX: -20, transformPerspective: LINK_PERSPECTIVE };
const LINK_EXIT_UP = { y: -20, autoAlpha: 0, rotationX: 14, transformPerspective: LINK_PERSPECTIVE };
const LINK_REST = { y: 0, autoAlpha: 1, rotationX: 0 };

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

const IslandNavLink = React.forwardRef(function IslandNavLink(
  { to, className, children, onNavigate, ...props },
  ref,
) {
  const location = useLocation();
  const { onClick: onClickProp, ...restProps } = props;

  const handleClick = (e) => {
    onClickProp?.(e);
    if (e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    e.preventDefault();
    onNavigate?.();
    if (location.pathname !== to) {
      navigateTo(to);
    }
  };

  const isActive = location.pathname === to;

  return (
    <a
      ref={ref}
      href={to}
      className={className}
      onClick={handleClick}
      aria-current={isActive ? "page" : undefined}
      {...restProps}
    >
      {children}
    </a>
  );
});

export default function IslandNav({ onMenuOpenChange }) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const rootRef = useRef(null);
  const headerRef = useRef(null);
  const panelRef = useRef(null);
  const linksBlockRef = useRef(null);
  const dividerRef = useRef(null);
  const aboutDetailRef = useRef(null);
  const linkRefs = useRef([]);
  const aboutToggleRef = useRef(null);
  const timelineRef = useRef(null);
  const hasOpenedRef = useRef(false);
  const prevStateRef = useRef({ isOpen: false, aboutOpen: false });
  const aboutSplitsRef = useRef([]);
  const aboutLinesRef = useRef([]);

  const measureIslandHeight = useCallback(({ open, aboutExpanded }) => {
    const header = headerRef.current;
    const panel = panelRef.current;
    const aboutDetail = aboutDetailRef.current;

    if (!header) return 0;

    const collapsedHeight = header.offsetHeight;
    if (!open || !panel) return collapsedHeight;

    const openClass = "island-nav__about-detail--open";
    const wasOpen = aboutDetail?.classList.contains(openClass) ?? false;
    const needsToggle = Boolean(aboutDetail) && aboutExpanded !== wasOpen;
    const linksBlock = linksBlockRef.current;
    const prevDisplay = linksBlock ? linksBlock.style.display : "";

    if (needsToggle) aboutDetail.classList.toggle(openClass, aboutExpanded);
    if (linksBlock) linksBlock.style.display = aboutExpanded ? "none" : prevDisplay === "none" ? "" : prevDisplay;
    const panelHeight = panel.scrollHeight;
    if (linksBlock) linksBlock.style.display = prevDisplay;
    if (needsToggle) aboutDetail.classList.toggle(openClass, wasOpen);

    return collapsedHeight + panelHeight;
  }, []);

  const revertAboutSplits = useCallback(() => {
    gsap.killTweensOf(aboutLinesRef.current);
    aboutSplitsRef.current.forEach((split) => {
      try {
        split?.revert();
      } catch {
        /* ignore */
      }
    });
    aboutSplitsRef.current = [];
    aboutLinesRef.current = [];
  }, []);

  const buildAboutSplits = useCallback(() => {
    const detail = aboutDetailRef.current;
    if (!detail) return [];
    revertAboutSplits();

    const lines = [];
    detail.querySelectorAll(ABOUT_TEXT_SELECTOR).forEach((element) => {
      const split = SplitText.create(element, {
        type: "lines",
        mask: "lines",
        linesClass: "text-reveal-line",
        lineThreshold: 0.1,
      });
      aboutSplitsRef.current.push(split);
      lines.push(...split.lines);
    });
    aboutLinesRef.current = lines;
    return lines;
  }, [revertAboutSplits]);

  const syncIslandClasses = useCallback((root, open, aboutExpanded) => {
    root.classList.toggle("island-nav--open", open);
    root.classList.toggle("island-nav--about-open", open && aboutExpanded);
  }, []);

  const getAnimTargets = useCallback(() => {
    return [...linkRefs.current.filter(Boolean), aboutToggleRef.current].filter(Boolean);
  }, []);

  const setPanelInteractive = useCallback((interactive) => {
    const panel = panelRef.current;
    if (!panel) return;
    panel.style.pointerEvents = interactive ? "auto" : "none";
    panel.setAttribute("aria-hidden", interactive ? "false" : "true");
  }, []);

  const closeMenu = useCallback(() => {
    setAboutOpen(false);
    setIsOpen(false);
  }, []);

  const toggleMenu = useCallback(() => {
    setAboutOpen(false);
    setIsOpen((open) => !open);
  }, []);

  const toggleAbout = useCallback(() => {
    setAboutOpen((open) => !open);
  }, []);

  useEffect(() => {
    onMenuOpenChange?.(isOpen);
  }, [isOpen, onMenuOpenChange]);

  useEffect(() => {
    document.body.classList.toggle("menu-open", isOpen);
    return () => document.body.classList.remove("menu-open");
  }, [isOpen]);

  useEffect(() => {
    closeMenu();
  }, [location.pathname, closeMenu]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      if (aboutOpen) {
        setAboutOpen(false);
      } else {
        closeMenu();
      }
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [aboutOpen, closeMenu, isOpen]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const aboutDetail = aboutDetailRef.current;
    const divider = dividerRef.current;
    if (!root) return undefined;

    timelineRef.current?.kill();
    gsap.killTweensOf(root);

    const reduce = prefersReducedMotion();
    const prev = prevStateRef.current;
    const targetHeight = measureIslandHeight({ open: isOpen, aboutExpanded: aboutOpen });
    const targets = getAnimTargets();
    const tokens = MOTION_TOKENS.textReveal;
    const linksBlock = linksBlockRef.current;
    const aboutClosing = !reduce && isOpen && prev.isOpen && prev.aboutOpen && !aboutOpen;

    syncIslandClasses(root, isOpen, aboutOpen);

    if (aboutDetail) {
      if (!aboutClosing) {
        aboutDetail.classList.toggle("island-nav__about-detail--open", aboutOpen);
      }
      aboutDetail.setAttribute("aria-hidden", aboutOpen ? "false" : "true");
    }

    if (reduce) {
      root.style.height = `${targetHeight}px`;
      if (linksBlock) {
        gsap.set(linksBlock, isOpen && aboutOpen ? { display: "none" } : { clearProps: "display" });
      }
      if (!aboutOpen) revertAboutSplits();
      gsap.set(targets, { y: 0, autoAlpha: isOpen ? 1 : 0 });
      if (aboutDetail) gsap.set(aboutDetail, { autoAlpha: isOpen && aboutOpen ? 1 : 0, y: 0 });
      if (divider) gsap.set(divider, { scaleX: isOpen ? 1 : 0 });
      setPanelInteractive(isOpen);
      prevStateRef.current = { isOpen, aboutOpen };
      return undefined;
    }

    const applyCollapsed = () => {
      const collapsedHeight = measureIslandHeight({ open: false, aboutExpanded: false });
      root.style.height = `${collapsedHeight}px`;
      gsap.set(targets, { ...LINK_ENTER });
      if (linksBlock) gsap.set(linksBlock, { clearProps: "display" });
      revertAboutSplits();
      if (aboutDetail) gsap.set(aboutDetail, { autoAlpha: 0, y: 8, filter: "blur(0px)" });
      if (divider) gsap.set(divider, { scaleX: 0, transformOrigin: "left center" });
      setPanelInteractive(false);
      syncIslandClasses(root, false, false);
    };

    if (!isOpen) {
      if (hasOpenedRef.current) {
        const collapsedHeight = measureIslandHeight({ open: false, aboutExpanded: false });
        syncIslandClasses(root, false, false);

        const tl = gsap.timeline({
          onComplete: () => {
            setPanelInteractive(false);
            timelineRef.current = null;
            if (linksBlock) gsap.set(linksBlock, { clearProps: "display" });
            revertAboutSplits();
          },
        });

        // About detail out (if was open) — fast fade
        if (aboutDetail && prev.aboutOpen) {
          tl.to(aboutDetail, { autoAlpha: 0, y: -12, filter: "blur(4px)", duration: 0.16, ease: "power2.in" }, 0);
        }

        // Links exit — snappy, from end
        tl.to(targets, {
          ...LINK_EXIT_UP,
          duration: 0.24,
          stagger: { amount: 0.08, from: "end" },
          ease: "power2.in",
        }, 0.04);

        // Divider retracts from right — matches collapse timing
        if (divider) {
          tl.to(divider, { scaleX: 0, transformOrigin: "right center", duration: 0.22, ease: "power2.in" }, 0.06);
        }

        // Island collapses — smooth, coordinated
        tl.to(root, { height: collapsedHeight, duration: 0.35, ease: "power3.inOut" }, 0.02);

        timelineRef.current = tl;
      } else {
        applyCollapsed();
      }
      prevStateRef.current = { isOpen, aboutOpen };
      return () => {
        timelineRef.current?.kill();
        timelineRef.current = null;
      };
    }

    const menuJustOpened = isOpen && !prev.isOpen;
    const aboutJustToggled = isOpen && prev.isOpen && aboutOpen !== prev.aboutOpen;

    if (menuJustOpened) {
      hasOpenedRef.current = true;
      setPanelInteractive(true);
      if (linksBlock) gsap.set(linksBlock, { clearProps: "display" });
      revertAboutSplits();

      const collapsedHeight = measureIslandHeight({ open: false, aboutExpanded: false });
      const menuHeight = measureIslandHeight({ open: true, aboutExpanded: false });

      const tl = gsap.timeline({
        onComplete: () => {
          timelineRef.current = null;
          gsap.set(root, { height: measureIslandHeight({ open: true, aboutExpanded: false }) });
        },
      });

      // Island expands with dynamic easing
      tl.fromTo(root,
        { height: collapsedHeight },
        { height: menuHeight, duration: 0.48, ease: "expo.out" },
        0,
      );

      // Divider draws in with smooth curve
      if (divider) {
        tl.fromTo(divider,
          { scaleX: 0, transformOrigin: "left center" },
          { scaleX: 1, duration: 0.45, ease: "expo.out" },
          0.08,
        );
      }

      // Links fold down — fluid, staggered entry
      tl.fromTo(targets,
        { ...LINK_ENTER },
        { ...LINK_REST, duration: 0.58, stagger: { amount: 0.08, from: "start" }, ease: "expo.out" },
        0.15,
      );

      timelineRef.current = tl;
    } else if (aboutJustToggled) {
      const tl = gsap.timeline({
        onComplete: () => {
          timelineRef.current = null;
          gsap.set(root, { height: measureIslandHeight({ open: true, aboutExpanded: aboutOpen }) });
        },
      });

      if (aboutOpen && aboutDetail) {
        // Links exit upward — quick and smooth
        tl.to(targets, {
          ...LINK_EXIT_UP,
          duration: 0.2,
          stagger: { amount: 0.06, from: "end" },
          ease: "power2.in",
        }, 0);

        if (linksBlock) tl.set(linksBlock, { display: "none" });

        // Island expands for about content
        tl.add(() => {
          gsap.to(root, {
            height: measureIslandHeight({ open: true, aboutExpanded: true }),
            duration: 0.48,
            ease: "expo.out",
          });
        }, 0.08);

        // About text reveals with fluid animation
        tl.add(() => {
          const lines = buildAboutSplits();
          gsap.set(aboutDetail, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
          if (lines.length) {
            gsap.set(lines, { y: "108%", filter: "blur(6px)" });
            gsap.to(lines, {
              y: "0%",
              filter: "blur(0px)",
              duration: 0.8,
              stagger: 0.045,
              ease: "expo.out",
            });
          }
        }, 0.18);
      } else if (aboutDetail) {
        // Lines exit upward with smooth blur
        const lines = aboutLinesRef.current;
        if (lines.length) {
          tl.to(lines, {
            y: "-105%",
            filter: "blur(4px)",
            duration: 0.2,
            stagger: { amount: 0.07, from: "end" },
            ease: "power2.in",
          }, 0);
        } else {
          tl.to(aboutDetail, { autoAlpha: 0, y: -10, filter: "blur(4px)", duration: 0.16, ease: "power2.in" }, 0);
        }

        tl.add(() => {
          aboutDetail.classList.remove("island-nav__about-detail--open");
          gsap.set(aboutDetail, { autoAlpha: 0, y: 14, filter: "blur(0px)" });
          revertAboutSplits();
          if (linksBlock) gsap.set(linksBlock, { clearProps: "display" });
          gsap.to(root, {
            height: measureIslandHeight({ open: true, aboutExpanded: false }),
            duration: 0.4,
            ease: "expo.out",
          });
        }, 0.06);

        // Links return with fluid 3D fold
        tl.fromTo(targets,
          { ...LINK_ENTER },
          { ...LINK_REST, duration: 0.52, stagger: { amount: 0.07, from: "start" }, ease: "expo.out" },
          0.12,
        );
      }

      timelineRef.current = tl;
    } else if (isOpen) {
      // Already open — sync state immediately
      gsap.set(root, { height: targetHeight });
      if (linksBlock) {
        gsap.set(linksBlock, aboutOpen ? { display: "none" } : { clearProps: "display" });
      }
      gsap.set(targets, { ...LINK_REST });
      if (aboutDetail) {
        gsap.set(aboutDetail, { autoAlpha: aboutOpen ? 1 : 0, y: aboutOpen ? 0 : 12, filter: "blur(0px)" });
      }
      if (divider) {
        gsap.set(divider, { scaleX: 1, transformOrigin: "left center" });
      }
      setPanelInteractive(true);
    }

    prevStateRef.current = { isOpen, aboutOpen };

    return () => {
      timelineRef.current?.kill();
      timelineRef.current = null;
    };
  }, [
    aboutOpen,
    buildAboutSplits,
    getAnimTargets,
    isOpen,
    measureIslandHeight,
    revertAboutSplits,
    setPanelInteractive,
    syncIslandClasses,
  ]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || !isOpen) return undefined;

    const ro = new ResizeObserver(() => {
      const root = rootRef.current;
      if (!root || !isOpen || timelineRef.current?.isActive()) return;
      const height = measureIslandHeight({ open: true, aboutExpanded: aboutOpen });
      gsap.to(root, {
        height,
        duration: 0.25,
        ease: "power2.out",
        overwrite: true,
      });
    });

    ro.observe(panel);
    return () => ro.disconnect();
  }, [aboutOpen, isOpen, measureIslandHeight]);

  useEffect(() => {
    return () => {
      timelineRef.current?.kill();
      revertAboutSplits();
    };
  }, [revertAboutSplits]);

  const handleNavigate = useCallback(() => {
    closeMenu();
  }, [closeMenu]);

  const handleToggleClick = useCallback(() => {
    if (isOpen && aboutOpen) {
      setAboutOpen(false);
      return;
    }
    toggleMenu();
  }, [aboutOpen, isOpen, toggleMenu]);

  const toggleLabel = !isOpen ? "MENU" : aboutOpen ? "BACK" : "CLOSE";
  const linkClassName = "island-nav__link u-text-style-h2 u-text-style-font-primary";

  return (
    <header className="island-nav-wrap">
      <button
        type="button"
        className="island-nav-backdrop"
        aria-hidden={!isOpen}
        tabIndex={isOpen ? 0 : -1}
        onClick={closeMenu}
      />
      <nav className="island-nav" ref={rootRef} aria-label="Site navigation">
        <div className="island-nav__header" ref={headerRef}>
          <IslandNavLink to="/" className="link-main island-nav__brand" onNavigate={handleNavigate}>
            Duforn
          </IslandNavLink>
          <button
            type="button"
            className="island-nav__toggle"
            aria-expanded={isOpen}
            aria-controls={PANEL_ID}
            onClick={handleToggleClick}
          >
            <RotateHoverLabel key={toggleLabel} text={toggleLabel} />
          </button>
        </div>
        <div id={PANEL_ID} className="island-nav__panel" ref={panelRef} aria-hidden="true">
          <div className="island-nav__divider" ref={dividerRef} />
          <div className="island-nav__links-block" ref={linksBlockRef}>
            <ul className="island-nav__links">
              {MENU_LINKS.map((item, index) => (
                <li key={item.to}>
                  <IslandNavLink
                    to={item.to}
                    className={linkClassName}
                    onNavigate={handleNavigate}
                    ref={(node) => {
                      linkRefs.current[index] = node;
                    }}
                  >
                    {item.label}
                  </IslandNavLink>
                </li>
              ))}
            </ul>
            <button
              type="button"
              ref={aboutToggleRef}
              className={`${linkClassName} island-nav__link--about`}
              aria-expanded={aboutOpen}
              aria-controls={ABOUT_DETAIL_ID}
              onClick={toggleAbout}
            >
              About
            </button>
          </div>
          <div
            id={ABOUT_DETAIL_ID}
            className="island-nav__about-detail"
            ref={aboutDetailRef}
            aria-hidden="true"
          >
            <div className="island-nav__about-grid">
              <div className="island-nav__about-copy">
                {STUDIO_ABOUT_PARAGRAPHS.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <div className="island-nav__clients">
                <p className="island-nav__clients-label">Clients</p>
                <ul className="island-nav__clients-list">
                  {STUDIO_CLIENTS.map((client) => (
                    <li key={client}>{client}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
