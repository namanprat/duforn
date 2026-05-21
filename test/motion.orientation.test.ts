import { describe, expect, it } from "vite-plus/test";
import {
  getScreenOrientationAngle,
  mapDeviceOrientationToParallax,
  remapOrientationToScreenSpace,
} from "../scripts/runtime/motion";

describe("device orientation parallax", () => {
  it("maps portrait tilt to screen x/y axes", () => {
    const mapped = mapDeviceOrientationToParallax({ beta: 45, gamma: 45 }, 0);
    expect(mapped).toEqual({ x: 1, y: 0 });
  });

  it("maps landscape tilt using screen-adjusted axes", () => {
    const mapped = mapDeviceOrientationToParallax({ beta: 45, gamma: 0 }, 90);
    expect(mapped?.x).toBeCloseTo(1, 5);
    expect(mapped?.y).toBeCloseTo(-1, 5);
  });

  it("maps landscape-secondary tilt with inverted horizontal axis", () => {
    const mapped = mapDeviceOrientationToParallax({ beta: 45, gamma: 0 }, 270);
    expect(mapped?.x).toBeCloseTo(-1, 5);
    expect(mapped?.y).toBeCloseTo(-1, 5);
  });

  it("rotates beta/gamma into screen space", () => {
    const remapped = remapOrientationToScreenSpace(30, 15, 90);
    expect(remapped.gamma).toBeCloseTo(30, 5);
    expect(remapped.beta).toBeCloseTo(-15, 5);
  });

  it("reconciles API orientation with visual portrait on touch devices", () => {
    const coarseDescriptor = { value: true, configurable: true };
    const portraitDescriptor = { value: false, configurable: true };

    vi.stubGlobal("window", {
      ...window,
      screen: { orientation: { angle: 90 } },
      orientation: 90,
      matchMedia: (query) => ({
        matches:
          query === "(pointer: coarse)"
            ? coarseDescriptor.value
            : query === "(orientation: landscape)"
              ? portraitDescriptor.value
              : false,
      }),
    });

    expect(getScreenOrientationAngle()).toBe(0);

    vi.unstubAllGlobals();
  });
});
