import React, { useRef, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { closeMenuIfOpen } from "../../../scripts/menu.js";
import { animateRevealLeave } from "../../../scripts/text-reveal.js";
import PreloaderScene from "./PreloaderScene.jsx";
import GlobalCanvas from "../webgl/GlobalCanvas.jsx";
import RiverCanvas from "../webgl/RiverCanvas.jsx";
import WorkCanvas from "../webgl/WorkCanvas.jsx";
import ArchiveCanvas from "../webgl/ArchiveCanvas.jsx";
import FilmCanvas from "../webgl/FilmCanvas.jsx";
import { useWebglStore } from "../../store/webgl.js";

function NavLink({ to, className, children, ...props }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = async (e) => {
    // Allow default behavior for modifier keys (open in new tab, etc.)
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }

    e.preventDefault();
    closeMenuIfOpen(e);

    // Only animate and navigate if the path is actually changing
    if (location.pathname !== to) {
      const container = document.querySelector('[data-page-container="true"]');
      if (container) {
        // Run the leave animation on the current page content
        await animateRevealLeave(container);
      }
      navigate(to);
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
  if (page === "river" || page === "work" || page === "archive" || page === "film") return page;
  return "global"; // home + contact share GlobalCanvas
}

function PageCanvas({ activePage }) {
  switch (activePage) {
    case "river":
      return <RiverCanvas />;
    case "work":
      return <WorkCanvas />;
    case "archive":
      return <ArchiveCanvas />;
    case "film":
      return <FilmCanvas />;
    default:
      return <GlobalCanvas />;
  }
}

export default function SiteLayout({ children }) {
  const activePage = useWebglStore((s) => s.activePage);
  const [displayedPage, setDisplayedPage] = useState(activePage);
  const [transitioning, setTransitioning] = useState(false);
  const prevPageRef = useRef(activePage);

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

      <section className="preloader" aria-label="Website preloader">
        <div className="preloader-scanline-overlay" aria-hidden="true" />
        <div className="preloader-inner u-flex-vertical-nowrap u-align-items-center u-justify-content-center">
          <div className="preloader-canvas-wrap">
            <PreloaderScene />
          </div>
          <div
            className="preloader-terminal u-flex-vertical-nowrap u-align-items-center"
            style={{ opacity: 0, pointerEvents: "none" }}
          >
            <p className="preloader-loading u-text-align-center" aria-live="polite"></p>
            <p className="preloader-progress-bar u-text-align-center" aria-live="polite"></p>
            <div className="preloader-button-wrap u-flex-horizontal-nowrap u-justify-content-center">
              <button type="button" className="preloader-enter-button">
                ENTER
              </button>
            </div>
          </div>
        </div>
      </section>

      <header>
        <nav className="nav-wrap u-position-fixed">
          <div className="nav-contain u-container-full">
            <NavLink className="u-mobile-hidden" to="/work">
              work
            </NavLink>
            <NavLink to="/" className="link-main nav-brand">
              duforn
            </NavLink>
            <NavLink className="u-mobile-hidden" to="/contact">
              contact
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

      <div
        style={{
          opacity: transitioning ? 0 : 1,
          transition: "opacity 0.3s ease",
        }}
      >
        <PageCanvas activePage={displayedPage} />
      </div>

      {children}

      <footer className="u-visually-hidden">
        <p>&copy; 2026 Duforn. All rights reserved.</p>
      </footer>
    </>
  );
}
