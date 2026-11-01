import { describe, expect, test } from "bun:test";
import { MAX_IMAGE_BYTES, validateImageUpload } from "./image";

const base = { filename: "mochi.jpg", contentType: "image/jpeg", size: 1024 };

describe("validateImageUpload", () => {
  test("accepts a normal jpeg", () => {
    const result = validateImageUpload(base);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.key).toMatch(/^products\/[0-9a-f-]{36}\.jpg$/);
  });

  test("accepts png and webp", () => {
    expect(validateImageUpload({ ...base, contentType: "image/png" }).ok).toBe(true);
    expect(validateImageUpload({ ...base, contentType: "image/webp" }).ok).toBe(true);
  });

  test("rejects a non-image type", () => {
    const result = validateImageUpload({ ...base, contentType: "application/pdf" });
    expect(result.ok).toBe(false);
  });

  test("rejects an svg, which can carry script", () => {
    expect(validateImageUpload({ ...base, contentType: "image/svg+xml" }).ok).toBe(false);
  });

  test("rejects a file over the size limit", () => {
    expect(validateImageUpload({ ...base, size: MAX_IMAGE_BYTES + 1 }).ok).toBe(false);
  });

  test("never puts the user filename in the key", () => {
    const result = validateImageUpload({
      filename: "../../etc/passwd.jpg",
      contentType: "image/jpeg",
      size: 1024,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.key).not.toContain("..");
      expect(result.key).not.toContain("passwd");
    }
  });

  test("rejects an empty file", () => {
    expect(validateImageUpload({ ...base, size: 0 }).ok).toBe(false);
  });
});
