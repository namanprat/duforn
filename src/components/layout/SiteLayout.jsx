import React, { useRef, useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { navigateTo } from "../../lib/navigationBridge.js";
import GlobalCanvas from "../webgl/GlobalCanvas.jsx";
import WorkCanvas from "../webgl/WorkCanvas.jsx";
import { useWebglStore } from "../../store/webgl.js";
import { useLoadingStore } from "../../store/loading.js";

function NavLink({ to, className, children, ...props }) {
  const location = useLocation();

  const handleClick = (e) => {
    // Allow default behavior for modifier keys (open in new tab, etc.)
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }

    e.preventDefault();

    // Only navigate if the path is actually changing.
    // All leave animation + canvas transition is handled by the NavigationBridge.
    if (location.pathname !== to) {
      navigateTo(to);
    }
  };

  const isActive = location.pathname === to;

  return (
    <a
      href={to}
      className={className}
      onClick={handleClick}
      aria-current={isActive ? "page" : undefined}
      {...props}
    >
      {children}
    </a>
  );
}

function ReceiptMenu() {
  return (
    <div
      className="menu-wrap"
      id="site-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      aria-hidden="true"
    >
      <div className="menu-content u-container-full">
        <div className="menu-box u-flex-vertical-nowrap u-justify-content-center">
          <img
            src="/menu/bill-top.svg"
            alt=""
            className="u-width-full receipt-svg u-object-fit-contain u-height-auto"
            loading="lazy"
            decoding="async"
          />
          <div className="receipt-menu u-flex-vertical-nowrap u-gap-3">
            <NavLink className="receipt-header" to="/">
              <img
                src="/menu/bill-logo.svg"
                alt="bill-logo"
                className="receipt-logo"
                loading="lazy"
                decoding="async"
              />
            </NavLink>
            <p className="u-text-align-center">
              Commodo excepteur irure culpa aute
              <br />
              laborum sunt non aliqua cillum aute.
              <br />
              Tempor ut dolore excepteur proident
              <br />
              laboris quis enim irure.
            </p>

            <div className="u-flex-vertical-nowrap u-gap-3 u-width-full">
              <div className="receipt-divider" />
              <div className="receipt-meta">
                <p id="receipt-datetime" className="u-text-align-center">
                  SUN 31/04/24 11:36:49 AM
                </p>
                <p className="u-text-align-center">** SHOPPING BAG **</p>
              </div>
              <div className="receipt-divider" />
            </div>

            <div className="menu-item-contain u-flex-vertical-nowrap u-width-full">
              <NavLink className="menu-item" to="/work">
                <span className="menu-item-label">WORK</span>
                <div className="receipt-dots" aria-hidden="true" />
                <span className="menu-item-index">01</span>
              </NavLink>
              <NavLink className="menu-item" to="/contact">
                <span className="menu-item-label">CONTACT</span>
                <div className="receipt-dots" aria-hidden="true" />
                <span className="menu-item-index">02</span>
              </NavLink>
              <NavLink className="menu-item" to="/archive">
                <span className="menu-item-label">ARCHIVE</span>
                <div className="receipt-dots" aria-hidden="true" />
                <span className="menu-item-index">03</span>
              </NavLink>
            </div>

            <div className="barcode-contain u-flex-vertical-nowrap u-width-full">
              <div className="receipt-star" aria-hidden="true" />
              <div className="receipt-barcode">
                <img
                  src="/menu/barcode.svg"
                  alt="Barcode"
                  className="receipt-svg"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="receipt-star" aria-hidden="true" />
            </div>
          </div>
          <img
            src="/menu/bill-top.svg"
            alt=""
            className="u-vertical-flip u-width-full receipt-svg u-object-fit-contain u-height-auto"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </div>
  );
}

function getCanvasKey(page) {
  if (page === "work") return page;
  return "global"; // home + contact + archive share GlobalCanvas
}

function PageCanvas({ activePage }) {
  switch (activePage) {
    case "work":
      return <WorkCanvas />;
    default:
      return <GlobalCanvas activePage={activePage} />;
  }
}

