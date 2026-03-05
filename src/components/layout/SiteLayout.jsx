import { Link } from 'react-router-dom';
import { closeMenuIfOpen } from '../../../scripts/menu.js';

function ReceiptMenu() {
  return (
    <div className="menu-wrap" id="site-menu" role="dialog" aria-modal="true" aria-label="Site menu" aria-hidden="true">
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
            <div className="receipt-header">
              <img src="/menu/bill-logo.svg" alt="bill-logo" className="receipt-logo" loading="lazy" decoding="async" />
            </div>
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
                <p id="receipt-datetime" className="u-text-align-center">SUN 31/04/24 11:36:49 AM</p>
                <p className="u-text-align-center">** SHOPPING BAG **</p>
              </div>
              <div className="receipt-divider" />
            </div>

            <Link className="menu-item" to="/work" onClick={closeMenuIfOpen}>
              <h5>WORK</h5>
              <div className="receipt-dots" aria-hidden="true" />
              <h5>01</h5>
            </Link>
            <Link className="menu-item" to="/contact" onClick={closeMenuIfOpen}>
              <h5>CONTACT</h5>
              <div className="receipt-dots" aria-hidden="true" />
              <h5>02</h5>
            </Link>
            <Link className="menu-item" to="/archive" onClick={closeMenuIfOpen}>
              <h5>ARCHIVE</h5>
              <div className="receipt-dots" aria-hidden="true" />
              <h5>03</h5>
            </Link>

            <div className="u-flex-vertical-nowrap u-gap-3 u-width-full">
              <div className="receipt-star" aria-hidden="true" />
              <div className="receipt-barcode">
                <img src="/menu/barcode.svg" alt="Barcode" className="receipt-svg" loading="lazy" decoding="async" />
              </div>
              <div className="receipt-star" aria-hidden="true" />
            </div>

            <button className="receipt-close" type="button" onClick={closeMenuIfOpen}>
              <h5 className="receipt-close-text">CLOSE</h5>
              <span className="receipt-close-arrow">→</span>
            </button>
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

export default function SiteLayout({ children }) {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <div className="preloader">
        <div className="preloader-grid" />
        <div className="progress-bar">
          <div className="progress-bar-indicator" />
          <div className="progress-bar-copy">
            <p>LOADING...</p>
            <p>
              <span>0%</span>
            </p>
          </div>
        </div>
      </div>

      <header>
        <nav className="nav-wrap u-position-fixed">
          <div className="nav-contain u-container-full">
            <Link className="u-mobile-hidden" to="/work" onClick={closeMenuIfOpen}>
              work
            </Link>
            <Link to="/" className="link-main" onClick={closeMenuIfOpen}>
              duforn
            </Link>
            <Link className="u-mobile-hidden" to="/contact" onClick={closeMenuIfOpen}>
              contact
            </Link>
            <button className="menu-toggle-btn" type="button" aria-label="Open menu" aria-haspopup="dialog" aria-controls="site-menu" aria-expanded="false">
              <span className="menu-toggle-btn-wrapper">MENU</span>
            </button>
          </div>
        </nav>

        <div className="bottom-nav-wrap u-position-fixed u-container-full u-mobile-hidden">
          <div className="bottom-nav-contain">
            <Link to="/archive" onClick={closeMenuIfOpen}>archive</Link>
            <a id="time" aria-live="polite">
              12:34:56 IST
            </a>
          </div>
        </div>

        <ReceiptMenu />
      </header>

      <div id="background" />

      {children}

      <footer className="u-visually-hidden">
        <p>&copy; 2026 Duforn. All rights reserved.</p>
      </footer>
    </>
  );
}
