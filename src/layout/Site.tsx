import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import SceneCanvas from "../scenes/SceneCanvas";
import ProjectDetailCanvas from "../scenes/ProjectDetailCanvas";
import Nav from "./Nav";
import { useWebglStore } from "../store/webgl";
import { destroyLinkHover, initLinkHover } from "../lib/link-hover";
import { destroyButtonHoverScale, initButtonHoverScale } from "../lib/button-hover-scale";
import "../styles/pages.css";

/**
 * Persistent site shell. The 3D canvas is mounted once here so it survives route
 * changes (the camera tweens between rooms instead of remounting). Route DOM
 * renders above it through the router Outlet.
 */
export default function SiteLayout() {
  const location = useLocation();
  const activePage = useWebglStore((s) => s.activePage);
  const showRoomCanvas = activePage !== "projectDetail";
  const showProjectCanvas = activePage === "projectDetail";

  useEffect(() => {
    initLinkHover();
    initButtonHoverScale();
    return () => {
      destroyLinkHover();
      destroyButtonHoverScale();
    };
  }, [location.pathname]);

  return (
    <div className="site_wrap">
      {showRoomCanvas ? <SceneCanvas /> : null}
      {showProjectCanvas ? <ProjectDetailCanvas /> : null}
      <Nav />
      <div className="site_content">
        <Outlet />
      </div>
    </div>
  );
}
