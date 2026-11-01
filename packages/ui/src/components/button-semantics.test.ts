import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const read = (path: string) => readFileSync(join(import.meta.dir, path), "utf8");

describe("link-rendering buttons", () => {
  test("WhatsAppButton opts out of native button semantics", () => {
    expect(read("whatsapp-button.tsx")).toContain("nativeButton={false}");
  });

  test("header WhatsApp links opt out of native button semantics", () => {
    const header = readFileSync(
      join(import.meta.dir, "../../../../apps/web/src/components/header.tsx"),
      "utf8",
    );
    const anchorsInsideButton = header.match(/render=\{\s*<a/g) ?? [];
    const optOuts = header.match(/nativeButton=\{false\}/g) ?? [];
    expect(anchorsInsideButton.length).toBeGreaterThan(0);
    expect(optOuts.length).toBe(anchorsInsideButton.length);
  });
});
