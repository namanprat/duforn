import type { RouteNamespace } from "./routes";

export type RendererType = "webgpu" | "webgl" | "unknown";

export interface WebglState {
  activePage: RouteNamespace;
  rendererType: RendererType;
  gyroEnabled: boolean;
  setActivePage: (page: RouteNamespace) => void;
  setRendererType: (rendererType: RendererType) => void;
  setGyroEnabled: (gyroEnabled: boolean) => void;
}
