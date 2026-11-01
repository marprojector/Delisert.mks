import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { MOTION_QUERY } from "./motion";

const source = readFileSync(join(import.meta.dir, "motion.ts"), "utf8");

describe("motion module", () => {
  test("only animates when the viewer has not asked for reduced motion", () => {
    expect(MOTION_QUERY).toBe("(prefers-reduced-motion: no-preference)");
    const adds = source.match(/mm\.add\(\s*([A-Z_]+)/g) ?? [];
    expect(adds.length).toBeGreaterThanOrEqual(4);
    for (const add of adds) expect(add).toContain("MOTION_QUERY");
  });

  test("never hides content with gsap.set, so it stays visible before JS runs", () => {
    expect(source).not.toContain("gsap.set(");
  });

  test("exports the four page hooks", () => {
    for (const name of ["useReveal", "useHeroIntro", "useParallax", "useMenuOverlay"]) {
      expect(source).toContain(`export function ${name}(`);
    }
  });
});

describe("hero parallax", () => {
  test("the photo layer is taller than the distance it travels, so no empty strip shows", async () => {
    const { PARALLAX_TRAVEL_PX, parallaxOverscanPx } = await import("./motion");
    for (const strength of [1, 2]) {
      expect(parallaxOverscanPx(strength)).toBeGreaterThanOrEqual(PARALLAX_TRAVEL_PX * strength);
    }
    expect(source).toContain("clamp(");
  });
});

describe("reveal safety net", () => {
  test("content that a reveal missed is shown once scrolling settles", () => {
    expect(source).toContain("showStranded");
    expect(source).toContain('ScrollTrigger.addEventListener("scrollEnd", showStranded)');
  });
});
