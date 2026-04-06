import { useEffect, useRef } from "react";
import * as THREE from "three";

export function useTrailTexture({
  width = 512,
  height = 512,
  fadeAlpha = 0.025,
  blurPx = 4,
  radiusFactor = 0.12,
  gradientScale = 2.5,
} = {}) {
  const trailTextureRef = useRef(null);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const configRef = useRef({ fadeAlpha, blurPx, radiusFactor, gradientScale });

  useEffect(() => {
    configRef.current = { fadeAlpha, blurPx, radiusFactor, gradientScale };
  }, [fadeAlpha, blurPx, radiusFactor, gradientScale]);

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
      fadeAlpha: activeFadeAlpha,
      blurPx: activeBlurPx,
      radiusFactor: activeRadiusFactor,
      gradientScale: activeGradientScale,
    } = configRef.current;
    const circleRadius = canvas.width * activeRadiusFactor;

    ctx.fillStyle = `rgba(0, 0, 0, ${activeFadeAlpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (mouse && mouse.x !== undefined && mouse.y !== undefined) {
      ctx.save();
      ctx.filter = `blur(${activeBlurPx}px)`;

      const gradientRadius = circleRadius * activeGradientScale;
      const gradient = ctx.createRadialGradient(
        mouse.x,
        mouse.y,
        0,
        mouse.x,
        mouse.y,
        gradientRadius,
      );
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.7)");
      gradient.addColorStop(0.08, "rgba(255, 255, 255, 0.5)");
      gradient.addColorStop(0.15, "rgba(255, 255, 255, 0.35)");
      gradient.addColorStop(0.25, "rgba(255, 255, 255, 0.2)");
      gradient.addColorStop(0.35, "rgba(255, 255, 255, 0.12)");
      gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.06)");
      gradient.addColorStop(0.65, "rgba(255, 255, 255, 0.03)");
      gradient.addColorStop(0.8, "rgba(255, 255, 255, 0.01)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, gradientRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    tex.needsUpdate = true;
  };

  return { trailTextureRef, updateTrail };
}
