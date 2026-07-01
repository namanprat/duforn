import { useArchiveViewStore, type ArchiveView } from "../../store/archiveView";
import { SWATCH_DARK, SWATCH_DARK_RGBA, SWATCH_LIGHT, SWATCH_LIGHT_RGBA } from "../../lib/siteColors";

const VIEWS: { id: ArchiveView; label: string }[] = [
  { id: "orb", label: "Orb" },
  { id: "grid", label: "Grid" },
];

// Orb / Grid switcher. Fixed bottom-centre; subtree re-enables pointer events
// (archive main is pointer-events:none so canvas drags pass through).
export default function ArchiveViewSwitcher() {
  const view = useArchiveViewStore((s) => s.view);
  const setView = useArchiveViewStore((s) => s.setView);
  const morphing = useArchiveViewStore((s) => s.isMorphing);

  return (
    <div
      role="tablist"
      aria-label="Archive view"
      data-archive-view-switcher
      style={{
        position: "fixed",
        bottom: "2vh",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: 4,
        padding: 5,
        borderRadius: 999,
        background: SWATCH_DARK_RGBA(0.4),
        backdropFilter: "blur(10px)",
        border: `1px solid ${SWATCH_LIGHT_RGBA(0.2)}`,
        pointerEvents: "auto",
        zIndex: 100,
        opacity: morphing ? 0.55 : 1,
      }}
    >
      {VIEWS.map(({ id, label }) => {
        const active = id === view;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={morphing}
            onClick={() => setView(id)}
            style={{
              appearance: "none",
              border: "none",
              borderRadius: 999,
              cursor: morphing ? "wait" : "pointer",
              padding: "0.7em 1.6em",
              fontSize: 13,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: active ? SWATCH_DARK : SWATCH_LIGHT_RGBA(0.7),
              background: active ? SWATCH_LIGHT : "transparent",
              transition: "color 0.2s, background 0.2s",
              opacity: morphing && !active ? 0.5 : 1,
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
