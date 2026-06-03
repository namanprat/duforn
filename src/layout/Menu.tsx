import type { MouseEvent, ReactNode, RefObject } from "react";
import TextRevealLines from "../text/Reveal";
import RotateHoverLabel from "../ui/HoverLabel";

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
  const menuLink = (to: string, label: string, delay = 0) =>
    renderNavLink({
      className: "menu-fullscreen__link u-text-style-h1 u-text-style-font-primary",
      to,
      onClick: onCloseMenu,
      "data-rotate-hover": rotateHoverLabels ? "" : undefined,
      children: rotateHoverLabels ? (
        <RotateHoverLabel text={label} />
      ) : (
        <TextRevealLines scope="menu" animateOnScroll={false} delay={delay}>
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
        <nav className="menu-fullscreen__nav" aria-label="Primary navigation">
          {menuLink("/work", "Work", 0)}
          {menuLink("/contact", "Contact", 0.06)}
          {menuLink("/about", "About", 0.12)}
        </nav>
      </div>
    </div>
  );
}
