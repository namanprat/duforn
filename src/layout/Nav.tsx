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
import AboutPanel from "../components/AboutPanel";
import { initLinkHover, shouldUseNavRotateHover } from "../lib/link-hover";
import { MOTION_TOKENS } from "../lib/animation/motionTokens";

const MENU_LINKS = [
  { label: "Work", path: "/work" },
  { label: "Contact", path: "/contact" },
  { label: "Archive", path: "/archive" },
] as const;

const PANEL_CLIP_CLOSED = "inset(0% 0% 100% 100% round 16px)";
const PANEL_CLIP_OPEN = "inset(0% 0% 0% 0% round 16px)";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function resolveMenuWidthPx(aboutOpen: boolean, trackWidth: number): number {
  const rootFont = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const rem = aboutOpen ? 46 : 15;
  const cap = aboutOpen ? trackWidth * 0.92 : trackWidth;
  return Math.min(rem * rootFont, cap);
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
    initLinkHover();
  }, [isMenuOpen, isAboutOpen, toggleLabel]);

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

  const measurePanelHeight = useCallback(
    (aboutOpen: boolean, widthPx: number) => {
      const panel = panelRef.current;
      const menuNav = menuNavRef.current;
      const scope = scopeRef.current;
      if (!panel || !menuNav || !scope) return 0;

      const about = scope.querySelector<HTMLElement>(".menu-nav__about");
      const linksBlock = scope.querySelector<HTMLElement>(".menu-nav__links");

      const prev = {
        width: menuNav.style.width,
        height: panel.style.height,
        visibility: panel.style.visibility,
        aboutDisplay: about?.style.display ?? "",
        aboutHeight: about?.style.height ?? "",
        aboutVisibility: about?.style.visibility ?? "",
        linksDisplay: linksBlock?.style.display ?? "",
      };

      menuNav.style.width = `${widthPx}px`;
      panel.style.visibility = "visible";
      panel.style.height = "auto";

      if (aboutOpen && about) {
        about.style.display = "block";
        about.style.height = "auto";
        about.style.visibility = "visible";
        if (linksBlock) linksBlock.style.display = "none";
      } else {
        if (about) about.style.display = "none";
        if (linksBlock) linksBlock.style.display = "";
      }

      const height = panel.scrollHeight;

      menuNav.style.width = prev.width;
      panel.style.height = prev.height;
      panel.style.visibility = prev.visibility;
      if (about) {
        about.style.display = prev.aboutDisplay;
        about.style.height = prev.aboutHeight;
        about.style.visibility = prev.aboutVisibility;
      }
      if (linksBlock) linksBlock.style.display = prev.linksDisplay;

      return height;
    },
    [],
  );

  useLayoutEffect(() => {
    const scope = scopeRef.current;
    const menuNav = menuNavRef.current;
    const panel = panelRef.current;
    if (!scope || !menuNav || !panel) return;

    timelineRef.current?.kill();

    const lines = scope.querySelectorAll<HTMLElement>(".menu-nav__line");
    const about = scope.querySelector<HTMLElement>(".menu-nav__about");
    const linksBlock = scope.querySelector<HTMLElement>(".menu-nav__links");
    const aboutContent = about?.querySelector<HTMLElement>(".about-panel__content") ?? null;

    const { menu } = MOTION_TOKENS;
    const reduced = prefersReducedMotion();
    const prev = prevStateRef.current;
    const track = scope.querySelector<HTMLElement>(".menu-nav-track");
    const trackWidth = track?.clientWidth ?? menuNav.clientWidth;
    const linksWidth = resolveMenuWidthPx(false, trackWidth);
    const aboutWidth = resolveMenuWidthPx(true, trackWidth);

    menuNav.classList.toggle("is-open", isMenuOpen);
    menuNav.classList.toggle("is-about", isAboutOpen);

    const menuJustOpened = isMenuOpen && !prev.isMenuOpen;
    const menuJustClosed = !isMenuOpen && prev.isMenuOpen;
    const aboutJustOpened = isAboutOpen && !prev.isAboutOpen && isMenuOpen;
    const aboutJustClosed = !isAboutOpen && prev.isAboutOpen && isMenuOpen;

    const setPanelHeightAuto = () => {
      gsap.set(panel, { height: "auto", clearProps: "height" });
    };

    const syncReduced = () => {
      if (!isMenuOpen) {
        gsap.set(panel, {
          clipPath: PANEL_CLIP_CLOSED,
          autoAlpha: 0,
          visibility: "hidden",
          height: 0,
        });
        gsap.set(menuNav, { width: linksWidth });
        gsap.set(lines, { yPercent: 120, autoAlpha: 0 });
        if (about) gsap.set(about, { display: "none", height: 0, autoAlpha: 0 });
        if (linksBlock) gsap.set(linksBlock, { clearProps: "display" });
        return;
      }

      const width = isAboutOpen ? aboutWidth : linksWidth;
      const height = measurePanelHeight(isAboutOpen, width);
      gsap.set(menuNav, { width });
      gsap.set(panel, {
        clipPath: PANEL_CLIP_OPEN,
        autoAlpha: 1,
        visibility: "visible",
        height: isAboutOpen ? "auto" : height,
      });
      gsap.set(lines, { yPercent: isAboutOpen ? -120 : 0, autoAlpha: isAboutOpen ? 0 : 1 });
      if (linksBlock) gsap.set(linksBlock, { display: isAboutOpen ? "none" : "block" });
      if (about) {
        gsap.set(about, {
          display: isAboutOpen ? "block" : "none",
          height: isAboutOpen ? "auto" : 0,
          autoAlpha: isAboutOpen ? 1 : 0,
        });
      }
      if (isAboutOpen) setAboutLenisActive(true);
    };

    if (reduced) {
      syncReduced();
      prevStateRef.current = { isMenuOpen, isAboutOpen };
      return () => timelineRef.current?.kill();
    }

    if (menuJustClosed) {
      const tl = gsap.timeline({
        defaults: { ease: menu.closeEase },
        onComplete: () => {
          gsap.set(panel, { visibility: "hidden", height: 0 });
          gsap.set(menuNav, { width: linksWidth });
          if (about) gsap.set(about, { display: "none", height: 0, autoAlpha: 0 });
          if (linksBlock) gsap.set(linksBlock, { clearProps: "display" });
          setAboutLenisActive(false);
          timelineRef.current = null;
        },
      });
      tl.to(lines, {
        yPercent: 120,
        autoAlpha: 0,
        duration: menu.closeDuration * 0.6,
        stagger: { each: menu.lineStagger, from: "end" },
      }      ).to(
        panel,
        {
          height: 0,
          clipPath: PANEL_CLIP_CLOSED,
          autoAlpha: 0,
          duration: menu.closeDuration,
        },
        "<0.05",
      );
      timelineRef.current = tl;
    } else if (menuJustOpened) {
      const targetHeight = measurePanelHeight(false, linksWidth);
      gsap.set(panel, { visibility: "visible", height: 0 });
      gsap.set(menuNav, { width: linksWidth });
      if (about) gsap.set(about, { display: "none", height: 0, autoAlpha: 0 });
      if (linksBlock) gsap.set(linksBlock, { clearProps: "display" });

      const tl = gsap.timeline({
        defaults: { ease: menu.ease },
        onComplete: () => (timelineRef.current = null),
      });
      tl.fromTo(
        panel,
        { clipPath: PANEL_CLIP_CLOSED, autoAlpha: 0, height: 0 },
        {
          clipPath: PANEL_CLIP_OPEN,
          autoAlpha: 1,
          height: targetHeight,
          duration: menu.openDuration,
        },
      ).fromTo(
        lines,
        { yPercent: 120, autoAlpha: 0 },
        {
          yPercent: 0,
          autoAlpha: 1,
          duration: menu.lineDuration,
          stagger: menu.lineStagger,
        },
        "<0.12",
      );
      timelineRef.current = tl;
    } else if (aboutJustOpened && about) {
      const targetHeight = measurePanelHeight(true, aboutWidth);
      const tl = gsap.timeline({
        defaults: { ease: menu.ease },
        onComplete: () => {
          setPanelHeightAuto();
          // Box has finished expanding — let AboutPanel reveal its copy line-by-line.
          setAboutLenisActive(true);
          timelineRef.current = null;
        },
      });

      tl.to(lines, {
        yPercent: -120,
        autoAlpha: 0,
        duration: menu.lineDuration * 0.7,
        ease: menu.closeEase,
        stagger: { each: menu.lineStagger, from: "end" },
      })
        .add(() => {
          if (linksBlock) linksBlock.style.display = "none";
          gsap.set(about, { display: "block", height: "auto", autoAlpha: 1 });
          // Keep copy hidden during the expand; AboutPanel fades + splits it in afterwards.
          if (aboutContent) gsap.set(aboutContent, { autoAlpha: 0 });
        })
        .to(menuNav, { width: aboutWidth, duration: menu.widthDuration }, "<0.05")
        .to(panel, { height: targetHeight, duration: menu.heightDuration }, "<");
      timelineRef.current = tl;
    } else if (aboutJustClosed && about) {
      const targetHeight = measurePanelHeight(false, linksWidth);
      const tl = gsap.timeline({
        defaults: { ease: menu.closeEase },
        onComplete: () => {
          setAboutLenisActive(false);
          timelineRef.current = null;
        },
      });

      tl.to(aboutContent, { autoAlpha: 0, duration: menu.lineDuration * 0.5 })
        .to(panel, { height: targetHeight, duration: menu.heightDuration * 0.85 }, "<0.05")
        .to(menuNav, { width: linksWidth, duration: menu.widthDuration * 0.85 }, "<")
        .add(() => {
          about.style.display = "none";
          if (linksBlock) linksBlock.style.display = "";
        })
        .fromTo(
          lines,
          { yPercent: -120, autoAlpha: 0 },
          {
            yPercent: 0,
            autoAlpha: 1,
            duration: menu.lineDuration,
            ease: menu.ease,
            stagger: menu.lineStagger,
          },
          "<0.08",
        );
      timelineRef.current = tl;
    } else if (isMenuOpen) {
      const width = isAboutOpen ? aboutWidth : linksWidth;
      gsap.set(menuNav, { width });
      if (isAboutOpen) {
        setPanelHeightAuto();
        if (linksBlock) gsap.set(linksBlock, { display: "none" });
        if (about) gsap.set(about, { display: "block", height: "auto", autoAlpha: 1 });
      }
    }

    prevStateRef.current = { isMenuOpen, isAboutOpen };

    return () => {
      timelineRef.current?.kill();
    };
  }, [isAboutOpen, isMenuOpen, measurePanelHeight]);

  const toggleAriaLabel =
    toggleLabel === "Menu"
      ? "Open menu"
      : toggleLabel === "Back"
        ? "Back to menu"
        : "Close menu";

  return (
    <header className="site-header">
      <button
        type="button"
        className="menu-nav-backdrop"
        aria-hidden={!isMenuOpen}
        tabIndex={isMenuOpen ? 0 : -1}
        onClick={closeAll}
      />

      <div className="site-header__inner u-container-main">
        <NavLink className="link-main site-header__brand" to="/" rotateHover={useRotateHover}>
          {useRotateHover ? <RotateHoverLabel text="Duforn" /> : "Duforn"}
        </NavLink>

        <button
          type="button"
          className="site-header__toggle"
          aria-label={toggleAriaLabel}
          aria-expanded={isMenuOpen}
          aria-controls="site-menu"
          data-rotate-hover={useRotateHover ? "" : undefined}
          onClick={handleToggleClick}
        >
          {useRotateHover ? (
            <RotateHoverLabel text={toggleLabel} />
          ) : (
            toggleLabel
          )}
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
              <ul className="menu-nav__links">
                {MENU_LINKS.map(({ label, path }) => (
                  <li key={path} className="menu-nav__item">
                    <span className="menu-nav__line">
                      <NavLink
                        to={path}
                        className="menu-nav__link u-text-style-menu"
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
                      className="menu-nav__link menu-nav__about-toggle u-text-style-menu"
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
