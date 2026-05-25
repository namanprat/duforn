import { describe, expect, it } from "vite-plus/test";
import { getRouteInkNamespace } from "../src/lib/ink/route";

describe("getRouteInkNamespace", () => {
  it("maps / to the main namespace", () => {
    expect(getRouteInkNamespace("/")).toBe("main");
  });

  it("no longer recognises /test", () => {
    expect(getRouteInkNamespace("/test")).toBe("notFound");
  });
});
