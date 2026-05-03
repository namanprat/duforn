// @ts-nocheck
import { useEffect, useRef } from "react";
import * as THREE from "three";

export function useTrailTexture({
  width = 512,
  height = 512,
  variant = "brush",
  fadeAlpha = 0.025,
  blurPx = 4,
  radiusFactor = 0.12,
  gradientScale = 2.5,
  smudgeStrength = 0,
  smudgeBlurPx = 0,
  roughness = 0,
  stampAlpha = 1,
  flipX = false,
  flipY = false,
} = {}) {
  const trailTextureRef = useRef(null);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const configRef = useRef({
    variant,
    fadeAlpha,
    blurPx,
    radiusFactor,
    gradientScale,
    smudgeStrength,
    smudgeBlurPx,
    roughness,
    stampAlpha,
    flipX,
    flipY,
  });
  const previousRef = useRef({ x: null, y: null });

  useEffect(() => {
    configRef.current = {
      variant,
      fadeAlpha,
      blurPx,
      radiusFactor,
      gradientScale,
      smudgeStrength,
      smudgeBlurPx,
      roughness,
      stampAlpha,
      flipX,
      flipY,
    };
  }, [
    variant,
    fadeAlpha,
    blurPx,
    radiusFactor,
    gradientScale,
    smudgeStrength,
    smudgeBlurPx,
    roughness,
    stampAlpha,
    flipX,
    flipY,
  ]);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);

    const tex = new THREE.CanvasTexture(canvas);
    tex.flipY = false;

    canvasRef.current = canvas;
    ctxRef.current = ctx;
    trailTextureRef.current = tex;

    return () => {
      tex.dispose();
      trailTextureRef.current = null;
      canvasRef.current = null;
      ctxRef.current = null;
    };
  }, [width, height]);

  const updateTrail = (mouse) => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    const tex = trailTextureRef.current;
    if (!ctx || !canvas || !tex) return;

    const {
      variant: activeVariant,
      fadeAlpha: activeFadeAlpha,
      blurPx: activeBlurPx,
      radiusFactor: activeRadiusFactor,
      gradientScale: activeGradientScale,
      smudgeStrength: activeSmudgeStrength,
      smudgeBlurPx: activeSmudgeBlurPx,
      roughness: activeRoughness,
      stampAlpha: activeStampAlpha,
    } = configRef.current;
    const circleRadius = canvas.width * activeRadiusFactor;
    const remapMouse = (point) => {
      if (!point || point.x === undefined || point.y === undefined) return point;
      const mappedX = activeFlipX ? canvas.width - point.x : point.x;
      const mappedY = activeFlipY ? canvas.height - point.y : point.y;
      return { ...point, x: mappedX, y: mappedY };
    };
    const { flipX: activeFlipX, flipY: activeFlipY } = configRef.current;
    const currentMouse = remapMouse(mouse);

    if (activeVariant === "immersive") {
      ctx.fillStyle = `rgba(0, 0, 0, ${activeFadeAlpha})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (currentMouse && currentMouse.x !== undefined && currentMouse.y !== undefined) {
        const intensity = Math.max(0, Math.min(currentMouse.intensity ?? 1, 1));
        if (intensity > 0.001) {
          const circleRadius = canvas.width * activeRadiusFactor;
          const gradientRadius = circleRadius * activeGradientScale;
          const a = Math.max(0, Math.min(activeStampAlpha, 1)) * intensity;

          ctx.save();
          ctx.filter = `blur(${activeBlurPx}px)`;
          const gradient = ctx.createRadialGradient(
            currentMouse.x,
            currentMouse.y,
            0,
            currentMouse.x,
            currentMouse.y,
            gradientRadius,
          );
          gradient.addColorStop(0, `rgba(255, 255, 255, ${0.7 * a})`);
          gradient.addColorStop(0.08, `rgba(255, 255, 255, ${0.5 * a})`);
          gradient.addColorStop(0.15, `rgba(255, 255, 255, ${0.35 * a})`);
          gradient.addColorStop(0.25, `rgba(255, 255, 255, ${0.2 * a})`);
          gradient.addColorStop(0.35, `rgba(255, 255, 255, ${0.12 * a})`);
          gradient.addColorStop(0.5, `rgba(255, 255, 255, ${0.06 * a})`);
          gradient.addColorStop(0.65, `rgba(255, 255, 255, ${0.03 * a})`);
          gradient.addColorStop(0.8, `rgba(255, 255, 255, ${0.01 * a})`);
          gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(currentMouse.x, currentMouse.y, gradientRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      tex.needsUpdate = true;
      return;
    }

    // Subtle feedback smear: copy the buffer onto itself with a tiny offset.
    // This gives the "ink dragged through paper" feel without a full fluid sim.
    if (currentMouse && currentMouse.x !== undefined && currentMouse.y !== undefined) {
      const prevX = previousRef.current.x ?? currentMouse.x;
      const prevY = previousRef.current.y ?? currentMouse.y;
      const dx = currentMouse.x - prevX;
      const dy = currentMouse.y - prevY;
      const speed = Math.hypot(dx, dy);
      const normalized = speed > 0.0001 ? 1 / speed : 0;

      if (activeSmudgeStrength > 0.0001) {
        const shift = Math.min(speed, canvas.width * 0.035) * activeSmudgeStrength;
        // Keep feedback transport aligned with cursor motion (no reverse drag).
        const sx = dx * normalized * shift;
        const sy = dy * normalized * shift;

        ctx.save();
        ctx.globalAlpha = 0.96;
        ctx.globalCompositeOperation = "source-over";
        ctx.filter = activeSmudgeBlurPx > 0 ? `blur(${activeSmudgeBlurPx}px)` : "none";
        ctx.drawImage(canvas, sx, sy);
        ctx.restore();
      }

      previousRef.current.x = currentMouse.x;
      previousRef.current.y = currentMouse.y;
    }

    ctx.fillStyle = `rgba(0, 0, 0, ${activeFadeAlpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (currentMouse && currentMouse.x !== undefined && currentMouse.y !== undefined) {
      const intensity = Math.max(0, Math.min(currentMouse.intensity ?? 1, 1));
      if (intensity <= 0.001) {
        tex.needsUpdate = true;
        return;
      }

      const previousX = currentMouse.previousX ?? currentMouse.x;
      const previousY = currentMouse.previousY ?? currentMouse.y;
      const deltaX = currentMouse.x - previousX;
      const deltaY = currentMouse.y - previousY;
      const distance = Math.hypot(deltaX, deltaY);
      const stretch = 1 + Math.min(distance / (canvas.width * 0.1), 1.15);

      ctx.save();
      ctx.filter = `blur(${activeBlurPx}px)`;
      ctx.globalCompositeOperation = "lighter";

      const gradientRadius = circleRadius * activeGradientScale;
      const baseAlpha = Math.max(0, Math.min(activeStampAlpha, 1)) * intensity;

      if (distance > 0.5) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * baseAlpha})`;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = circleRadius * stretch * 0.75;
        ctx.beginPath();
        ctx.moveTo(previousX, previousY);
        ctx.lineTo(currentMouse.x, currentMouse.y);
        ctx.stroke();
      }

      // Motion-aligned ellipse: elongate along travel direction with a slight
      // backward gradient shift so the stamp reads more like a soft brush/comet
      // than a perfect circle, while keeping the same mask → extrusion pipeline.
      const moveThreshold = 1.75;
      let angle = 0;
      let elongation = 1;
      let cometShift = 0;
      if (distance > moveThreshold) {
        angle = Math.atan2(deltaY, deltaX);
        elongation = 1 + Math.min(distance / (canvas.width * 0.088), 1.4) * 0.92;
        cometShift = Math.min(distance * 0.11, gradientRadius * 0.38);
      }

      ctx.translate(currentMouse.x, currentMouse.y);
      ctx.rotate(angle);
      ctx.scale(elongation, 1);
      ctx.translate(-cometShift, 0);

      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, gradientRadius);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${0.42 * baseAlpha})`);
      gradient.addColorStop(0.2, `rgba(255, 255, 255, ${0.24 * baseAlpha})`);
      gradient.addColorStop(0.5, `rgba(255, 255, 255, ${0.12 * baseAlpha})`);
      gradient.addColorStop(0.78, `rgba(255, 255, 255, ${0.03 * baseAlpha})`);
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, gradientRadius, 0, Math.PI * 2);
      ctx.fill();

      // Edge roughness: small droplets on the ellipse rim (local space).
      if (activeRoughness > 0.001) {
        const droplets = Math.floor(6 + activeRoughness * 18);
        const dropletRadius = Math.max(1, circleRadius * (0.22 + activeRoughness * 0.22));
        ctx.filter = `blur(${Math.max(0.5, activeBlurPx * 0.6)}px)`;
        for (let i = 0; i < droplets; i += 1) {
          const t = (i / droplets) * Math.PI * 2;
          const jitter =
            (Math.sin((currentMouse.x + currentMouse.y) * 0.01 + i * 12.77) * 0.5 + 0.5) *
            activeRoughness;
          const r = gradientRadius * (0.72 + jitter * 0.55);
          const lx = Math.cos(t) * r;
          const ly = Math.sin(t) * r;
          const a = 0.08 * baseAlpha * (0.6 + jitter);
          ctx.fillStyle = `rgba(255, 255, 255, ${a})`;
          ctx.beginPath();
          ctx.arc(lx, ly, dropletRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    tex.needsUpdate = true;
  };

  return { trailTextureRef, updateTrail };
}
