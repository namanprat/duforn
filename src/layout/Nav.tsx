import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import { navigateTo } from "../lib/nav";
import RotateHoverLabel from "../components/RotateHoverLabel";
import AboutPanel, { type AboutPanelHandle } from "../components/AboutPanel";
import { shouldUseNavRotateHover } from "../lib/link-hover";
import { useMenuMorph, type MenuPhase } from "./useMenuMorph";

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

const formatISTTime = () => IST_TIME_FORMAT.format(new Date());

function useISTTime() {
  const [time, setTime] = useState(formatISTTime);
  useEffect(() => {
    const id = window.setInterval(() => setTime(formatISTTime()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return time;
}

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
  const [phase, setPhase] = useState<MenuPhase>("closed");
  const useRotateHover = shouldUseNavRotateHover();
  const isHome = location.pathname === "/";

  const scopeRef = useRef<HTMLDivElement | null>(null);
  const menuNavRef = useRef<HTMLDivElement | null>(null);
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const aboutPanelRef = useRef<AboutPanelHandle | null>(null);

  const { isMorphing, shellOpen, shellAbout, bodyVisible, aboutVisible } =
    useMenuMorph({ phase, scopeRef, menuNavRef, surfaceRef, aboutPanelRef });

  const isOpen = phase !== "closed";
  const isAbout = phase === "about";
  const toggleLabel = isAbout ? "Back" : isOpen ? "Close" : "Menu";

  const closeAll = useCallback(() => setPhase("closed"), []);
  const openMenu = () => setPhase("links");
  const openAbout = () => setPhase("about");

  const handleToggleClick = () => {
    if (isAbout) setPhase("links");
    else if (isOpen) setPhase("closed");
    else openMenu();
  };

  useEffect(() => {
    setPhase("closed");
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle("menu-open", isOpen);
    return () => document.body.classList.remove("menu-open");
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      if (isAbout) setPhase("links");
      else closeAll();
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [closeAll, isAbout, isOpen]);

  const handleSurfaceKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (shellOpen || isMorphing) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openMenu();
  };

  const handleAboutKeyDown = (event: KeyboardEvent<HTMLAnchorElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openAbout();
  };

  const toggleAriaLabel =
    toggleLabel === "Menu" ? "Open menu" : toggleLabel === "Back" ? "Back to menu" : "Close menu";

  return (
    <header className={`site-header${isOpen ? " site-header--menu-open" : ""}`}>
      <button
        type="button"
        className="menu-nav-backdrop"
        aria-label="Close menu"
        aria-hidden={!isOpen}
        tabIndex={isOpen ? 0 : -1}
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
            className={`menu-nav${shellOpen ? " is-open" : ""}${shellAbout ? " is-about" : ""}${bodyVisible || (isOpen && isAbout) ? " is-body-visible" : ""}${aboutVisible ? " is-about-visible" : ""}${isMorphing ? " is-morphing" : ""}`}
            role={isOpen ? "dialog" : undefined}
            aria-modal={isOpen ? true : undefined}
            aria-label={isOpen ? "Site menu" : undefined}
          >
            <div
              ref={surfaceRef}
              className="menu-nav__surface"
              {...(!shellOpen && !isMorphing
                ? {
                    role: "button",
                    tabIndex: 0,
                    "aria-label": "Open menu",
                    "data-rotate-hover": useRotateHover ? "" : undefined,
                    onClick: openMenu,
                    onKeyDown: handleSurfaceKeyDown,
                  }
                : {})}
            >
              <div className="menu-nav__chrome">
                {shellOpen ? (
                  <button
                    type="button"
                    className="menu-nav__toggle link-main"
                    aria-label={toggleAriaLabel}
                    aria-expanded={isOpen}
                    aria-controls="site-menu-body"
                    data-rotate-hover={useRotateHover ? "" : undefined}
                    onClick={handleToggleClick}
                  >
                    {useRotateHover ? <RotateHoverLabel text={toggleLabel} /> : toggleLabel}
                  </button>
                ) : (
                  <span className="menu-nav__toggle link-main" aria-hidden="true">
                    {useRotateHover ? <RotateHoverLabel text={toggleLabel} /> : toggleLabel}
                  </span>
                )}
              </div>

              <div id="site-menu-body" className="menu-nav__body" aria-hidden={!isOpen}>
                <ul className="menu-nav__links">
                  {MENU_LINKS.map(({ label, path }) => (
                    <li key={path} className="menu-nav__item">
                      <span className="menu-nav__line">
                        <NavLink
                          to={path}
                          className="menu-nav__link u-text-style-h4"
                          onClick={closeAll}
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
                        aria-expanded={isAbout}
                        aria-controls="site-about"
                        data-rotate-hover={useRotateHover ? "" : undefined}
                        onClick={(event) => {
                          event.preventDefault();
                          openAbout();
                        }}
                        onKeyDown={handleAboutKeyDown}
                      >
                        {useRotateHover ? <RotateHoverLabel text="About" /> : "About"}
                      </a>
                    </span>
                  </li>
                </ul>

                <div id="site-about" className="menu-nav__about">
                  <AboutPanel ref={aboutPanelRef} active={aboutVisible} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
