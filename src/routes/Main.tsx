import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { navigateTo } from "../lib/nav";
import { cameraFovOffsetRef } from "../scenes/cam/pose";
import { ROOM_TRANSITION_SECONDS, ROOM_POSES, WORK_FOV } from "../scenes/cam/roomPoses";
import TextRevealLines from "../text/Reveal";
import CameraRevealGroup from "../text/CameraRevealGroup";
import StaggerHoverButton from "../components/StaggerHoverButton";
import { hasFinePointerHover } from "../lib/link-hover";
import {
  STUDIO_INTRO_COPY,
  HERO_EYEBROW,
  HERO_TITLE_LEAD,
  HERO_TITLE_SERIF,
} from "../content/studio";

gsap.registerPlugin(CustomEase);
CustomEase.create("custom", "M0,0 C0.103,0.204 0.493,0.561 1,0.561");

const VIEW_WORK_FOV_EASE = "custom";
const VIEW_WORK_FOV_DURATION = 0.5;

export default function MainPage() {
  const pillRef = useRef<HTMLAnchorElement | null>(null);
  const usePillFovHover = hasFinePointerHover();
  // Width of the centered pill. The copy rail is sized to this so the
  // left-aligned paragraph shares the button's left edge (per Figma), while the
  // text overflows to the right.
  const [ctaWidthPx, setCtaWidthPx] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = pillRef.current;
    if (!el) return;

    const measure = () => {
      const w = Math.round(el.getBoundingClientRect().width);
      if (w > 0) setCtaWidthPx(w);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);

    let cancelled = false;
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) measure();
      });
    }

    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, []);

  const go = (event: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    event.preventDefault();
    navigateTo(path);
  };

  // Hovering "View Work" eases the camera FOV to the work room's exact resting FOV (and back
  // on leave), so the hover previews the destination and the home→work move has zero FOV drift.
  // Derived from the work pose so it always tracks whatever work fov is tuned in roomPoses.
  const onPillEnter = () =>
    gsap.to(cameraFovOffsetRef, {
      current: WORK_FOV - ROOM_POSES.main.fov,
      duration: VIEW_WORK_FOV_DURATION,
      ease: VIEW_WORK_FOV_EASE,
      overwrite: true,
    });
  const onPillLeave = () =>
    gsap.to(cameraFovOffsetRef, {
      current: 0,
      duration: VIEW_WORK_FOV_DURATION,
      ease: VIEW_WORK_FOV_EASE,
      overwrite: true,
    });

  // On unmount (e.g. navigating to Work) ease the hover offset back to 0 over the same
  // curve the room transition uses for fov, so base.fov + offset stays monotonic and
  // doesn't flicker. useLayoutEffect so it starts in the same commit as RoomCam's fov
  // tween (a passive effect would start a frame late and desync the cancellation).
  useLayoutEffect(
    () => () => {
      gsap.to(cameraFovOffsetRef, {
        current: 0,
        duration: ROOM_TRANSITION_SECONDS,
        ease: "power3.inOut",
        overwrite: true,
      });
    },
    [],
  );

  return (
    <main
      className="hero_wrap u-min-height-screen u-color-light u-background-transparent"
      data-page-namespace="main"
    >
      <div className="hero_contain u-container-main">
        <div className="hero_stack">
          <CameraRevealGroup waitForCamera waitForScene>
            <p className="hero_eyebrow">{HERO_EYEBROW}</p>
          </CameraRevealGroup>
          <div className="home-hero-brand-clip">
            <TextRevealLines animateOnScroll={false} waitForCamera waitForScene>
              <h1 className="hero_title_lead">{HERO_TITLE_LEAD}</h1>
            </TextRevealLines>
            <TextRevealLines animateOnScroll={false} waitForCamera waitForScene delay={0.06}>
              <p className="hero_title_serif">{HERO_TITLE_SERIF}</p>
            </TextRevealLines>
          </div>
          <div className="hero_cluster">
            <div
              className="hero-stage__copy-rail"
              style={ctaWidthPx ? { width: ctaWidthPx } : undefined}
            >
              <TextRevealLines animateOnScroll={false} waitForCamera waitForScene delay={0.12}>
                <p className="hero_text">{STUDIO_INTRO_COPY}</p>
              </TextRevealLines>
            </div>
            <CameraRevealGroup waitForCamera waitForScene delay={0.18}>
              <div className="hero_actions">
                <StaggerHoverButton
                  ref={pillRef}
                  className="hero_pill"
                  href="/work"
                  data-no-strip-drag
                  label="View Work"
                  icon={
                    <span className="hero_pill_arrow" aria-hidden="true">
                      ↗
                    </span>
                  }
                  onClick={(e) => go(e, "/work")}
                  {...(usePillFovHover
                    ? {
                        onMouseEnter: onPillEnter,
                        onMouseLeave: onPillLeave,
                        onFocus: onPillEnter,
                        onBlur: onPillLeave,
                      }
                    : {})}
                />
              </div>
            </CameraRevealGroup>
          </div>
        </div>
      </div>
    </main>
  );
}
