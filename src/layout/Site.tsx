import { Outlet } from "react-router-dom";
import SceneCanvas from "../scenes/SceneCanvas";
import Nav from "./Nav";
import PreloadOverlay from "../scenes/preloader/PreloadOverlay";
import RouteTransitionOverlay from "../components/RouteTransitionOverlay";
import { ProjectCanvasAnchorProvider } from "../projectDetail/ProjectCanvasAnchor";

/**
 * Persistent site shell. The 3D canvas is mounted once here so it survives route
 * changes (the camera tweens between rooms instead of remounting). Route DOM
 * renders above it through the router Outlet.
 */
export default function SiteLayout() {
  return (
    <ProjectCanvasAnchorProvider>
      <div className="site_wrap">
        <SceneCanvas />
        <PreloadOverlay />
        <RouteTransitionOverlay />
        <Nav />
        <div className="site_content">
          <Outlet />
        </div>
      </div>
    </ProjectCanvasAnchorProvider>
  );
}
