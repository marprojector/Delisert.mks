import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { MOTION_DONE_CLASS, MOTION_READY_CLASS, motionGateScript } from "./motion-gate";

/** Jalankan skrip gerbang dengan document/window palsu. */
function runGate(prefersReduced: boolean) {
  const classes = new Set<string>();
  const timers: Array<() => void> = [];
  const fakeWindow = {
    matchMedia: (query: string) => ({
      matches: query.includes("no-preference") ? !prefersReduced : prefersReduced,
    }),
    setTimeout: (fn: () => void) => {
      timers.push(fn);
      return 0;
    },
  };
  const fakeDocument = {
    documentElement: {
      classList: { add: (name: string) => classes.add(name) },
    },
  };
  new Function("window", "document", motionGateScript())(fakeWindow, fakeDocument);
  return { classes, timers };
}

describe("motion gate", () => {
  test("hides animated content before first paint only when motion is allowed", () => {
    expect(runGate(false).classes.has(MOTION_READY_CLASS)).toBe(true);
    expect(runGate(true).classes.has(MOTION_READY_CLASS)).toBe(false);
  });

  test("shows everything anyway if the animation code never starts", () => {
    const { classes, timers } = runGate(false);
    for (const timer of timers) timer();
    expect(classes.has(MOTION_DONE_CLASS)).toBe(true);
  });

  test("the stylesheet hides animated elements only behind the gate", () => {
    const css = readFileSync(join(import.meta.dir, "../index.css"), "utf8");
    // Hanya di dalam halaman yang benar-benar menjalankan animasi (data-motion-scope).
    expect(css).toContain(
      `html.${MOTION_READY_CLASS}:not(.${MOTION_DONE_CLASS}) [data-motion-scope] [data-reveal]`,
    );
  });

  test("animations start from the hidden state instead of hiding visible content", () => {
    const source = readFileSync(join(import.meta.dir, "motion.ts"), "utf8");
    // gsap.from() pada elemen yang sudah terlihat = berkedip (terlihat → hilang → muncul).
    expect(source).not.toMatch(/gsap\.from\(batch/);
    expect(source).not.toMatch(/\.from\("\[data-hero/);
  });
});

describe("motion scopes", () => {
  test("every page that marks itself as a motion scope runs the reveal hook", () => {
    const routes = ["index.tsx", "menu.index.tsx", "menu/$slug.tsx", "tentang.tsx", "jadwal.tsx", "kontak.tsx"];
    for (const route of routes) {
      const source = readFileSync(join(import.meta.dir, "../routes", route), "utf8");
      expect({ route, scope: source.includes("data-motion-scope") }).toEqual({ route, scope: true });
      expect({ route, hook: source.includes("useReveal(") }).toEqual({ route, hook: true });
    }
  });
});
