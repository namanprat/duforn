import { useEffect, useState } from "react";
import GridLines from "./GridLines";

function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
}

/** Shift+G toggles a full-viewport column-grid aid (available everywhere). */
export default function GridOverlay() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.code === "KeyG" && !isTyping(e.target)) {
        e.preventDefault();
        setVisible((v) => !v);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (!visible) return null;
  return (
    <div className="grid-overlay">
      <GridLines />
    </div>
  );
}
