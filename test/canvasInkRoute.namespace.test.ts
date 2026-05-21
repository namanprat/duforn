import { describe, expect, it } from "vite-plus/test";
import { getRouteInkNamespace } from "../src/lib/canvasInkRoute";

describe("getRouteInkNamespace", () => {
  it("maps / to the main namespace", () => {
    expect(getRouteInkNamespace("/")).toBe("main");
  });

  it("maps /old to the old namespace", () => {
    expect(getRouteInkNamespace("/old")).toBe("old");
  });

  it("no longer recognises /test", () => {
    expect(getRouteInkNamespace("/test")).toBe("notFound");
  });
});
