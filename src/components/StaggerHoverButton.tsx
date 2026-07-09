import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode, Ref } from "react";
import StaggerHoverChars from "./StaggerHoverChars";

type StaggerHoverButtonBaseProps = {
  label: string;
  variant?: "primary" | "secondary";
  icon?: ReactNode;
  className?: string;
};

type StaggerHoverButtonAnchorProps = StaggerHoverButtonBaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> & {
    as?: "a";
    ref?: Ref<HTMLAnchorElement>;
  };

type StaggerHoverButtonButtonProps = StaggerHoverButtonBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
    as: "button";
    ref?: Ref<HTMLButtonElement>;
  };

export type StaggerHoverButtonProps =
  | StaggerHoverButtonAnchorProps
  | StaggerHoverButtonButtonProps;

export default function StaggerHoverButton(props: StaggerHoverButtonProps) {
  const {
    label,
    variant = "primary",
    icon,
    className,
    as = "a",
    ref,
    ...rest
  } = props;

  const classes = [
    "button",
    "stagger-hover-btn",
    variant === "primary" ? "button-primary" : "button-secondary",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <span className="stagger-hover-btn__bg" aria-hidden="true" />
      <StaggerHoverChars className="stagger-hover-btn__text">{label}</StaggerHoverChars>
      {icon ? <span className="stagger-hover-btn__icon">{icon}</span> : null}
    </>
  );

  if (as === "button") {
    const buttonProps = rest as ButtonHTMLAttributes<HTMLButtonElement>;
    return (
      <button
        ref={ref as Ref<HTMLButtonElement>}
        type={buttonProps.type ?? "button"}
        className={classes}
        data-button-hover-scale="false"
        {...buttonProps}
      >
        {content}
      </button>
    );
  }

  const anchorProps = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
  return (
    <a
      ref={ref as Ref<HTMLAnchorElement>}
      className={classes}
      data-button-hover-scale="false"
      {...anchorProps}
    >
      {content}
    </a>
  );
}
