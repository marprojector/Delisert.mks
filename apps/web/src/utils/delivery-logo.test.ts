import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";

import { deliveryLogo } from "./delivery-logo";

describe("deliveryLogo", () => {
  test("matches the default delivery names to their official logos", () => {
    expect(deliveryLogo("Gojek / GoSend")?.src).toBe("/logos/gojek.svg");
    expect(deliveryLogo("GrabExpress")?.src).toBe("/logos/grab.svg");
    expect(deliveryLogo("Maxim")?.src).toBe("/logos/maxim.svg");
    expect(deliveryLogo("Shopee")?.src).toBe("/logos/shopee.svg");
    expect(deliveryLogo("gosend instan")?.src).toBe("/logos/gojek.svg");
  });

  test("unknown services have no logo (shown as text)", () => {
    expect(deliveryLogo("Lalamove")).toBeNull();
  });

  test("every logo file exists in public/", () => {
    for (const name of ["Gojek", "Grab", "Maxim", "Shopee"]) {
      const src = deliveryLogo(name)!.src;
      expect(existsSync(join(import.meta.dir, "../../public", src))).toBe(true);
    }
  });
});
