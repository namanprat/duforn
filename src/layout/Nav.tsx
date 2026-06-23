import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import { navigateTo } from "../lib/nav";
import RotateHoverLabel from "../components/RotateHoverLabel";
import AboutPanel, { type AboutPanelHandle } from "../components/AboutPanel";
import { shouldUseNavRotateHover } from "../lib/link-hover";
import { MOTION_TOKENS } from "../lib/animation/motionTokens";
import { prefersReducedMotion } from "../lib/prefersReducedMotion";

const MENU_LINKS = [
  { label: "Work", path: "/work" },
  { label: "Contact", path: "/contact" },
  { label: "Archive", path: "/archive" },
] as const;

const IST_TIME_FORMAT = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

type MenuFlags = {
  open: boolean;
  about: boolean;
  bodyVisible: boolean;
  aboutVisible: boolean;
};

const SURFACE_DIM_PROPS = "width,height";

/** Indian Standard Time as a `HH:MM:SS` string. */
const formatISTTime = () => IST_TIME_FORMAT.format(new Date());

function menuFlags(open: boolean, about: boolean, expanded = false): MenuFlags {
  if (!open) {
    return { open: false, about: false, bodyVisible: false, aboutVisible: false };
  }
  if (about) {
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

/** Live IST clock, ticking every second. */
function useISTTime() {
  const [time, setTime] = useState(formatISTTime);
  useEffect(() => {
    const id = window.setInterval(() => setTime(formatISTTime()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return time;
}

/**
 * Nav brand: live IST clock on home, "Naman Pratulya" elsewhere.
 * One hover surface for both; clock ticks repaint silently via `live`.
 */
function NavBrand({ isHome, useRotateHover }: { isHome: boolean; useRotateHover: boolean }) {
  const time = useISTTime();
  const brandText = isHome ? `${time} IST` : "Naman Pratulya";

  return (
    <span className="nav-brand__clip">
      {useRotateHover ? <RotateHoverLabel text={brandText} /> : brandText}
    </span>
  );
}

interface NavLinkProps {
  to: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  rotateHover?: boolean;
}

function NavLink({ to, className, children, onClick, rotateHover = false }: NavLinkProps) {
  const location = useLocation();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.();
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (location.pathname !== to) navigateTo(to);
  };

  return (
    <a
      href={to}
      className={className}
      onClick={handleClick}
      aria-current={location.pathname === to ? "page" : undefined}
      data-rotate-hover={rotateHover ? "" : undefined}
    >
      {children}
    </a>
  );
}

export default function Nav() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isBodyVisible, setIsBodyVisible] = useState(false);
  const [isAboutVisible, setIsAboutVisible] = useState(false);
  const useRotateHover = shouldUseNavRotateHover();
  const toggleLabel = isAboutOpen ? "Back" : isMenuOpen ? "Close" : "Menu";
  const isHome = location.pathname === "/";

  const scopeRef = useRef<HTMLDivElement | null>(null);
  const menuNavRef = useRef<HTMLDivElement | null>(null);
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const aboutPanelRef = useRef<AboutPanelHandle | null>(null);
  const prevStateRef = useRef({ isMenuOpen: false, isAboutOpen: false });

  const closeAll = useCallback(() => {
    setIsAboutOpen(false);
    setIsMenuOpen(false);
  }, []);

  const closeMenu = () => {
    setIsAboutOpen(false);
    setIsMenuOpen(false);
  };

  const handleToggleClick = () => {
    if (isAboutOpen) {
      setIsAboutOpen(false);
      return;
    }
    setIsMenuOpen((open) => !open);
  };

  useEffect(() => {
    setIsMenuOpen(false);
    setIsAboutOpen(false);
    setIsBodyVisible(false);
    setIsAboutVisible(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle("menu-open", isMenuOpen);
    return () => document.body.classList.remove("menu-open");
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      if (isAboutOpen) setIsAboutOpen(false);
      else closeAll();
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [closeAll, isAboutOpen, isMenuOpen]);

  useLayoutEffect(() => {
    const scope = scopeRef.current;
    const menuNav = menuNavRef.current;
    const surface = surfaceRef.current;
    if (!scope || !menuNav || !surface) return;

    const lines = scope.querySelectorAll<HTMLElement>(".menu-nav__line");
    const about = scope.querySelector<HTMLElement>(".menu-nav__about");

    const { menu } = MOTION_TOKENS;
    const reduced = prefersReducedMotion();
    const prev = prevStateRef.current;

    const menuJustClosed = !isMenuOpen && prev.isMenuOpen;
    const menuJustOpened = isMenuOpen && !prev.isMenuOpen;
    const aboutJustOpened = isAboutOpen && !prev.isAboutOpen && isMenuOpen;
    const aboutJustClosed = !isAboutOpen && prev.isAboutOpen && isMenuOpen;
    const isMidTransition =
      menuJustOpened || menuJustClosed || aboutJustOpened || aboutJustClosed;

    const commitPrevState = () => {
      prevStateRef.current = { isMenuOpen, isAboutOpen };
    };

    const finishMorph = () => {
      menuNav.classList.remove("is-morphing");
      gsap.set(surface, { clearProps: SURFACE_DIM_PROPS });
      if (about && isAboutOpen) {
        gsap.set(about, { clearProps: "opacity,visibility" });
      }
      setIsBodyVisible(isMenuOpen);
      setIsAboutVisible(isAboutOpen);
      commitPrevState();
      timelineRef.current = null;
    };

    const syncLiveFlags = (bodyVisible: boolean, aboutVisible: boolean) => {
      applyMenuFlags(menuNav, menuFlags(isMenuOpen, isAboutOpen, bodyVisible || aboutVisible));
      if (aboutVisible) {
        menuNav.classList.add("is-about-visible");
      } else {
        menuNav.classList.remove("is-about-visible");
      }
      if (bodyVisible || aboutVisible) {
        menuNav.classList.add("is-body-visible");
      } else {
        menuNav.classList.remove("is-body-visible");
      }
    };

    if (!isMenuOpen && !prev.isMenuOpen) {
      menuNav.classList.remove("is-morphing");
      gsap.set(surface, { clearProps: SURFACE_DIM_PROPS });
      applyMenuFlags(menuNav, menuFlags(false, false));
      gsap.set(lines, { yPercent: 120, autoAlpha: 0 });
      commitPrevState();
      return () => timelineRef.current?.kill();
    }

    if (!isMidTransition && isMenuOpen) {
      return () => {};
    }

    timelineRef.current?.kill();

    const fromDims = readSurfaceDims(
      menuNav,
      surface,
      menuFlags(prev.isMenuOpen, prev.isAboutOpen, prev.isMenuOpen),
    );

    let toDims: { width: number; height: number };
    if (aboutJustOpened) {
      gsap.set(surface, { clearProps: SURFACE_DIM_PROPS });
      syncLiveFlags(true, true);
      toDims = readSurfaceDims(
        menuNav,
        surface,
        menuFlags(isMenuOpen, isAboutOpen, isMenuOpen),
      );
    } else {
      toDims = readSurfaceDims(
        menuNav,
        surface,
        menuFlags(isMenuOpen, isAboutOpen, isMenuOpen),
      );
    }

    const toExpanded = isMenuOpen && !isAboutOpen;
    const toAboutExpanded = isAboutOpen;

    if (reduced) {
      menuNav.classList.remove("is-morphing");
      gsap.set(surface, { clearProps: SURFACE_DIM_PROPS });
      syncLiveFlags(toExpanded, toAboutExpanded);
      gsap.set(lines, {
        yPercent: isMenuOpen && !isAboutOpen ? 0 : isAboutOpen ? -120 : 120,
        autoAlpha: isMenuOpen && !isAboutOpen ? 1 : 0,
      });
      setIsBodyVisible(isMenuOpen);
      setIsAboutVisible(toAboutExpanded);
      if (about && isAboutOpen) {
        gsap.set(about, { clearProps: "opacity,visibility" });
      }
      commitPrevState();
      return () => timelineRef.current?.kill();
    }

    menuNav.classList.add("is-morphing");
    gsap.set(surface, { width: fromDims.width, height: fromDims.height });

    const closingAbout = aboutJustClosed || (menuJustClosed && prev.isAboutOpen);
    const aboutHideDuration = closingAbout ? (aboutPanelRef.current?.hide() ?? 0) : 0;

    if (menuJustClosed) {
      if (prev.isAboutOpen) {
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
      syncLiveFlags(true, true);
      if (about) gsap.set(about, { clearProps: "opacity,visibility" });
      gsap.set(lines, { yPercent: 0, autoAlpha: 1 });
    } else if (!isMenuOpen) {
      syncLiveFlags(false, false);
      gsap.set(lines, { yPercent: 120, autoAlpha: 0 });
    }

    const isShrinking =
      toDims.width < fromDims.width - 1 || toDims.height < fromDims.height - 1;
    const boxDuration =
      aboutJustOpened || aboutJustClosed || (menuJustClosed && prev.isAboutOpen)
        ? menu.aboutDuration * menu.expandScale
        : menu.openDuration;
    const boxEase = isShrinking ? menu.boxShrinkEase : menu.boxOpenEase;
    const contentAt = boxDuration * 0.35;
    const lineFlipDuration = menu.lineDuration * 0.75;

    const tl = gsap.timeline({ onComplete: finishMorph });

    tl.to(
      surface,
      {
        width: toDims.width,
        height: toDims.height,
        duration: boxDuration,
        ease: boxEase,
      },
      0,
    );

    if (menuJustClosed) {
      if (prev.isAboutOpen) {
        tl.call(() => {
          syncLiveFlags(false, false);
          setIsBodyVisible(false);
          setIsAboutVisible(false);
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
          setIsBodyVisible(false);
          setIsAboutVisible(false);
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
        syncLiveFlags(true, false);
        setIsAboutVisible(false);
        setIsBodyVisible(true);
      }, [], aboutHideDuration);
    } else if (isMenuOpen && !isAboutOpen) {
      tl.call(() => {
        syncLiveFlags(true, false);
        setIsBodyVisible(true);
      }, [], contentAt);
      tl.fromTo(
        lines,
        { yPercent: prev.isAboutOpen ? -120 : 120, autoAlpha: 0 },
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
    };
  }, [isAboutOpen, isMenuOpen]);

  const toggleAriaLabel =
    toggleLabel === "Menu" ? "Open menu" : toggleLabel === "Back" ? "Back to menu" : "Close menu";

  return (
    <header className={`site-header${isMenuOpen ? " site-header--menu-open" : ""}`}>
      <button
        type="button"
        className="menu-nav-backdrop"
        aria-hidden={!isMenuOpen}
        tabIndex={isMenuOpen ? 0 : -1}
        onClick={closeAll}
      />

      <div className="site-header__inner u-container-main">
        <NavLink className="link-main site-header__brand" to="/" rotateHover={useRotateHover}>
          <NavBrand isHome={isHome} useRotateHover={useRotateHover} />
        </NavLink>
      </div>

      <div className="menu-nav-wrap" ref={scopeRef}>
        <div className="menu-nav-track">
          <div
            ref={menuNavRef}
            id="site-menu"
            className={`menu-nav${isMenuOpen ? " is-open" : ""}${isAboutOpen || isAboutVisible ? " is-about" : ""}${isBodyVisible || (isMenuOpen && isAboutOpen) ? " is-body-visible" : ""}${isAboutVisible ? " is-about-visible" : ""}`}
            role={isMenuOpen ? "dialog" : undefined}
            aria-modal={isMenuOpen ? true : undefined}
            aria-label={isMenuOpen ? "Site menu" : undefined}
          >
            <div ref={surfaceRef} className="menu-nav__surface">
              <div className="menu-nav__chrome">
                <button
                  type="button"
                  className="menu-nav__toggle link-main"
                  aria-label={toggleAriaLabel}
                  aria-expanded={isMenuOpen}
                  aria-controls="site-menu-body"
                  data-rotate-hover={useRotateHover ? "" : undefined}
                  onClick={handleToggleClick}
                >
                  {useRotateHover ? <RotateHoverLabel text={toggleLabel} /> : toggleLabel}
                </button>
              </div>

              <div id="site-menu-body" className="menu-nav__body" aria-hidden={!isMenuOpen}>
                <ul className="menu-nav__links">
                  {MENU_LINKS.map(({ label, path }) => (
                    <li key={path} className="menu-nav__item">
                      <span className="menu-nav__line">
                        <NavLink
                          to={path}
                          className="menu-nav__link u-text-style-h4"
                          onClick={closeMenu}
                          rotateHover={useRotateHover}
                        >
                          {useRotateHover ? <RotateHoverLabel text={label} /> : label}
                        </NavLink>
                      </span>
                    </li>
                  ))}
                  <li className="menu-nav__item">
                    <span className="menu-nav__line">
                      <a
                        href="#about"
                        className="menu-nav__link menu-nav__about-toggle u-text-style-h4"
                        role="button"
                        aria-expanded={isAboutOpen}
                        aria-controls="site-about"
                        data-rotate-hover={useRotateHover ? "" : undefined}
                        onClick={(event) => {
                          event.preventDefault();
                          const aboutEl = scopeRef.current?.querySelector<HTMLElement>(".menu-nav__about");
                          if (aboutEl) gsap.set(aboutEl, { clearProps: "opacity,visibility" });
                          setIsAboutOpen(true);
                          setIsBodyVisible(true);
                          setIsAboutVisible(true);
                        }}
                      >
                        {useRotateHover ? <RotateHoverLabel text="About" /> : "About"}
                      </a>
                    </span>
                  </li>
                </ul>

                <div id="site-about" className="menu-nav__about">
                  <AboutPanel ref={aboutPanelRef} active={isAboutVisible} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
