import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const read = (path: string) => readFileSync(join(import.meta.dir, path), "utf8");
const motion = read("motion.ts");

describe("visual QA scan findings", () => {
  test("filtering keeps the grid's height and reveals cards Flip brings into view", () => {
    expect(motion).toContain("absoluteOnLeave: true");
    expect(motion).not.toMatch(/Flip\.from\([\s\S]{0,200}absolute: true/);
    expect(motion).toMatch(/Flip\.from\([\s\S]*ScrollTrigger\.refresh\(\)/);
  });

  test("hidden cards do not take stagger slots", () => {
    expect(motion).toContain("getClientRects().length");
  });

  test("the featured row pins only on screens tall enough to show whole cards", () => {
    expect(motion).toMatch(/DESKTOP_MOTION_QUERY =\s*"\(min-width: 1024px\) and \(min-height: 760px\) and \(prefers-reduced-motion: no-preference\)"/);
    // Jarak geser dihitung dari lebar isi, tanpa padding kiri-kanan.
    expect(motion).toContain("paddingLeft");
  });

  test("hero titles are masked per rendered line, not per source block", () => {
    expect(motion).toMatch(/SplitText\.create\([\s\S]{0,160}mask: "lines"/);
    expect(read("../routes/index.tsx")).not.toContain("block overflow-hidden");
    expect(read("../routes/tentang.tsx")).not.toContain("block overflow-hidden");
  });

  test("page changes jump to the top instead of smooth-scrolling through the page", () => {
    expect(read("../router.tsx")).toContain('scrollRestorationBehavior: "instant"');
  });

  test("the phone clearance sits at the bottom of the footer, not between content and footer", () => {
    expect(read("../routes/__root.tsx")).not.toContain("pb-24 lg:pb-0");
    expect(read("../routes/menu/$slug.tsx")).not.toContain('className="pb-28 lg:pb-24"');
    expect(read("../components/footer.tsx")).toContain("env(safe-area-inset-bottom)");
  });

  test("safe-area insets apply on notched phones", () => {
    expect(read("../routes/__root.tsx")).toContain("viewport-fit=cover");
  });

  test("the desktop menu grid fills its rows with the six products", () => {
    expect(read("../routes/menu.index.tsx")).toContain("lg:grid-cols-3");
  });

  test("the pinned section is set up before the reveals measure positions", () => {
    const index = read("../routes/index.tsx");
    expect(index.indexOf("useFeaturedPin(pageRef)")).toBeLessThan(index.indexOf("useReveal(pageRef)"));
  });
});
