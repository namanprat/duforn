import type { MouseEvent, ReactNode, RefObject } from "react";
import TextRevealLines from "../textReveal/TextRevealLines";
import RotateHoverLabel from "../RotateHoverLabel";

type NavLinkRenderer = (props: {
  to: string;
  className: string;
  children: ReactNode;
  onClick?: () => void;
  ["data-rotate-hover"]?: string | undefined;
}) => ReactNode;

type MenuOverlayLayerProps = {
  isMenuOpen: boolean;
  menuRef: RefObject<HTMLDivElement | null>;
  onCloseMenu: () => void;
  onBackdropClick: (event: MouseEvent<HTMLDivElement>) => void;
  surfaceSolid: boolean;
  rotateHoverLabels: boolean;
  renderNavLink: NavLinkRenderer;
};

export default function MenuOverlayLayer({
  isMenuOpen,
  menuRef,
  onCloseMenu,
  onBackdropClick,
  surfaceSolid,
  rotateHoverLabels,
  renderNavLink,
}: MenuOverlayLayerProps) {
  const menuLink = (to: string, label: string) =>
    renderNavLink({
      className: "menu-fullscreen__link u-text-style-h2 u-text-style-font-primary",
      to,
      onClick: onCloseMenu,
      "data-rotate-hover": rotateHoverLabels ? "" : undefined,
      children: rotateHoverLabels ? (
        <RotateHoverLabel text={label} />
      ) : (
        <TextRevealLines scope="menu" animateOnScroll={false}>
          <span className="menu-fullscreen__link-label">{label}</span>
        </TextRevealLines>
      ),
    });

  return (
    <div
      className={`menu-wrap menu-wrap--fullscreen${isMenuOpen ? " is-open" : ""}${surfaceSolid ? " menu-wrap--surface-solid" : ""}`}
      ref={menuRef}
      id="site-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      aria-hidden={!isMenuOpen}
      onClick={onBackdropClick}
    >
      <div className="menu-fullscreen">
        <div className="menu-fullscreen__top">
          <span
            className="menu-fullscreen__brand menu-fullscreen__brand--flicker u-text-style-h2 u-text-style-font-primary"
            aria-hidden="true"
          >
            Duforn
          </span>
        </div>
        <nav className="menu-fullscreen__nav" aria-label="Primary navigation">
          {menuLink("/", "HOME")}
          {menuLink("/work", "WORK")}
          {menuLink("/contact", "CONTACT")}
          {menuLink("/archive", "ARCHIVE")}
          {menuLink("/money-me", "PROJECT")}
        </nav>
      </div>
    </div>
  );
}
