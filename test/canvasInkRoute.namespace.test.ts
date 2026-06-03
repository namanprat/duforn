import { describe, expect, it } from "vite-plus/test";
import { getRouteInkNamespace } from "../src/lib/ink/route";

describe("getRouteInkNamespace", () => {
  it("maps / to the main namespace", () => {
    expect(getRouteInkNamespace("/")).toBe("main");
  });

  it("maps /test to the water test namespace", () => {
    expect(getRouteInkNamespace("/test")).toBe("test");
  });
});
