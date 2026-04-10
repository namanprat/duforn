import { describe, expect, it } from "vite-plus/test";
import { crossesArchive } from "../src/lib/animation/archiveBurnRoute.js";

describe("crossesArchive", () => {
  it("returns false when namespaces are equal", () => {
    expect(crossesArchive("archive", "archive")).toBe(false);
    expect(crossesArchive("home", "home")).toBe(false);
  });

  it("returns false when either namespace is missing", () => {
    expect(crossesArchive("", "archive")).toBe(false);
    expect(crossesArchive("home", "")).toBe(false);
  });

  it("returns true when entering archive from another namespace", () => {
    expect(crossesArchive("home", "archive")).toBe(true);
    expect(crossesArchive("work", "archive")).toBe(true);
  });

  it("returns true when leaving archive", () => {
    expect(crossesArchive("archive", "home")).toBe(true);
    expect(crossesArchive("archive", "projectDetail")).toBe(true);
  });

  it("returns false for transitions that do not involve archive", () => {
    expect(crossesArchive("home", "work")).toBe(false);
    expect(crossesArchive("contact", "projectDetail")).toBe(false);
  });
});
