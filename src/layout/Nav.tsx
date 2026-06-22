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
import { Flip } from "gsap/Flip";
import { navigateTo } from "../lib/nav";
import RotateHoverLabel from "../components/RotateHoverLabel";
import AboutPanel from "../components/AboutPanel";
import { shouldUseNavRotateHover } from "../lib/link-hover";
import { MOTION_TOKENS } from "../lib/animation/motionTokens";
import { prefersReducedMotion } from "../lib/prefersReducedMotion";

gsap.registerPlugin(Flip);

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

/** Indian Standard Time as a `HH:MM:SS` string. */
const formatISTTime = () => IST_TIME_FORMAT.format(new Date());

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
  const [aboutLenisActive, setAboutLenisActive] = useState(false);
  const useRotateHover = shouldUseNavRotateHover();
  const toggleLabel = isAboutOpen ? "Back" : isMenuOpen ? "Close" : "Menu";
  const isHome = location.pathname === "/";

  const scopeRef = useRef<HTMLDivElement | null>(null);
  const menuNavRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
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
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle("menu-open", isMenuOpen);
    return () => document.body.classList.remove("menu-open");
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isAboutOpen) setAboutLenisActive(false);
  }, [isAboutOpen]);

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
    const panel = panelRef.current;
    if (!scope || !menuNav || !panel) return;

    timelineRef.current?.kill();

    const lines = scope.querySelectorAll<HTMLElement>(".menu-nav__line");
    const about = scope.querySelector<HTMLElement>(".menu-nav__about");
    const aboutContent = about?.querySelector<HTMLElement>(".about-panel__content") ?? null;

    const { menu } = MOTION_TOKENS;
    const reduced = prefersReducedMotion();
    const prev = prevStateRef.current;

    const menuJustClosed = !isMenuOpen && prev.isMenuOpen;
    const aboutJustOpened = isAboutOpen && !prev.isAboutOpen && isMenuOpen;
    const aboutJustClosed = !isAboutOpen && prev.isAboutOpen && isMenuOpen;

    const flipCleanup = "height,width,transform,top,left,right,bottom,position,opacity,visibility";

    // The is-open / is-about classes are state-driven in JSX, so React owns the
    // resting state and can never wrongly hide the box. To let Flip tween from the
    // OLD layout, briefly revert to the previous classes, snapshot, then restore the
    // live ones (synchronous — no paint happens in between).
    menuNav.classList.toggle("is-open", prev.isMenuOpen);
    menuNav.classList.toggle("is-about", prev.isAboutOpen);
    const flipState = Flip.getState([menuNav, panel], { props: "borderRadius" });
    menuNav.classList.toggle("is-open", isMenuOpen);
    menuNav.classList.toggle("is-about", isAboutOpen);

    prevStateRef.current = { isMenuOpen, isAboutOpen };

    // Stayed closed (e.g. initial mount, route change while closed): nothing to play.
    if (!isMenuOpen && !prev.isMenuOpen) {
      gsap.set(panel, { autoAlpha: 0, clearProps: flipCleanup });
      gsap.set(lines, { yPercent: 120, autoAlpha: 0 });
      setAboutLenisActive(false);
      return () => timelineRef.current?.kill();
    }

    if (reduced) {
      // Snap to the resting state with no tween.
      gsap.set(panel, { autoAlpha: isMenuOpen ? 1 : 0, clearProps: flipCleanup });
      gsap.set(menuNav, { clearProps: flipCleanup });
      gsap.set(lines, { yPercent: isAboutOpen ? -120 : 0, autoAlpha: isAboutOpen ? 0 : 1 });
      if (aboutContent) gsap.set(aboutContent, { clearProps: "opacity,visibility" });
      setAboutLenisActive(isAboutOpen);
      return () => timelineRef.current?.kill();
    }

    // Keep the panel rendered for the whole transition (including the close).
    gsap.set(panel, { visibility: "visible" });
    // Hide the About copy while the box expands; AboutPanel fades it in once active.
    if (aboutJustOpened && aboutContent) gsap.set(aboutContent, { autoAlpha: 0 });

    const boxDuration = aboutJustOpened
      ? menu.aboutDuration
      : aboutJustClosed
        ? menu.aboutDuration * 0.85
        : isMenuOpen
          ? menu.openDuration
          : menu.closeDuration;

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(menuNav, { clearProps: flipCleanup });
        if (isMenuOpen) {
          gsap.set(panel, { clearProps: flipCleanup });
        } else {
          gsap.set(panel, { clearProps: flipCleanup, autoAlpha: 0 });
        }
        setAboutLenisActive(isAboutOpen);
        timelineRef.current = null;
      },
    });

    tl.add(
      Flip.from(flipState, {
        duration: boxDuration,
        // One smooth in/out ease for every transition so the box reads as a single
        // fluid surface (Dynamic-Island style).
        ease: menu.boxEase,
        absolute: true,
        // Animate real width/height (not scaleX/Y) so corners/blur stay crisp and
        // the box grows from its pinned top-right corner instead of stretching.
        scale: false,
      }),
      0,
    );

    // Panel fade tracks the box growing in / collapsing out.
    tl.fromTo(
      panel,
      { autoAlpha: prev.isMenuOpen ? 1 : 0 },
      { autoAlpha: isMenuOpen ? 1 : 0, duration: boxDuration * 0.6, ease: "none" },
      0,
    );

    // Link line choreography.
    if (menuJustClosed) {
      tl.to(
        lines,
        {
          yPercent: 120,
          autoAlpha: 0,
          duration: menu.closeDuration * 0.6,
          ease: menu.closeEase,
          stagger: { each: menu.lineStagger, from: "end" },
        },
        0,
      );
    } else if (aboutJustOpened) {
      tl.to(
        lines,
        {
          yPercent: -120,
          autoAlpha: 0,
          duration: menu.lineDuration * 0.7,
          ease: menu.closeEase,
          stagger: { each: menu.lineStagger, from: "end" },
        },
        0,
      );
    } else if (aboutJustClosed) {
      if (aboutContent) {
        tl.to(
          aboutContent,
          { autoAlpha: 0, duration: menu.lineDuration * 0.5, ease: menu.closeEase },
          0,
        );
      }
      tl.fromTo(
        lines,
        { yPercent: -120, autoAlpha: 0 },
        {
          yPercent: 0,
          autoAlpha: 1,
          duration: menu.lineDuration,
          ease: menu.ease,
          stagger: menu.lineStagger,
        },
        boxDuration * 0.2,
      );
    } else if (isMenuOpen && !isAboutOpen) {
      // Opening the links view, or returning to it from About.
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
        prev.isMenuOpen ? boxDuration * 0.2 : boxDuration * 0.3,
      );
    }

    timelineRef.current = tl;

    return () => {
      timelineRef.current?.kill();
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

        <button
          type="button"
          className="link-main site-header__toggle"
          aria-label={toggleAriaLabel}
          aria-expanded={isMenuOpen}
          aria-controls="site-menu"
          data-rotate-hover={useRotateHover ? "" : undefined}
          onClick={handleToggleClick}
        >
          {useRotateHover ? <RotateHoverLabel text={toggleLabel} /> : toggleLabel}
        </button>
      </div>

      <div className="menu-nav-wrap" ref={scopeRef}>
        <div className="menu-nav-track">
          <div
            ref={menuNavRef}
            id="site-menu"
            className={`menu-nav${isMenuOpen ? " is-open" : ""}${isAboutOpen ? " is-about" : ""}`}
            role="dialog"
            aria-modal={isMenuOpen}
            aria-label="Site menu"
            aria-hidden={!isMenuOpen}
          >
            <div ref={panelRef} className="menu-nav__panel">
              <div className="menu-nav__lead" aria-hidden="true" />
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
                        setIsAboutOpen(true);
                      }}
                    >
                      {useRotateHover ? <RotateHoverLabel text="About" /> : "About"}
                    </a>
                  </span>
                </li>
              </ul>

              <div id="site-about" className="menu-nav__about">
                <AboutPanel active={aboutLenisActive} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
