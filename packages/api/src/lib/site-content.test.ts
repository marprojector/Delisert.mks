import { describe, expect, test } from "bun:test";

import { DEFAULT_SITE_CONTENT, resolveSiteContent, siteContentSchema } from "./site-content";

describe("site content", () => {
  test("defaults are valid and keep the copy the site already shows", () => {
    expect(siteContentSchema.safeParse(DEFAULT_SITE_CONTENT).success).toBe(true);
    expect(DEFAULT_SITE_CONTENT.schedule.cfdHours).toBe("06.00 – 10.00 WITA");
    expect(DEFAULT_SITE_CONTENT.schedule.addressNote).toContain("Bukan toko ritel publik");
    expect(DEFAULT_SITE_CONTENT.home.featuredEyebrow).toBe("Menu Andalan");
  });

  test("a stored section overrides only the fields it has", () => {
    const content = resolveSiteContent([
      { key: "home", value: JSON.stringify({ heroTitleLine1: "Dessert baru," }) },
    ]);
    expect(content.home.heroTitleLine1).toBe("Dessert baru,");
    expect(content.home.heroTitleLine2).toBe(DEFAULT_SITE_CONTENT.home.heroTitleLine2);
    expect(content.about).toEqual(DEFAULT_SITE_CONTENT.about);
  });

  test("broken or invalid rows fall back to the defaults instead of breaking the site", () => {
    const content = resolveSiteContent([
      { key: "brand", value: "{not json" },
      { key: "schedule", value: JSON.stringify({ week: ["live"] }) },
      { key: "unknown", value: "{}" },
    ]);
    expect(content.brand).toEqual(DEFAULT_SITE_CONTENT.brand);
    expect(content.schedule.week).toHaveLength(7);
  });

  test("rejects a WhatsApp number that is not in 62 format", () => {
    const result = siteContentSchema.shape.brand.safeParse({
      ...DEFAULT_SITE_CONTENT.brand,
      whatsappNumber: "085190021421",
    });
    expect(result.success).toBe(false);
  });
});
