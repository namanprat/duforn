// @ts-nocheck
/**
 * JONSWAP-shaped Gerstner wave bank.
 *
 * Generates a fixed bank of N Gerstner wave parameters whose amplitudes follow
 * the JONSWAP spectrum (Hasselmann et al., 1973) and whose directions are
 * spread around a primary wind direction. We are not running an FFT — for a
 * small bounded surface a sum of analytical Gerstner waves with a JONSWAP-shaped
 * envelope reads as a real ocean and avoids compute-shader complexity.
 */

const GRAVITY = 9.81;

export type WaveParams = {
  dir: [number, number];
  k: number;
  omega: number;
  amp: number;
  phase: number;
  steepness: number;
};

type Options = {
  count?: number;
  windSpeed?: number;
  windDirRad?: number;
  fetch?: number;
  spaceScale?: number;
  amplitudeScale?: number;
  steepness?: number;
  spreadRad?: number;
  seed?: number;
};

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateJONSWAPWaves(opts: Options = {}): WaveParams[] {
  const {
    count = 10,
    windSpeed = 9,
    windDirRad = 0.4,
    fetch = 12000,
    spaceScale = 0.6,
    amplitudeScale = 0.55,
    steepness = 0.75,
    spreadRad = 0.65,
    seed = 0xc0ffee,
  } = opts;

  const rand = mulberry32(seed);

  const peakOmega = 22 * Math.pow((GRAVITY * GRAVITY) / (windSpeed * fetch), 1 / 3);
  const alpha = 0.076 * Math.pow((windSpeed * windSpeed) / (fetch * GRAVITY), 0.22);
  const gamma = 3.3;

  const omegaMin = peakOmega * 0.5;
  const omegaMax = peakOmega * 2.5;
  const dOmega = (omegaMax - omegaMin) / count;

  const waves: WaveParams[] = [];
  for (let i = 0; i < count; i++) {
    const omega = omegaMin + (i + rand() * 0.6) * dOmega;
    const sigma = omega <= peakOmega ? 0.07 : 0.09;
    const r = Math.exp(
      -Math.pow(omega - peakOmega, 2) / (2 * sigma * sigma * peakOmega * peakOmega),
    );
    const S =
      ((alpha * GRAVITY * GRAVITY) / Math.pow(omega, 5)) *
      Math.exp(-1.25 * Math.pow(peakOmega / omega, 4)) *
      Math.pow(gamma, r);

    const dirAngle = windDirRad + (rand() - 0.5) * 2 * spreadRad;
    const dir: [number, number] = [Math.cos(dirAngle), Math.sin(dirAngle)];

    // Map wave number through space scale so wavelength matches the bath size.
    const kBase = (omega * omega) / GRAVITY;
    const k = kBase * spaceScale;

    const amp = Math.sqrt(Math.max(2 * S * dOmega, 0)) * amplitudeScale;
    const phase = rand() * Math.PI * 2;

    waves.push({ dir, k, omega, amp, phase, steepness });
  }

  return waves;
}
