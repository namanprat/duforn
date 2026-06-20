import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type ProjectCanvasAnchorId = "cover" | "strips";

type AnchorContextValue = {
  getAnchor: (id: ProjectCanvasAnchorId) => HTMLDivElement | null;
  anchorVersion: number;
  setAnchorNode: (id: ProjectCanvasAnchorId, node: HTMLDivElement | null) => void;
};

const ProjectCanvasAnchorContext = createContext<AnchorContextValue | null>(null);

export function ProjectCanvasAnchorProvider({ children }: { children: ReactNode }) {
  const anchorsRef = useRef<Partial<Record<ProjectCanvasAnchorId, HTMLDivElement | null>>>({});
  const [anchorVersion, setAnchorVersion] = useState(0);

  const setAnchorNode = useCallback((id: ProjectCanvasAnchorId, node: HTMLDivElement | null) => {
    if (node) {
      anchorsRef.current[id] = node;
    } else if (anchorsRef.current[id]) {
      delete anchorsRef.current[id];
    }
    setAnchorVersion((v) => v + 1);
  }, []);

  const getAnchor = useCallback((id: ProjectCanvasAnchorId) => anchorsRef.current[id] ?? null, []);

  const value = useMemo<AnchorContextValue>(
    () => ({ getAnchor, anchorVersion, setAnchorNode }),
    [getAnchor, anchorVersion, setAnchorNode],
  );

  return (
    <ProjectCanvasAnchorContext.Provider value={value}>
      {children}
    </ProjectCanvasAnchorContext.Provider>
  );
}

export function useProjectCanvasAnchor(id: ProjectCanvasAnchorId) {
  const ctx = useContext(ProjectCanvasAnchorContext);
  if (!ctx) {
    throw new Error("useProjectCanvasAnchor must be used within ProjectCanvasAnchorProvider");
  }

  const getAnchor = useCallback(() => ctx.getAnchor(id), [ctx, id]);

  return { getAnchor, anchorVersion: ctx.anchorVersion };
}

function useRegisterAnchor(id: ProjectCanvasAnchorId) {
  const ctx = useContext(ProjectCanvasAnchorContext);
  if (!ctx) {
    throw new Error("Project canvas anchor shells require ProjectCanvasAnchorProvider");
  }

  const localRef = useRef<HTMLDivElement | null>(null);
  const { setAnchorNode } = ctx;

  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      localRef.current = node;
      setAnchorNode(id, node);
    },
    [id, setAnchorNode],
  );

  return { setRef, localRef };
}

/** Layout hole for the hero cover image. Reserves DOM space at the image's
 *  aspect ratio; the unified canvas draws the texture into this rect. */
export function ProjectCoverAnchor({ src }: { src: string }) {
  const { setRef, localRef } = useRegisterAnchor("cover");

  useEffect(() => {
    const el = localRef.current;
    if (!el) return;

    const img = new Image();
    img.decoding = "async";
    img.src = src;
    img.onload = () => {
      if (!img.naturalWidth || !img.naturalHeight) return;
      el.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
    };
  }, [localRef, src]);

  return <div ref={setRef} data-project-cover="true" />;
}

/** Layout hole for the scroll-linked strip section. */
export function ProjectStripsAnchor() {
  const { setRef } = useRegisterAnchor("strips");
  return <div ref={setRef} data-money-me-strip="true" />;
}

/** @deprecated Use ProjectCanvasAnchorProvider */
export const MoneyMeStripAnchorProvider = ProjectCanvasAnchorProvider;

/** @deprecated Use ProjectStripsAnchor */
export default ProjectStripsAnchor;
