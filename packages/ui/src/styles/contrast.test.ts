import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const css = readFileSync(join(import.meta.dir, "globals.css"), "utf8");

/** Ambil token dari blok :root (bukan .dark). */
function token(name: string): [number, number, number] {
  const rootStart = css.indexOf(":root {");
  const rootEnd = css.indexOf("\n.dark {", rootStart);
  if (rootStart === -1 || rootEnd === -1) throw new Error(":root block not found");
  const rootBlock = css.slice(rootStart, rootEnd);
  const match = rootBlock.match(new RegExp(`${name}:\\s*oklch\\(([^)]+)\\)`));
  if (!match) throw new Error(`token ${name} not found in :root`);
  const parts = match[1]!.trim().split(/\s+/).map(Number);
  return [parts[0]!, parts[1]!, parts[2]!];
}

const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

function toHex(L: number, C: number, H: number): string {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const rgb = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return (
    "#" +
    rgb
      .map((v) => {
        const clamped = Math.max(0, Math.min(1, v));
        const srgb =
          clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * clamped ** (1 / 2.4) - 0.055;
        return Math.round(255 * srgb)
          .toString(16)
          .padStart(2, "0");
      })
      .join("")
  );
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => lin(parseInt(hex.slice(i, i + 2), 16) / 255));
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

const hex = (t: [number, number, number]) => toHex(t[0], t[1], t[2]);

describe("brand palette", () => {
  test("primary is rosewood, not olive", () => {
    const [, C, H] = token("--primary");
    // Rosewood (#8c3b44) sits near hue 16deg; the previous value was 104deg (olive).
    expect(H).toBeLessThan(40);
    expect(C).toBeGreaterThan(0.08);
  });

  test("primary on background passes AA", () => {
    expect(contrast(hex(token("--primary")), hex(token("--background")))).toBeGreaterThanOrEqual(
      4.5,
    );
  });

  test("body text on background passes AAA", () => {
    expect(contrast(hex(token("--foreground")), hex(token("--background")))).toBeGreaterThanOrEqual(
      7,
    );
  });

  test("muted text on background passes AA", () => {
    expect(
      contrast(hex(token("--muted-foreground")), hex(token("--background"))),
    ).toBeGreaterThanOrEqual(4.5);
  });
});
