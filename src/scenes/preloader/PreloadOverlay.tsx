import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { hasInitialBootCompleted, useSceneBootStore } from "./sceneReady";
import { cameraRigControlsRef } from "../cam/pose";
import { tryEnableGyroParallax } from "../../lib/deviceOrientation";
import { hasFinePointerHover } from "../../lib/link-hover";
import { prefersReducedMotion } from "../../lib/prefersReducedMotion";
import { canRunDissolveTransition } from "../../store/routeTransition";
import { useSequentialCounter } from "./useSequentialCounter";
import StaggerHoverButton from "../../components/StaggerHoverButton";
import StaggerHoverChars from "../../components/StaggerHoverChars";
import GridLines from "../../components/GridLines";

const NAME = "Naman Pratulya";
/* Odometer strips are value-indexed (one entry per value 0-99) so 9→0 wraps
   roll forward for free — the counter is monotonic. */
const ODOMETER_MAX = 99;
const TENS = Array.from({ length: 100 }, (_, v) => Math.floor(v / 10));
const ONES = Array.from({ length: 100 }, (_, v) => v % 10);

export default function PreloadOverlay() {
  const phase = useSceneBootStore((s) => s.phase);
  const progress = useSceneBootStore((s) => s.progress);
  const requestReveal = useSceneBootStore((s) => s.requestReveal);
  const [exiting, setExiting] = useState(false);

  const counterActive =
    phase === "fetching" || phase === "compiling" || phase === "ready";
  const displayed = useSequentialCounter(progress, counterActive);

  const tensRef = useRef<HTMLDivElement>(null);
  const onesRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLParagraphElement>(null);
  const enterRef = useRef<HTMLDivElement>(null);
  const handoffTl = useRef<gsap.core.Timeline | null>(null);
  const handoffStarted = useRef(false);
  const odometerRef = useRef<((v: number) => void) | null>(null);

  useEffect(() => {
    const strips = [tensRef.current, onesRef.current].filter(
      (el): el is HTMLDivElement => el !== null,
    );
    if (!strips.length) return;
    const v = Math.min(displayed, ODOMETER_MAX);
    if (prefersReducedMotion()) {
      gsap.set(strips, { yPercent: -v });
      return;
    }
    // ponytail: one reused quickTo tween, retargeted each tick — no ~60 tween
    // create/kill per second competing with GLB parse/compile.
    odometerRef.current ??= gsap.quickTo(strips, "yPercent", {
      duration: 1,
      ease: "power3.out",
    });
    odometerRef.current(-v);
  }, [displayed]);

  useEffect(() => {
    if (handoffStarted.current) return;
    if (!(phase === "ready" && displayed >= 100)) return;
    handoffStarted.current = true;

    const counter = counterRef.current;
    const nameEl = nameRef.current;
    const words = nameEl ? Array.from(nameEl.querySelectorAll("span")) : [];
    const enter = enterRef.current;

    if (prefersReducedMotion()) {
      if (counter) gsap.set(counter, { autoAlpha: 0 });
      gsap.set(words, { opacity: 1 });
      if (enter) gsap.set(enter, { autoAlpha: 1 });
      return;
    }

    /* both words start centered on the name's midpoint, then split left/right
       into their natural positions */
    if (nameEl) {
      const mid = nameEl.getBoundingClientRect();
      const center = mid.left + mid.width / 2;
      words.forEach((w) => {
        const r = w.getBoundingClientRect();
        gsap.set(w, { x: center - (r.left + r.width / 2) });
      });
    }

    const tl = gsap.timeline();
    if (counter) {
      tl.to(counter, { autoAlpha: 0, duration: 0.5, ease: "power2.inOut" });
    }
    tl.to(
      words,
      { opacity: 1, x: 0, duration: 1.1, ease: "power3.inOut" },
      "-=0.15",
    );
    if (enter) {
      tl.to(enter, { autoAlpha: 1, duration: 0.5, ease: "power1.out" }, ">-0.3");
    }
    handoffTl.current = tl;
  }, [phase, displayed]);

  useEffect(
    () => () => {
      handoffTl.current?.kill();
      gsap.killTweensOf(
        [tensRef.current, onesRef.current, counterRef.current, enterRef.current].filter(
          Boolean,
        ),
      );
    },
    [],
  );

  if (hasInitialBootCompleted() || phase === "live") return null;

  const isRevealing = phase === "revealing";
  const usesGpuBackground = canRunDissolveTransition();

  const handleEnter = (muted: boolean) => {
    if (exiting || isRevealing) return;
    setExiting(true);

    if (!hasFinePointerHover() && !prefersReducedMotion()) {
      void tryEnableGyroParallax().then((allowed) => {
        cameraRigControlsRef.current.gyroEnabled = allowed;
      });
    }

    requestReveal(muted);
  };

  return (
    <div
      className={`scene_preload_overlay${usesGpuBackground ? " scene_preload_overlay--gpu-background" : ""}${isRevealing ? " scene_preload_overlay--revealing" : ""}`}
      data-no-strip-drag
      aria-hidden={isRevealing}
    >
      {!isRevealing ? (
        <div
          className={`scene_preload_overlay_inner${exiting ? " scene_preload_overlay_inner--exit" : ""}`}
        >
          <GridLines />
          <div className="scene_preload_counter" ref={counterRef} aria-hidden="true">
            <div className="scene_preload_odometer_slot">
              <div className="scene_preload_odometer_strip" ref={tensRef}>
                {TENS.map((d, i) => (
                  <span key={i}>{d}</span>
                ))}
              </div>
            </div>
            <div className="scene_preload_odometer_slot">
              <div className="scene_preload_odometer_strip" ref={onesRef}>
                {ONES.map((d, i) => (
                  <span key={i}>{d}</span>
                ))}
              </div>
            </div>
          </div>
          <p className="scene_preload_name" ref={nameRef} aria-label={NAME}>
            <span aria-hidden="true">Naman</span>{" "}
            <span aria-hidden="true">Pratulya</span>
          </p>
          <p className="scene_preload_sr" aria-live="polite">
            {Math.min(displayed, 100)}%
          </p>
          <div className="scene_preload_enter" ref={enterRef}>
            <StaggerHoverButton
              as="button"
              className="scene_preload_enter_btn"
              label="Enter"
              onClick={() => handleEnter(false)}
            />
            <button
              type="button"
              className="scene_preload_enter_muted"
              onClick={() => handleEnter(true)}
            >
              <StaggerHoverChars>Enter without sound</StaggerHoverChars>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
