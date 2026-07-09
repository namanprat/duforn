import { MOTION_TOKENS } from "../lib/animation/motionTokens";

type StaggerHoverCharsProps = {
  children: string;
  className?: string;
  disabled?: boolean;
};

/** Splits label text into per-char spans for the CSS char-hover roll-up. */
export default function StaggerHoverChars({
  children,
  className,
  disabled = false,
}: StaggerHoverCharsProps) {
  const step = MOTION_TOKENS.charHover.staggerStep;
  const chars = [...children];

  return (
    <span
      className={`char-hover__clip${disabled ? " char-hover--disabled" : ""}${className ? ` ${className}` : ""}`}
    >
      <span className="char-hover__track">
        {chars.map((c, i) => (
          <span key={i} style={{ transitionDelay: `${i * step}s` }}>
            {c === " " ? "\u00a0" : c}
          </span>
        ))}
      </span>
    </span>
  );
}
