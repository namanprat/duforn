import type { CSSProperties } from "react";
import { MOTION_TOKENS } from "../lib/animation/motionTokens";

type RotateHoverLabelProps = {
  text: string;
};

export default function RotateHoverLabel({ text }: RotateHoverLabelProps) {
  const { duration, ease } = MOTION_TOKENS.navHover;

  return (
    <span
      className="nav-link-hover__clip"
      style={
        {
          "--nav-hover-duration": `${duration}s`,
          "--nav-hover-ease": ease,
        } as CSSProperties
      }
    >
      <span className="nav-link-hover__track">
        <span>{text}</span>
      </span>
      <span className="nav-link-hover__track" aria-hidden="true">
        <span>{text}</span>
      </span>
    </span>
  );
}
