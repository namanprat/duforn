// @ts-nocheck
import React, { useRef, useState, useEffect, useCallback, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { navigateTo } from "../lib/nav";
import RotateHoverLabel from "../ui/HoverLabel";
import { STUDIO_ABOUT_PARAGRAPHS, STUDIO_CLIENTS } from "../content/studio";
import { MOTION_TOKENS } from "../lib/anim/tokens";

gsap.registerPlugin(SplitText);

const MENU_LINKS = [
  { to: "/work", label: "Work" },
  { to: "/contact", label: "Contact" },
];

const ABOUT_TEXT_SELECTOR =
  ".island-nav__about-copy p, .island-nav__clients-label, .island-nav__clients-list li";

const PANEL_ID = "site-menu";
const ABOUT_DETAIL_ID = "island-about-detail";

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

    // Measure the panel with the about detail and links block forced to their
    // target states so the result includes margins, padding, and border.
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
      // While animating about closed, the open class stays on until the line
      // hide finishes (the timeline removes it); otherwise sync immediately.
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
      gsap.set(targets, { y: 0, opacity: isOpen ? 1 : 0 });
      if (aboutDetail) gsap.set(aboutDetail, { opacity: isOpen && aboutOpen ? 1 : 0, y: 0 });
      setPanelInteractive(isOpen);
      prevStateRef.current = { isOpen, aboutOpen };
      return undefined;
    }

    const applyCollapsed = () => {
      const collapsedHeight = measureIslandHeight({ open: false, aboutExpanded: false });
      root.style.height = `${collapsedHeight}px`;
      gsap.set(root, { scaleY: 1 });
      gsap.set(targets, { y: 12, opacity: 0 });
      if (linksBlock) gsap.set(linksBlock, { clearProps: "display" });
      revertAboutSplits();
      if (aboutDetail) gsap.set(aboutDetail, { opacity: 0, y: 8 });
      setPanelInteractive(false);
      syncIslandClasses(root, false, false);
    };

    if (!isOpen) {
      if (hasOpenedRef.current) {
        const collapsedHeight = measureIslandHeight({ open: false, aboutExpanded: false });
        syncIslandClasses(root, false, false);
        const tl = gsap.timeline({
          defaults: { ease: "power3.inOut" },
          onComplete: () => {
            setPanelInteractive(false);
            timelineRef.current = null;
            if (linksBlock) gsap.set(linksBlock, { clearProps: "display" });
            revertAboutSplits();
          },
        });

        if (aboutDetail && prev.aboutOpen) {
          tl.to(aboutDetail, { opacity: 0, y: 8, duration: 0.2, ease: tokens.hideEase }, 0);
        }
        tl.to(
          targets,
          {
            y: 8,
            opacity: 0,
            duration: tokens.hideDuration * 0.45,
            stagger: tokens.hideStagger,
            ease: tokens.hideEase,
          },
          0,
        );
        tl.to(
          root,
          { height: collapsedHeight, scaleY: 0.98, duration: 0.42 },
          targets.length ? 0.08 : 0,
        );
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
        defaults: { ease: "power3.inOut" },
        onComplete: () => {
          timelineRef.current = null;
          // Re-measure once settled: the island's CSS width transition can finish
          // after this timeline started, changing how the panel content wraps.
          gsap.set(root, {
            height: measureIslandHeight({ open: true, aboutExpanded: false }),
          });
        },
      });

      tl.fromTo(
        root,
        { height: collapsedHeight, scaleY: 0.98, transformOrigin: "top center" },
        { height: menuHeight, scaleY: 1, duration: 0.5 },
        0,
      );
      tl.fromTo(
        targets,
        { y: 12, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: tokens.revealDuration * 0.45,
          stagger: tokens.revealStagger,
          ease: tokens.revealEase,
        },
        0.12,
      );

      timelineRef.current = tl;
    } else if (aboutJustToggled) {
      const tl = gsap.timeline({
        defaults: { ease: "power3.inOut" },
        onComplete: () => {
          timelineRef.current = null;
          gsap.set(root, {
            height: measureIslandHeight({ open: true, aboutExpanded: aboutOpen }),
          });
        },
      });

      if (aboutOpen && aboutDetail) {
        // About view: the whole link cluster (About included) slides out and
        // leaves the flow, the island resizes, then the about text reveals
        // line by line.
        tl.to(
          targets,
          { opacity: 0, y: -10, duration: 0.2, stagger: 0.04, ease: tokens.hideEase },
          0,
        );
        if (linksBlock) tl.set(linksBlock, { display: "none" });
        tl.add(() => {
          gsap.to(root, {
            height: measureIslandHeight({ open: true, aboutExpanded: true }),
            duration: 0.4,
            ease: "power3.inOut",
          });
        });
        // Split after the island's width transition has settled so the line
        // wrapping matches the final layout.
        tl.add(() => {
          const lines = buildAboutSplits();
          gsap.set(aboutDetail, { opacity: 1, y: 0 });
          if (lines.length) {
            gsap.set(lines, { y: "100%" });
            gsap.to(lines, {
              y: "0%",
              duration: tokens.revealDuration,
              stagger: tokens.revealStagger,
              ease: tokens.revealEase,
            });
          }
        }, "+=0.34");
      } else if (aboutDetail) {
        // Back to menu: lines drop away, the detail collapses, the page links
        // return and the island shrinks back.
        const lines = aboutLinesRef.current;
        if (lines.length) {
          tl.to(lines, { y: "100%", duration: 0.25, stagger: 0.012, ease: tokens.hideEase }, 0);
        } else {
          tl.to(aboutDetail, { opacity: 0, y: 8, duration: 0.2, ease: tokens.hideEase }, 0);
        }
        tl.add(() => {
          aboutDetail.classList.remove("island-nav__about-detail--open");
          gsap.set(aboutDetail, { opacity: 0, y: 8 });
          revertAboutSplits();
          if (linksBlock) gsap.set(linksBlock, { clearProps: "display" });
          gsap.to(root, {
            height: measureIslandHeight({ open: true, aboutExpanded: false }),
            duration: 0.36,
            ease: "power3.inOut",
          });
        });
        tl.fromTo(
          targets,
          { opacity: 0, y: 12 },
          {
            opacity: 1,
            y: 0,
            duration: tokens.revealDuration * 0.45,
            stagger: tokens.revealStagger,
            ease: tokens.revealEase,
          },
          "+=0.08",
        );
      }

      timelineRef.current = tl;
    } else if (isOpen) {
      gsap.set(root, { height: targetHeight, scaleY: 1 });
      if (linksBlock) {
        gsap.set(linksBlock, aboutOpen ? { display: "none" } : { clearProps: "display" });
      }
      gsap.set(targets, { y: 0, opacity: 1 });
      if (aboutDetail) {
        gsap.set(aboutDetail, { opacity: aboutOpen ? 1 : 0, y: aboutOpen ? 0 : 8 });
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
