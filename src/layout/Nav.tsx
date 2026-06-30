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

function NavBrand({
  isHome,
  useRotateHover,
  paused = false,
  showName,
}: {
  isHome: boolean;
  useRotateHover: boolean;
  paused?: boolean;
  showName?: boolean;
}) {
  const time = useISTTime();
  const brandText = isHome && !showName ? `${time} IST` : "Naman Pratulya";

  return (
    <span className="nav-brand__clip">
      {useRotateHover ? (
        <RotateHoverLabel
          text={brandText}
          changeKey={showName ? "brand" : "home"}
          paused={paused}
        />
      ) : (
        brandText
      )}
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
  const isCurrent = location.pathname === to;
  const enableRotateHover = rotateHover && !isCurrent;

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
      data-rotate-hover={enableRotateHover ? "" : undefined}
      aria-disabled={isCurrent ? true : undefined}
    >
      {children}
    </a>
  );
}

export default function Nav() {
  const location = useLocation();
  const [phase, setPhase] = useState<MenuPhase>("closed");
  const [isMobileNav, setIsMobileNav] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches,
  );
  const useRotateHover = shouldUseNavRotateHover();
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

  const handleAboutKeyDown = (event: KeyboardEvent<HTMLAnchorElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openAbout();
  };

  const toggleAriaLabel =
    toggleLabel === "Menu" ? "Open menu" : toggleLabel === "Back" ? "Back to menu" : "Close menu";

  return (
    <header className={`site-header${isOpen ? " site-header--menu-open" : ""}`} data-no-strip-drag>
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

      <div className="site-header__inner u-container-main">
        <NavLink className="link-main site-header__brand" to="/" rotateHover={useRotateHover && !isHome}>
          <NavBrand
            isHome={isHome}
            useRotateHover={useRotateHover && !isHome}
            paused={isMorphing}
            showName={showBrandName}
          />
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
                  data-rotate-hover={useRotateHover ? "" : undefined}
                  onClick={shellOpen ? handleToggleClick : openMenu}
                  onKeyDown={!shellOpen ? handleToggleKeyDown : undefined}
                >
                  {useRotateHover ? (
                    <RotateHoverLabel
                      text={toggleLabel}
                      changeKey={toggleLabel}
                      paused={isMorphing}
                    />
                  ) : (
                    toggleLabel
                  )}
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
                          onClick={closeAll}
                          rotateHover={useRotateHover}
                        >
                          {useRotateHover && location.pathname !== path ? (
                            <RotateHoverLabel text={label} paused={isMorphing} />
                          ) : (
                            label
                          )}
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
                        {useRotateHover ? (
                          <RotateHoverLabel text="About" paused={isMorphing} />
                        ) : (
                          "About"
                        )}
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
