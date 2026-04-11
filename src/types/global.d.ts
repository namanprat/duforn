declare module "web-haptics" {
  type HapticStep =
    | { duration: number; intensity?: number }
    | { delay: number; duration: number; intensity?: number };

  export class WebHaptics {
    constructor(options?: { debug?: boolean });
    trigger(pattern: "nudge" | HapticStep[], options?: { intensity?: number }): void;
  }
}
