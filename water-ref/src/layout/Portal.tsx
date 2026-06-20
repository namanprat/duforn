import { ReactNode } from "react";
import { createPortal } from "react-dom";

const OVERLAY_ROOT_ID = "overlay-root";

export default function OverlayPortal({ children }: { children: ReactNode }) {
  if (typeof document === "undefined") return null;
  const target = document.getElementById(OVERLAY_ROOT_ID);
  if (!target) return null;
  return createPortal(children, target);
}
