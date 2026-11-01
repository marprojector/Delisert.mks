import { describe, expect, test } from "bun:test";
import { MAX_IMAGE_BYTES, photoKeysForUrl, sizedPhotoKey, validateImageUpload } from "./image";

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

  test("rejects traversal filenames before generating an R2 key", () => {
    const result = validateImageUpload({
      filename: "../../etc/passwd.jpg",
      contentType: "image/jpeg",
      size: 1024,
    });
    expect(result).toEqual({ ok: false, reason: "Nama file tidak valid." });
  });

  test("rejects an empty file", () => {
    expect(validateImageUpload({ ...base, size: 0 }).ok).toBe(false);
  });
});

describe("photoKeysForUrl", () => {
  const ID = "0f8fad5b-d9cb-469f-a165-70867728950e";

  test("returns every size of a sized photo", () => {
    expect(photoKeysForUrl(`/api/photos/products/${ID}-w1600.webp`)).toEqual([
      `products/${ID}-w480.webp`,
      `products/${ID}-w960.webp`,
      `products/${ID}-w1600.webp`,
    ]);
  });

  test("returns the single key of an older photo", () => {
    expect(photoKeysForUrl(`/api/photos/products/${ID}.jpg`)).toEqual([`products/${ID}.jpg`]);
  });

  test("never returns keys for external or traversal URLs", () => {
    expect(photoKeysForUrl("https://example.com/a.jpg")).toEqual([]);
    expect(photoKeysForUrl("/api/photos/products/../secret")).toEqual([]);
  });

  test("builds sized keys", () => {
    expect(sizedPhotoKey(ID, 960, "webp")).toBe(`products/${ID}-w960.webp`);
  });
});