export default function SiteLayout({ children }) {
  const activePage = useWebglStore((s) => s.activePage);
  const phase = useLoadingStore((s) => s.phase);
  const [preloaderFading, setPreloaderFading] = useState(false);
  const [preloaderVisible, setPreloaderVisible] = useState(true);
  const [displayedPage, setDisplayedPage] = useState(activePage);
  const [transitioning, setTransitioning] = useState(false);
  const prevPageRef = useRef(activePage);
  const preloaderTimerRef = useRef(0);

  useEffect(() => {
    document.body.classList.toggle("preloader-active", preloaderVisible);
    return () => document.body.classList.remove("preloader-active");
  }, [preloaderVisible]);

  const dismissPreloader = useCallback(() => {
    if (phase !== "ready") return;
    if (!preloaderVisible || preloaderFading) return;

    setPreloaderFading(true);
    preloaderTimerRef.current = window.setTimeout(() => {
      setPreloaderVisible(false);
      setPreloaderFading(false);
      preloaderTimerRef.current = 0;
      window.dispatchEvent(
        new CustomEvent("duforn:preloader-dismissed", {
          detail: { pathname: window.location.pathname },
        }),
      );
    }, 600);
  }, [phase, preloaderFading, preloaderVisible]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      dismissPreloader();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dismissPreloader]);

  useEffect(() => {
    return () => {
      if (preloaderTimerRef.current) {
        window.clearTimeout(preloaderTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (activePage === prevPageRef.current) return;
    const prevKey = getCanvasKey(prevPageRef.current);
    const nextKey = getCanvasKey(activePage);

    if (prevKey === nextKey) {
      // Same canvas type (e.g. home↔contact) — no transition needed
      setDisplayedPage(activePage);
      prevPageRef.current = activePage;
    } else {
      // Different canvas — fade out, swap immediately, fade in
      setTransitioning(true);
      // Swap canvas immediately so it can start loading
      setDisplayedPage(activePage);
      // Briefly keep opacity 0 to let the new canvas mount, then fade in
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTransitioning(false);
          prevPageRef.current = activePage;
        });
      });
    }
  }, [activePage]);

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      {preloaderVisible && (
        <section
          className="preloader"
          aria-label="Website preloader"
          data-state={preloaderFading ? "fading" : "visible"}
        >
          <div className="preloader-scanline-overlay" aria-hidden="true" />
          <div className="preloader-inner u-flex-vertical-nowrap u-align-items-center u-justify-content-center">
            <h1 className="preloader-brand u-text-style-display">DUFORN</h1>
            <div className="preloader-actions u-flex-vertical-nowrap u-align-items-center">
              <button
                type="button"
                className="preloader-continue-btn"
                onClick={dismissPreloader}
                disabled={phase !== "ready"}
              >
                Enter
              </button>
              <p className="preloader-status">
                {phase === "ready" ? "Press Enter to continue" : "Loading experience..."}
              </p>
            </div>
          </div>
        </section>
      )}

      <header>
        <nav className="nav-wrap u-position-fixed">
          <div className="nav-contain u-container-full">
            <NavLink className="u-mobile-hidden" to="/contact">
              contact
            </NavLink>
            <NavLink to="/" className="link-main nav-brand">
              DUFORN
            </NavLink>
            <NavLink className="u-mobile-hidden" to="/work">
              work
            </NavLink>
            <button
              className="menu-toggle-btn"
              type="button"
              aria-label="Open menu"
              aria-haspopup="dialog"
              aria-controls="site-menu"
              aria-expanded="false"
            >
              <span className="menu-toggle-btn-wrapper">MENU</span>
            </button>
          </div>
        </nav>

        <div className="bottom-nav-wrap u-position-fixed u-container-full u-mobile-hidden">
          <div className="bottom-nav-contain">
            <NavLink to="/archive">archive</NavLink>
            <div id="time" aria-live="polite">
              12:34:56 IST
            </div>
          </div>
        </div>

        <ReceiptMenu />
      </header>

      <div className="page-canvas" data-state={transitioning ? "transitioning" : "ready"}>
        <PageCanvas activePage={displayedPage} />
      </div>

      {children}

      <footer className="u-visually-hidden">
        <p>&copy; 2026 DUFORN. All rights reserved.</p>
      </footer>
    </>
  );
}
