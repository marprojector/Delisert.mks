import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { AnimatedPrice } from "../components/animated-price";
import { countUpStart } from "./motion";

const read = (path: string) => readFileSync(join(import.meta.dir, path), "utf8");

describe("count-up numbers", () => {
  test("a year climbs the last two decades; small counts climb from zero", () => {
    expect(countUpStart(2021)).toBe(2001);
    expect(countUpStart(8)).toBe(0);
    expect(countUpStart(6)).toBe(0);
  });
});

describe("AnimatedPrice", () => {
  test("renders the final price on the server, so crawlers and no-JS visitors see it", () => {
    expect(renderToStaticMarkup(<AnimatedPrice cents={8000} />)).toContain("Rp 8.000");
    expect(renderToStaticMarkup(<AnimatedPrice cents={null} />)).toContain("Harga menyusul");
  });
});

describe("scroll storytelling", () => {
  const motion = read("motion.ts");

  test("splits the hero title into letters only inside the motion gate", () => {
    expect(motion).toContain("SplitText.create(");
    expect(motion).toMatch(/mm\.add\(\s*MOTION_QUERY[\s\S]*SplitText\.create\(/);
  });

  test("pins the featured row only on desktop", () => {
    expect(motion).toContain('DESKTOP_MOTION_QUERY = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)"');
    expect(motion).toMatch(/mm\.add\(\s*DESKTOP_MOTION_QUERY[\s\S]*pin: true/);
  });

  test("the homepage marks the pinned section and the about page marks counters", () => {
    expect(read("../routes/index.tsx")).toContain("data-pin-track");
    expect(read("../routes/tentang.tsx")).toContain("data-count-to");
  });
});

describe("responsive menu and detail", () => {
  test("switching category moves cards with Flip instead of rebuilding the grid", () => {
    const menu = read("../routes/menu.index.tsx");
    expect(menu).toContain("useFlipFilter(");
    expect(menu).not.toContain("key={activeCategory");
    expect(read("motion.ts")).toContain("Flip.from(");
  });

  test("the detail page animates the price and slides the order bar in", () => {
    const detail = read("../routes/menu/$slug.tsx");
    expect(detail).toContain("<AnimatedPrice");
    expect(read("../../../../packages/ui/src/components/sticky-order-bar.tsx")).toContain("data-slide-up");
    expect(read("../index.css")).toContain("[data-slide-up]");
  });
});
