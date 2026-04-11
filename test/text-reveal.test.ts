import { afterEach, describe, expect, it } from "vite-plus/test";
import {
  cleanupSplits,
  destroyRouteReveals,
  getRevealTitleCharacters,
  prepareRevealTitle,
  prepareRouteReveal,
  setRevealTitleText,
} from "../scripts/text-reveal";

afterEach(() => {
  cleanupSplits();
});

describe("text reveal titles", () => {
  it("builds overflow title wrappers and letter spans", () => {
    const title = document.createElement("h1");
    title.className = "reveal-title";
    title.textContent = "Hello";
    document.body.appendChild(title);

    const state = prepareRevealTitle(title);

    expect(state.clip.className).toBe("reveal-title-clip");
    expect(title.querySelector(".reveal-title-text")).not.toBeNull();
    expect(getRevealTitleCharacters(title)).toHaveLength(5);
    expect(title.getAttribute("aria-label")).toBe("Hello");
  });

  it("rebuilds title structure when the visible title text changes", () => {
    const title = document.createElement("h1");
    title.className = "reveal-title";
    title.textContent = "Selected Work";
    document.body.appendChild(title);

    prepareRevealTitle(title);
    setRevealTitleText(title, "money.me");

    expect(title.textContent).toBe("money.me");
    expect(getRevealTitleCharacters(title)).toHaveLength("money.me".length);
  });

  it("restores plain text content on cleanup", () => {
    const title = document.createElement("h1");
    title.className = "reveal-title";
    title.textContent = "Archive";
    document.body.appendChild(title);

    prepareRevealTitle(title);
    cleanupSplits();

    expect(title.textContent).toBe("Archive");
    expect(title.querySelector(".reveal-title-clip")).toBeNull();
    expect(title.hasAttribute("aria-label")).toBe(false);
  });

  it("prepareRouteReveal arms the page container and splits titles into lines like body", async () => {
    const main = document.createElement("main");
    main.setAttribute("data-page-container", "true");
    const title = document.createElement("h1");
    title.className = "reveal-title";
    title.textContent = "Work";
    main.appendChild(title);
    document.body.appendChild(main);

    await prepareRouteReveal(main, {});
    expect(main.getAttribute("data-text-reveal-armed")).toBe("true");
    expect(title.querySelectorAll(".reveal-line").length).toBeGreaterThanOrEqual(1);

    destroyRouteReveals();
    cleanupSplits();
  });
});
