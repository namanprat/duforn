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
import StaggerHoverChars from "../components/StaggerHoverChars";
import AboutPanel, { type AboutPanelHandle } from "../components/AboutPanel";
import { BUST_URL, shouldMountAboutBust } from "../components/aboutBust";
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

function NavBrand({ isHome, showName }: { isHome: boolean; showName?: boolean }) {
  const time = useISTTime();
  const brandText = isHome && !showName ? `${time} IST` : "Naman Pratulya";

  return (
    <span className="nav-brand__clip">
      <StaggerHoverChars>{brandText}</StaggerHoverChars>
    </span>
  );
}

interface NavLinkProps {
  to: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  label?: string;
}

function NavLink({ to, className, children, onClick, label }: NavLinkProps) {
  const location = useLocation();
  const isCurrent = location.pathname === to;
  const hoverLabel = label ?? (typeof children === "string" ? children : "");

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.();
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (!isCurrent) navigateTo(to);
  };

  return (
    <a
      href={to}
      className={className}
      onClick={handleClick}
      aria-current={isCurrent ? "page" : undefined}
      aria-disabled={isCurrent ? true : undefined}
    >
      {hoverLabel ? (
        <StaggerHoverChars disabled={isCurrent}>{hoverLabel}</StaggerHoverChars>
      ) : (
        children
      )}
    </a>
  );
}

export default function Nav() {
  const location = useLocation();
  const [phase, setPhase] = useState<MenuPhase>("closed");
  const [isMobileNav, setIsMobileNav] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches,
  );
  const isHome = location.pathname === "/";

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const onChange = () => setIsMobileNav(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const scopeRef = useRef<HTMLDivElement | null>(null);
  const menuNavRef = useRef<HTMLDivElement | null>(null);
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const aboutPanelRef = useRef<AboutPanelHandle | null>(null);

  const { isMorphing, shellOpen, shellAbout, bodyVisible, aboutVisible } =
    useMenuMorph({ phase, scopeRef, menuNavRef, surfaceRef, aboutPanelRef });

  const isOpen = phase !== "closed";
  const isAbout = phase === "about";
  const showBrandName = !isHome || (isMobileNav && isOpen);
  const toggleLabel = isAbout ? "Back" : isOpen ? "Close" : "Menu";

  const closeAll = useCallback(() => setPhase("closed"), []);
  const openMenu = () => setPhase("links");
  const openAbout = () => {
    if (isMorphing) return;
    setPhase("about");
  };

  const handleToggleClick = () => {
    if (isMorphing) return;
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

  // ponytail: warm bust GLB while the user browses menu links, before they tap About.
  useEffect(() => {
    if (phase !== "links" || !shouldMountAboutBust()) return;
    const warm = () => {
      void fetch(BUST_URL, { cache: "force-cache" });
    };
    if (typeof requestIdleCallback === "function") {
      const id = requestIdleCallback(warm, { timeout: 2500 });
      return () => cancelIdleCallback(id);
    }
    const id = window.setTimeout(warm, 400);
    return () => window.clearTimeout(id);
  }, [phase]);

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

  const handleToggleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (shellOpen || isMorphing) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openMenu();
  };

  const toggleAriaLabel =
    toggleLabel === "Menu" ? "Open menu" : toggleLabel === "Back" ? "Back to menu" : "Close menu";

  return (
    <header
      className={`site-header${isOpen ? " site-header--menu-open" : ""}${isAbout ? " site-header--menu-about" : ""}`}
      data-no-strip-drag
    >
      <button
        type="button"
        className="menu-nav-backdrop"
        aria-label="Close menu"
        aria-hidden={!isOpen}
        tabIndex={isOpen ? 0 : -1}
        onClick={() => {
          if (!isMorphing) closeAll();
        }}
      />

      <div className="site-header__inner">
        <NavLink className="link-main site-header__brand" to="/">
          <NavBrand isHome={isHome} showName={showBrandName} />
        </NavLink>
      </div>

      <div className="menu-nav-wrap" ref={scopeRef}>
        <div className="menu-nav-track">
          <div
            ref={menuNavRef}
            id="site-menu"
            className={`menu-nav${shellOpen ? " is-open" : ""}${shellAbout ? " is-about" : ""}${bodyVisible ? " is-body-visible" : ""}${aboutVisible ? " is-about-visible" : ""}${isMorphing ? " is-morphing" : ""}`}
            role={isOpen ? "dialog" : undefined}
            aria-modal={isOpen ? true : undefined}
            aria-label={isOpen ? "Site menu" : undefined}
          >
            <div ref={surfaceRef} className="menu-nav__surface">
              <div className="menu-nav__chrome">
                <button
                  type="button"
                  className="menu-nav__toggle link-main"
                  aria-label={shellOpen ? toggleAriaLabel : "Open menu"}
                  aria-expanded={isOpen}
                  aria-controls="site-menu-body"
                  tabIndex={0}
                  onClick={shellOpen ? handleToggleClick : openMenu}
                  onKeyDown={!shellOpen ? handleToggleKeyDown : undefined}
                >
                  <StaggerHoverChars>{toggleLabel}</StaggerHoverChars>
                </button>
              </div>

              <div id="site-menu-body" className="menu-nav__body" aria-hidden={!isOpen}>
                <ul className="menu-nav__links">
                  {MENU_LINKS.map(({ label, path }) => (
                    <li key={path} className="menu-nav__item">
                      <span className="menu-nav__line">
                        <NavLink
                          to={path}
                          className="menu-nav__link u-text-style-h4"
                          label={label}
                          onClick={closeAll}
                        />
                      </span>
                    </li>
                  ))}
                  <li className="menu-nav__item">
                    <span className="menu-nav__line">
                      {/* button, not <a href="#about">: no default hash navigation to fall
                          back to if the click handler ever doesn't run (iOS taps). */}
                      <button
                        type="button"
                        className="menu-nav__link menu-nav__about-toggle u-text-style-h4"
                        aria-expanded={isAbout}
                        aria-controls="site-about"
                        onClick={openAbout}
                      >
                        <StaggerHoverChars>About</StaggerHoverChars>
                      </button>
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
