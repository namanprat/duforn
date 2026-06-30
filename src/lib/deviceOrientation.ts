type DeviceOrientationEventWithPermission = DeviceOrientationEvent & {
  requestPermission?: () => Promise<PermissionState>;
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function hasDeviceOrientationApi(): boolean {
  return typeof window !== "undefined" && "DeviceOrientationEvent" in window;
}

function canRequestDeviceOrientationPermission(): boolean {
  if (!hasDeviceOrientationApi()) return false;
  const ctor = window.DeviceOrientationEvent as unknown as DeviceOrientationEventWithPermission;
  return typeof ctor.requestPermission === "function";
}

async function requestDeviceOrientationPermission(): Promise<boolean> {
  if (!hasDeviceOrientationApi()) return false;
  if (!canRequestDeviceOrientationPermission()) return true;

  const ctor = window.DeviceOrientationEvent as unknown as DeviceOrientationEventWithPermission;
  const state = await ctor.requestPermission!();
  return state === "granted";
}

function screenOrientationAngle(): number {
  if (typeof window === "undefined") return 0;
  return screen.orientation?.angle ?? (window.orientation as number | undefined) ?? 0;
}

export function mapDeviceOrientationToParallax(
  event: DeviceOrientationEvent,
): { x: number; y: number } | null {
  if (event.gamma === null || event.beta === null) return null;
  const angle = screenOrientationAngle();
  const isLandscape = angle === 90 || angle === 270;
  const x = clamp((isLandscape ? event.beta / 45 : event.gamma / 45), -1, 1);
  const y = clamp((isLandscape ? event.gamma / 45 : (event.beta - 45) / 45), -1, 1);
  return { x, y };
}

export async function tryEnableGyroParallax(): Promise<boolean> {
  try {
    return await requestDeviceOrientationPermission();
  } catch {
    return false;
  }
}
