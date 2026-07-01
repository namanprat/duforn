import { useWorkProjectTransitionStore } from "../store/workProjectTransition";

export default function RouteTransitionOverlay() {
  const overlayOpacity = useWorkProjectTransitionStore((s) => s.overlayOpacity);
  const active = useWorkProjectTransitionStore((s) => s.active);

  if (!active && overlayOpacity <= 0) return null;

  return (
    <div
      className="dissolve_transition_overlay"
      aria-hidden
      style={{ opacity: overlayOpacity }}
    >
      <div className="dissolve_transition_layer route_transition_layer" />
    </div>
  );
}
