/**
 * Trail mask for project-bg shading. Produces a soft white stroke that decays
 * each frame — sample .r as height.
 *
 * The blurred radial gradient is baked into an offscreen sprite once at
 * construction; the per-frame cost is a fade rect + one drawImage. No
 * per-frame gradient allocation, no per-frame canvas blur filter.
 */

const GRADIENT_STOPS: ReadonlyArray<[number, number]> = [
  [0, 0.7],
  [0.08, 0.5],
  [0.15, 0.35],
  [0.25, 0.2],
  [0.35, 0.12],
  [0.5, 0.06],
  [0.65, 0.03],
  [0.8, 0.01],
  [1, 0],
];

interface TrailPoint {
  x?: number;
  y?: number;
}

function bakeGradientSprite(radius: number, blurPx: number): HTMLCanvasElement {
  const padding = Math.ceil(blurPx * 3);
  const size = Math.ceil(radius * 2) + padding * 2;
  const sprite = document.createElement("canvas");
  sprite.width = size;
  sprite.height = size;

  const ctx = sprite.getContext("2d");
  if (!ctx) return sprite;

  const center = size / 2;
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, radius);
  for (const [stop, alpha] of GRADIENT_STOPS) {
    gradient.addColorStop(stop, `rgba(255, 255, 255, ${alpha})`);
  }

  ctx.filter = `blur(${blurPx}px)`;
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.fill();

  return sprite;
}

export class ProjectBgTrailCanvas {
  canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private sprite: HTMLCanvasElement;
  private fadeAlpha = 0.025;
  /** Frames left until the last stamp has fully decayed to black. */
  private decayFramesLeft = 0;

  constructor(width = 256, height = 256) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext("2d");

    if (this.ctx) {
      this.ctx.fillStyle = "black";
      this.ctx.fillRect(0, 0, width, height);
    }

    this.sprite = bakeGradientSprite(width * 0.12 * 2.5, 4);
  }

  /**
   * Stamps the trail at canvas pixel coordinates and decays the previous
   * frames. Returns true when the canvas changed (texture upload needed).
   */
  update(mouse: TrailPoint | null): boolean {
    const { ctx, canvas } = this;
    if (!ctx) return false;

    const hasStamp = mouse != null && mouse.x !== undefined && mouse.y !== undefined;
    if (!hasStamp && this.decayFramesLeft <= 0) return false;

    ctx.fillStyle = `rgba(0, 0, 0, ${this.fadeAlpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (hasStamp) {
      const half = this.sprite.width / 2;
      ctx.drawImage(this.sprite, (mouse.x as number) - half, (mouse.y as number) - half);
      // ~1/fadeAlpha frames until a full-white stamp fades below visibility.
      this.decayFramesLeft = Math.ceil(1 / this.fadeAlpha) + 8;
    } else {
      this.decayFramesLeft -= 1;
    }

    return true;
  }

  resize(width: number, height: number): void {
    if (this.canvas.width === width && this.canvas.height === height) return;
    this.canvas.width = width;
    this.canvas.height = height;
    this.sprite = bakeGradientSprite(width * 0.12 * 2.5, 4);
    if (this.ctx) {
      this.ctx.fillStyle = "black";
      this.ctx.fillRect(0, 0, width, height);
    }
    this.decayFramesLeft = 0;
  }
}
