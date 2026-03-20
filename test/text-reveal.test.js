import { afterEach, describe, expect, it } from "vitest";
import {
  cleanupSplits,
  getRevealTitleCharacters,
  prepareRevealTitle,
  setRevealTitleText,
} from "../scripts/text-reveal.js";

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

    expect(state.clip.className).toBe("reveal-title__clip");
    expect(title.querySelector(".reveal-title__text")).not.toBeNull();
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
    expect(title.querySelector(".reveal-title__clip")).toBeNull();
    expect(title.hasAttribute("aria-label")).toBe(false);
  });
});
